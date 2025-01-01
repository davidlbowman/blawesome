"use server";

import { db } from "@/lib/drizzle/db";
import {
	ExerciseType,
	PrimaryLift,
	Status,
	exerciseDefinitions,
	exercises,
	oneRepMaxes,
	workouts,
} from "@/lib/drizzle/schemas/strength-training";
import { and, eq } from "drizzle-orm";
import { createSets } from "../sets/createSets";

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

	// For each workout, create its exercises and sets
	const exercisePromises = createdWorkouts.map(
		async (workout, workoutIndex) => {
			// Get all exercise definitions for this primary lift day
			const dayExerciseDefinitions = await db
				.select()
				.from(exerciseDefinitions)
				.where(eq(exerciseDefinitions.primaryLiftDay, workout.primaryLift));

			// Create exercises for each definition
			const exerciseValues = dayExerciseDefinitions.map((def, order) => ({
				userId,
				workoutId: workout.id,
				exerciseDefinitionId: def.id,
				order: order + 1,
				status: Status.Pending,
			}));

			const createdExercises = await db
				.insert(exercises)
				.values(exerciseValues)
				.returning();

			// Create sets for each exercise
			const setPromises = createdExercises.map(async (exercise) => {
				const definition = dayExerciseDefinitions.find(
					(def) => def.id === exercise.exerciseDefinitionId,
				);

				if (!definition) {
					throw new Error(
						`No exercise definition found for ${exercise.exerciseDefinitionId}`,
					);
				}

				// Get 1RM if it's a primary lift
				const oneRepMaxRows =
					definition.type === ExerciseType.Primary
						? await db
								.select()
								.from(oneRepMaxes)
								.where(
									and(
										eq(oneRepMaxes.exerciseDefinitionId, definition.id),
										eq(oneRepMaxes.userId, userId),
									),
								)
						: [];

				const oneRepMax = oneRepMaxRows[0]?.weight ?? null;

				return createSets(
					userId,
					exercise,
					definition.type as (typeof ExerciseType)[keyof typeof ExerciseType],
					workoutIndex,
					oneRepMax,
				);
			});

			const createdSets = await Promise.all(setPromises);
			return { exercises: createdExercises, sets: createdSets.flat() };
		},
	);

	const results = await Promise.all(exercisePromises);

	return {
		workouts: createdWorkouts,
		exercises: results.flatMap((r) => r.exercises),
		sets: results.flatMap((r) => r.sets),
	};
}
