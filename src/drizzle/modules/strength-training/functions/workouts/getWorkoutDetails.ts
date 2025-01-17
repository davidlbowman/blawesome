import { db } from "@/drizzle/db";
import {
	exerciseDefinitions,
	exerciseDefinitionsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import type { ExerciseDefinitionsSelect } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import {
	exercises,
	exercisesSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/exercises";
import type { ExercisesSelect } from "@/drizzle/modules/strength-training/schemas/exercises";
import {
	sets,
	setsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/sets";
import type { SetsSelect } from "@/drizzle/modules/strength-training/schemas/sets";
import {
	workouts,
	workoutsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/workouts";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
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
	return await db.transaction(async (tx) => {
		// If cycleId is provided, get active workouts first
		let workout: WorkoutsSelect | null = null;
		let targetWorkoutId = workoutId;

		if (cycleId) {
			const cycleWorkouts = await tx
				.select()
				.from(workouts)
				.where(eq(workouts.cycleId, cycleId))
				.orderBy(workouts.sequence);

			// Parse workouts through schema
			const parsedWorkouts = cycleWorkouts.map((w) =>
				workoutsSelectSchema.parse(w),
			);

			// Find the next pending workout if workoutId isn't provided
			if (!targetWorkoutId) {
				const nextWorkout = parsedWorkouts.find(
					(w) => w.status === Status.Enum.pending,
				);
				if (!nextWorkout) return null;
				workout = nextWorkout;
				targetWorkoutId = nextWorkout.id;
			}
		}

		// If we don't have the workout yet, get it directly
		if (!workout && targetWorkoutId) {
			const result = await tx
				.select()
				.from(workouts)
				.where(eq(workouts.id, targetWorkoutId));

			if (!result[0]) return null;
			workout = workoutsSelectSchema.parse(result[0]);
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
				.select()
				.from(sets)
				.innerJoin(exercises, eq(sets.exerciseId, exercises.id))
				.where(eq(exercises.workoutId, targetWorkoutId))
				.orderBy(sets.setNumber),
		]);

		// Parse results through their respective schemas
		const parsedSets = allSets.map((set) => setsSelectSchema.parse(set));

		// Group sets by exercise ID
		const setsByExerciseId = parsedSets.reduce(
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

		// Parse and format the final result
		return {
			...workout,
			exercises: exerciseResults.map(({ exercise, definition }) => ({
				definition: exerciseDefinitionsSelectSchema.parse(definition),
				exercise: exercisesSelectSchema.parse(exercise),
				sets: exercise.id ? setsByExerciseId[exercise.id] || [] : [],
			})),
		};
	});
}
