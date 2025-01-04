import { db } from "@/drizzle/db";
import {
	exerciseDefinitions,
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export type WorkoutDetails = {
	id: string;
	date: Date;
	status: string;
	primaryLift: string;
	title: string;
	exercises: {
		exercise: {
			id: string;
			order: number;
			status: string;
		};
		definition: {
			id: string;
			name: string;
			type: string;
			rpeMax: number | null;
			repMax: number | null;
		};
		sets: Array<{
			id: string;
			setNumber: number;
			weight: number;
			reps: number;
			percentageOfMax: number;
			status: string;
		}>;
	}[];
};

export async function getWorkoutById(
	workoutId: string,
): Promise<WorkoutDetails | null> {
	const result = await db.transaction(async (tx) => {
		const result = await tx
			.select()
			.from(workouts)
			.where(eq(workouts.id, workoutId));

		const workout = result[0] ?? null;
		if (!workout) return null;

		// Get all exercises with their definitions
		const exerciseResults = await tx
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
		const exercisesWithSets = await Promise.all(
			exerciseResults.map(async ({ exercise, definition }) => {
				const exerciseSets = await tx
					.select()
					.from(sets)
					.where(eq(sets.exerciseId, exercise.id))
					.orderBy(sets.setNumber);

				return {
					exercise: {
						id: exercise.id,
						order: exercise.order,
						status: exercise.status,
					},
					definition: {
						id: definition.id,
						name: definition.name,
						type: definition.type,
						rpeMax: definition.rpeMax,
						repMax: definition.repMax,
					},
					sets: exerciseSets.map((set) => ({
						id: set.id,
						setNumber: set.setNumber,
						weight: set.weight,
						reps: set.reps,
						percentageOfMax: set.percentageOfMax || 0,
						status: set.status,
					})),
				};
			}),
		);

		// Format the data for the WorkoutCard component
		return {
			id: workout.id,
			date: workout.date,
			status: workout.status,
			primaryLift: workout.primaryLift,
			title: `${workout.primaryLift} Day`,
			exercises: exercisesWithSets,
		};
	});

	return result || null;
}
