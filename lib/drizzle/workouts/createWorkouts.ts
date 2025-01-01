"use server";

import { db } from "@/lib/drizzle/db";
import {
	PrimaryLift,
	Status,
	exerciseDefinitions,
	exercises,
	sets,
	workouts,
} from "@/lib/drizzle/schemas/strength-training";
import { eq } from "drizzle-orm";

const WORKOUT_SEQUENCE = [
	PrimaryLift.Squat,
	PrimaryLift.Bench,
	PrimaryLift.Deadlift,
	PrimaryLift.Overhead,
] as const;

const SETS_PER_EXERCISE = 5;

// Mock data generator for sets
function generateSetData(setNumber: number) {
	// These are placeholder values - we'll make them more realistic later
	return {
		weight: Math.floor(Math.random() * 200) + 100, // Random weight between 100-300 lbs
		reps: Math.floor(Math.random() * 3) + 3, // Random reps between 3-5
		rpe: Math.floor(Math.random() * 2) + 7, // Random RPE between 7-8
		percentageOfMax: Math.floor(Math.random() * 20) + 70, // Random percentage between 70-90%
		setNumber,
		status: Status.Pending,
	};
}

export async function createWorkouts(
	userId: string,
	cycleId: string,
	startDate: Date,
	totalWorkouts = 16,
) {
	// First create the workouts
	const workoutValues = Array.from({
		length: totalWorkouts,
	}).map((_, index) => {
		const workoutDate = new Date(startDate);
		workoutDate.setDate(startDate.getDate() + index * 2);

		return {
			userId,
			cycleId,
			date: workoutDate,
			primaryLift: WORKOUT_SEQUENCE[index % WORKOUT_SEQUENCE.length],
			status: Status.Pending,
		};
	});

	const createdWorkouts = await db
		.insert(workouts)
		.values(workoutValues)
		.returning();

	// For each workout, create its primary exercise
	const exerciseValues = await Promise.all(
		createdWorkouts.map(async (workout) => {
			// Find the corresponding exercise definition
			const [exerciseDefinition] = await db
				.select()
				.from(exerciseDefinitions)
				.where(eq(exerciseDefinitions.primaryLiftDay, workout.primaryLift));

			if (!exerciseDefinition) {
				throw new Error(
					`No exercise definition found for ${workout.primaryLift}`,
				);
			}

			return {
				userId,
				workoutId: workout.id,
				exerciseDefinitionId: exerciseDefinition.id,
				order: 1, // Primary lift is always first
				status: Status.Pending,
			};
		}),
	);

	const createdExercises = await db
		.insert(exercises)
		.values(exerciseValues)
		.returning();

	// Create sets for each exercise
	const setValues = createdExercises.flatMap((exercise) =>
		Array.from({ length: SETS_PER_EXERCISE }).map((_, index) => ({
			userId,
			exerciseId: exercise.id,
			...generateSetData(index + 1),
		})),
	);

	const createdSets = await db.insert(sets).values(setValues).returning();

	return {
		workouts: createdWorkouts,
		exercises: createdExercises,
		sets: createdSets,
	};
}
