"use server";

import { db } from "@/drizzle/db";
import {
	type ExerciseDefinitionsSelect,
	type SetsSelect,
	type WorkoutsSelect,
	exerciseDefinitions,
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export type WorkoutDetails = WorkoutsSelect & {
	exercises: Array<{
		definition: ExerciseDefinitionsSelect;
		exercise: typeof exercises.$inferSelect;
		sets: Array<SetsSelect>;
	}>;
};

export async function getWorkoutDetails(
	workoutId: string,
): Promise<WorkoutDetails | null> {
	// Get the workout
	const [workout] = await db
		.select()
		.from(workouts)
		.where(eq(workouts.id, workoutId));

	if (!workout) {
		return null;
	}

	// Get exercises with their definitions and sets
	const workoutExercises = await db
		.select({
			exercise: exercises,
			definition: exerciseDefinitions,
		})
		.from(exercises)
		.where(eq(exercises.workoutId, workoutId))
		.innerJoin(
			exerciseDefinitions,
			eq(exercises.exerciseDefinitionId, exerciseDefinitions.id),
		)
		.orderBy(exercises.order);

	// Get sets for each exercise
	const exerciseSets = await Promise.all(
		workoutExercises.map(async ({ exercise }) => {
			const exerciseSets = await db
				.select()
				.from(sets)
				.where(eq(sets.exerciseId, exercise.id))
				.orderBy(sets.setNumber);

			return exerciseSets;
		}),
	);

	// Format the data for the WorkoutCard component
	return {
		...workout,
		exercises: workoutExercises.map(({ exercise, definition }, index) => ({
			definition,
			exercise,
			sets: exerciseSets[index],
		})),
	};
}
