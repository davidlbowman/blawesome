import { db } from "@/drizzle/db";
import {
	type ExerciseDefinitionsSelect,
	exerciseDefinitions,
} from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import {
	type ExercisesSelect,
	exercises,
} from "@/drizzle/modules/strength-training/schemas/exercises";
import {
	type SetsSelect,
	sets,
} from "@/drizzle/modules/strength-training/schemas/sets";
import {
	type WorkoutsSelect,
	workouts,
} from "@/drizzle/modules/strength-training/schemas/workouts";
import type {
	ExerciseType,
	Status,
} from "@/drizzle/modules/strength-training/types";
import { eq } from "drizzle-orm";

interface ExerciseWithDefinition {
	exercise: Pick<ExercisesSelect, "id" | "order"> & {
		status: Status;
	};
	definition: Pick<ExerciseDefinitionsSelect, "id" | "name"> & {
		type: ExerciseType;
		rpeMax: number;
		repMax: number;
	};
	sets: Array<
		Pick<
			SetsSelect,
			"id" | "setNumber" | "weight" | "reps" | "rpe" | "percentageOfMax"
		> & {
			status: Status;
		}
	>;
}

export interface WorkoutDetails {
	id: WorkoutsSelect["id"];
	createdAt: WorkoutsSelect["createdAt"];
	status: Status;
	exercises: ExerciseWithDefinition[];
}

export async function getWorkoutById(
	workoutId: string,
): Promise<WorkoutDetails | null> {
	const result = await db
		.select({
			workout: {
				id: workouts.id,
				createdAt: workouts.createdAt,
				status: workouts.status,
			},
			exercise: {
				id: exercises.id,
				order: exercises.order,
				status: exercises.status,
			},
			definition: {
				id: exerciseDefinitions.id,
				name: exerciseDefinitions.name,
				type: exerciseDefinitions.type,
				rpeMax: exerciseDefinitions.rpeMax,
				repMax: exerciseDefinitions.repMax,
			},
			set: {
				id: sets.id,
				setNumber: sets.setNumber,
				weight: sets.weight,
				reps: sets.reps,
				rpe: sets.rpe,
				percentageOfMax: sets.percentageOfMax,
				status: sets.status,
			},
		})
		.from(workouts)
		.where(eq(workouts.id, workoutId))
		.leftJoin(exercises, eq(exercises.workoutId, workouts.id))
		.leftJoin(
			exerciseDefinitions,
			eq(exercises.exerciseDefinitionId, exerciseDefinitions.id),
		)
		.leftJoin(sets, eq(sets.exerciseId, exercises.id))
		.orderBy(exercises.order, sets.setNumber);

	if (!result.length) return null;

	const workout = result[0].workout;
	const exercisesMap = new Map<string, ExerciseWithDefinition>();

	for (const row of result) {
		if (!row.exercise || !row.definition) continue;

		const exerciseId = row.exercise.id;
		if (!exercisesMap.has(exerciseId)) {
			exercisesMap.set(exerciseId, {
				exercise: {
					id: row.exercise.id,
					order: row.exercise.order,
					status: row.exercise.status as Status,
				},
				definition: {
					id: row.definition.id,
					name: row.definition.name,
					type: row.definition.type as ExerciseType,
					rpeMax: row.definition.rpeMax || 0,
					repMax: row.definition.repMax || 0,
				},
				sets: [],
			});
		}

		if (row.set) {
			const exercise = exercisesMap.get(exerciseId);
			if (exercise && !exercise.sets.some((s) => s.id === row.set?.id)) {
				exercise.sets.push({
					id: row.set.id,
					setNumber: row.set.setNumber,
					weight: row.set.weight,
					reps: row.set.reps,
					rpe: row.set.rpe,
					percentageOfMax: row.set.percentageOfMax || 0,
					status: row.set.status as Status,
				});
			}
		}
	}

	return {
		id: workout.id,
		createdAt: workout.createdAt,
		status: workout.status as Status,
		exercises: Array.from(exercisesMap.values()),
	};
}
