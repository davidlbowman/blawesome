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

interface ExerciseWithDefinition {
	exercise: {
		id: ExercisesSelect["id"];
		order: ExercisesSelect["order"];
		status: ExercisesSelect["status"];
	};
	definition: {
		id: ExerciseDefinitionsSelect["id"];
		name: ExerciseDefinitionsSelect["name"];
		type: ExerciseDefinitionsSelect["type"];
		rpeMax: NonNullable<ExerciseDefinitionsSelect["rpeMax"]>;
		repMax: NonNullable<ExerciseDefinitionsSelect["repMax"]>;
	};
	sets: Array<{
		id: SetsSelect["id"];
		setNumber: SetsSelect["setNumber"];
		weight: SetsSelect["weight"];
		reps: SetsSelect["reps"];
		percentageOfMax: NonNullable<SetsSelect["percentageOfMax"]>;
		status: SetsSelect["status"];
	}>;
}

interface WorkoutDetails {
	id: WorkoutsSelect["id"];
	date: WorkoutsSelect["date"];
	status: WorkoutsSelect["status"];
	primaryLift: WorkoutsSelect["primaryLift"];
	title: string;
	exercises: ExerciseWithDefinition[];
}

export async function getWorkoutById(
	workoutId: string,
): Promise<WorkoutDetails | null> {
	const result = await db.transaction(async (tx) => {
		const result = await tx
			.select({
				workout: {
					id: workouts.id,
					date: workouts.date,
					status: workouts.status,
					primaryLift: workouts.primaryLift,
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

		// Group the results by exercise
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
						status: row.exercise.status,
					},
					definition: {
						id: row.definition.id,
						name: row.definition.name,
						type: row.definition.type,
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
						percentageOfMax: row.set.percentageOfMax || 0,
						status: row.set.status,
					});
				}
			}
		}

		return {
			id: workout.id,
			date: workout.date,
			status: workout.status,
			primaryLift: workout.primaryLift,
			title: `${workout.primaryLift} Day`,
			exercises: Array.from(exercisesMap.values()),
		};
	});

	return result || null;
}
