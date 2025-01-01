"use server";

import { db } from "@/drizzle/db";
import { createSets } from "@/drizzle/modules/strength-training/functions/sets/createSets";
import {
	ExerciseCategory,
	ExerciseType,
	PrimaryLift,
	Status,
	exerciseDefinitions,
	exercises,
	oneRepMaxes,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { and, eq } from "drizzle-orm";

const WORKOUT_SEQUENCE = [
	PrimaryLift.Squat,
	PrimaryLift.Bench,
	PrimaryLift.Deadlift,
	PrimaryLift.Overhead,
] as const;

// Define the exercise categories for each day
const WORKOUT_CATEGORIES = {
	[PrimaryLift.Squat]: [
		ExerciseCategory.MainLift,
		ExerciseCategory.MainLiftVariation,
		ExerciseCategory.CompoundLeg,
		// ExerciseCategory.QuadAccessory,
		// ExerciseCategory.HamstringGluteAccessory,
		// ExerciseCategory.CalfAccessory,
	],
	[PrimaryLift.Bench]: [
		ExerciseCategory.MainLift,
		ExerciseCategory.MainLiftVariation,
		ExerciseCategory.ChestAccessory,
		// ExerciseCategory.ChestAccessory,
		// ExerciseCategory.TricepAccessory,
		// ExerciseCategory.TricepAccessory,
	],
	[PrimaryLift.Deadlift]: [
		ExerciseCategory.MainLift,
		ExerciseCategory.MainLiftVariation,
		ExerciseCategory.VerticalPullAccessory,
		// ExerciseCategory.LateralPullAccessory,
		// ExerciseCategory.BicepAccessory,
		// ExerciseCategory.BicepAccessory,
	],
	[PrimaryLift.Overhead]: [
		ExerciseCategory.MainLift,
		ExerciseCategory.DeltAccessory,
		ExerciseCategory.DeltAccessory,
		// ExerciseCategory.DeltAccessory,
		// ExerciseCategory.TricepAccessory,
		// ExerciseCategory.BicepAccessory,
	],
} as const;

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
			sequence: index + 1,
		};
	});

	const createdWorkouts = await db
		.insert(workouts)
		.values(workoutValues)
		.returning();

	// For each workout, create its exercises and sets
	const exercisePromises = createdWorkouts.map(
		async (workout, workoutIndex) => {
			// Get the categories for this workout day
			const categories = WORKOUT_CATEGORIES[workout.primaryLift];
			console.log(
				`Creating exercises for ${workout.primaryLift} day with categories:`,
				categories,
			);

			// Get all exercise definitions for this primary lift day
			const dayExerciseDefinitions = await db
				.select()
				.from(exerciseDefinitions)
				.where(eq(exerciseDefinitions.primaryLiftDay, workout.primaryLift));

			console.log(
				`Found ${dayExerciseDefinitions.length} exercise definitions for ${workout.primaryLift} day:`,
				dayExerciseDefinitions.map((d) => ({
					name: d.name,
					category: d.category,
				})),
			);

			// Create exercises for each category
			const exerciseValues = categories.map((category, order) => {
				// Find an exercise definition that matches this category
				const definition = dayExerciseDefinitions.find(
					(def) => def.category === category,
				);

				console.log(
					`Looking for exercise in category ${category}:`,
					definition ? definition.name : "Not found",
				);

				if (!definition) {
					throw new Error(
						`No exercise definition found for category ${category} on ${workout.primaryLift} day`,
					);
				}

				return {
					userId,
					workoutId: workout.id,
					exerciseDefinitionId: definition.id,
					order: order + 1,
					status: Status.Pending,
				};
			});

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
					definition,
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
