"use server";

import { db } from "@/lib/drizzle/db";
import {
	PrimaryLift,
	Status,
	exerciseDefinitions,
	exercises,
	workouts,
} from "@/lib/drizzle/schemas/strength-training";
import { eq } from "drizzle-orm";

const WORKOUT_SEQUENCE = [
	PrimaryLift.Squat,
	PrimaryLift.Bench,
	PrimaryLift.Deadlift,
	PrimaryLift.Overhead,
] as const;

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

	return {
		workouts: createdWorkouts,
		exercises: createdExercises,
	};
}
