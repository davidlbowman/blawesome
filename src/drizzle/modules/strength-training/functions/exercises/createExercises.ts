"use server";

import type { UserSelect } from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
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

interface CreateExercisesParams {
	userId: UserSelect["id"];
	workouts: Pick<WorkoutsSelect, "id" | "primaryLift">[];
	definitions: ExerciseDefinitionsSelect[];
	tx?: DrizzleTransaction;
}

type CreateExercisesResponse = Promise<
	Response<Pick<ExercisesSelect, "id" | "exerciseDefinitionId">[]>
>;

export async function createExercises({
	userId,
	workouts,
	definitions,
	tx,
}: CreateExercisesParams): CreateExercisesResponse {
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

	return {
		success: true,
		data: createdExercises.map((exercise) =>
			exercisesSelectSchema
				.pick({ id: true, exerciseDefinitionId: true })
				.parse(exercise),
		),
	};
}
