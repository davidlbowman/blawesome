"use server";

import type { User } from "@/drizzle/core/schemas/users";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import type { ExerciseDefinitionsSelect } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import {
	type ExercisesSelect,
	exercises,
	exercisesInsertSchema,
	exercisesSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/exercises";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import {
	DefaultExerciseDefinitions,
	Status,
} from "@/drizzle/modules/strength-training/types";

export async function createExercises({
	userId,
	workouts,
	definitions,
	tx,
}: {
	userId: User["id"];
	workouts: Pick<WorkoutsSelect, "id" | "primaryLift">[];
	definitions: ExerciseDefinitionsSelect[];
	tx?: DrizzleTransaction;
}): Promise<Pick<ExercisesSelect, "id" | "exerciseDefinitionId">[]> {
	const queryRunner = tx || db;

	const exerciseValues = workouts.flatMap((workout) => {
		const exercises = DefaultExerciseDefinitions.get(workout.primaryLift);
		if (!exercises) {
			throw new Error(
				`No exercises found for primary lift ${workout.primaryLift}`,
			);
		}

		return exercises.map((exercise, index) => {
			const definition = definitions.find(
				(def) =>
					def.category === exercise.category && def.type === exercise.type,
			);

			if (!definition) {
				throw new Error(
					`No exercise definition found for category ${exercise.category} and type ${exercise.type}`,
				);
			}

			return exercisesInsertSchema.parse({
				userId,
				workoutId: workout.id,
				exerciseDefinitionId: definition.id,
				order: index + 1,
				status: Status.Enum.pending,
			});
		});
	});

	const createdExercises = await queryRunner
		.insert(exercises)
		.values(exerciseValues)
		.returning();

	return createdExercises.map((exercise) =>
		exercisesSelectSchema
			.pick({ id: true, exerciseDefinitionId: true })
			.parse(exercise),
	);
}
