"use server";

import { db } from "@/drizzle/db";
import {
	type ExerciseDefinitionsSelect,
	type ExercisesSelect,
	type SetsSelect,
	type WorkoutsSelect,
	exerciseDefinitions,
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export type WorkoutDetails = WorkoutsSelect & {
	exercises: {
		definition: ExerciseDefinitionsSelect;
		exercise: ExercisesSelect;
		sets: SetsSelect[];
	}[];
};

export async function getWorkoutDetails(
	workoutId: string | undefined,
	cycleId?: string,
): Promise<WorkoutDetails | null> {
	return await db.transaction(
		async (tx) => {
			// If cycleId is provided, get active workouts first
			let workout: WorkoutsSelect | null = null;
			let targetWorkoutId = workoutId;

			if (cycleId) {
				const cycleWorkouts = await tx
					.select()
					.from(workouts)
					.where(eq(workouts.cycleId, cycleId))
					.orderBy(workouts.sequence);

				// Find the next pending workout if workoutId isn't provided
				if (!targetWorkoutId) {
					const nextWorkout = cycleWorkouts.find((w) => w.status === "pending");
					if (!nextWorkout) return null;
					workout = nextWorkout;
					targetWorkoutId = nextWorkout.id;
				}
			}

			// If we don't have the workout yet, get it directly
			if (!workout && targetWorkoutId) {
				[workout] = await tx
					.select()
					.from(workouts)
					.where(eq(workouts.id, targetWorkoutId));

				if (!workout) return null;
			}

			if (!workout || !targetWorkoutId) return null;

			// Get all exercises with their definitions and sets in parallel
			const [exerciseResults, allSets] = await Promise.all([
				tx
					.select({
						exercise: exercises,
						definition: exerciseDefinitions,
					})
					.from(exercises)
					.where(eq(exercises.workoutId, targetWorkoutId))
					.innerJoin(
						exerciseDefinitions,
						eq(exercises.exerciseDefinitionId, exerciseDefinitions.id),
					)
					.orderBy(exercises.order),
				tx
					.select({
						id: sets.id,
						exerciseId: sets.exerciseId,
						userId: sets.userId,
						weight: sets.weight,
						reps: sets.reps,
						rpe: sets.rpe,
						percentageOfMax: sets.percentageOfMax,
						setNumber: sets.setNumber,
						status: sets.status,
						createdAt: sets.createdAt,
						updatedAt: sets.updatedAt,
						completedAt: sets.completedAt,
					})
					.from(sets)
					.innerJoin(exercises, eq(sets.exerciseId, exercises.id))
					.where(eq(exercises.workoutId, targetWorkoutId))
					.orderBy(sets.setNumber),
			]);

			// Group sets by exercise ID for efficient lookup
			const setsByExerciseId = allSets.reduce(
				(acc, set) => {
					const exerciseId = set.exerciseId;
					if (exerciseId) {
						if (!acc[exerciseId]) {
							acc[exerciseId] = [];
						}
						acc[exerciseId].push(set);
					}
					return acc;
				},
				{} as Record<string, SetsSelect[]>,
			);

			// Format the data for the WorkoutCard component
			return {
				...workout,
				exercises: exerciseResults.map(({ exercise, definition }) => ({
					definition,
					exercise,
					sets: exercise.id ? setsByExerciseId[exercise.id] || [] : [],
				})),
			};
		},
		{
			accessMode: "read only",
			isolationLevel: "repeatable read",
		},
	);
}
