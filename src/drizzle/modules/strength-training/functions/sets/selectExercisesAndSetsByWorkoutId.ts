"use server";

import type { Response } from "@/drizzle/core/types";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import {
	exerciseDefinitions,
	exerciseDefinitionsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import type { ExerciseDefinitionsSelect } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import type { ExercisesSelect } from "@/drizzle/modules/strength-training/schemas/exercises";
import {
	sets,
	setsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/sets";
import type { SetsSelect } from "@/drizzle/modules/strength-training/schemas/sets";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { exercises, exercisesSelectSchema } from "../../schemas/exercises";

interface SelectExercisesAndSetsByWorkoutIdParams {
	workoutId: Pick<WorkoutsSelect, "id">;
	tx?: DrizzleTransaction;
}

type SelectExercisesAndSetsByWorkoutIdResponse = Response<{
	exercises: Array<
		Pick<ExercisesSelect, "id" | "oneRepMax"> &
			Pick<ExerciseDefinitionsSelect, "name">
	>;
	sets: Pick<
		SetsSelect,
		"id" | "setNumber" | "weight" | "reps" | "rpe" | "status"
	>[];
}>;

export async function selectExercisesAndSetsByWorkoutId({
	workoutId,
	tx,
}: SelectExercisesAndSetsByWorkoutIdParams): Promise<SelectExercisesAndSetsByWorkoutIdResponse> {
	const querryRunner = tx || db;

	const exercisesResponse = await querryRunner
		.select({
			id: exercises.id,
			oneRepMax: exercises.oneRepMax,
			name: exerciseDefinitions.name,
		})
		.from(exercises)
		.where(eq(exercises.workoutId, workoutId.id))
		.innerJoin(
			exerciseDefinitions,
			eq(exercises.exerciseDefinitionId, exerciseDefinitions.id),
		)
		.then((exercises) =>
			z
				.array(
					exercisesSelectSchema
						.pick({
							id: true,
							oneRepMax: true,
						})
						.merge(
							exerciseDefinitionsSelectSchema.pick({
								name: true,
							}),
						),
				)
				.parse(exercises),
		);

	const setsResponse = await querryRunner
		.select({
			id: sets.id,
			setNumber: sets.setNumber,
			weight: sets.weight,
			reps: sets.reps,
			rpe: sets.rpe,
			status: sets.status,
		})
		.from(sets)
		.where(
			inArray(
				sets.exerciseId,
				exercisesResponse.map((exercise) => exercise.id),
			),
		)
		.then((sets) =>
			z
				.array(
					setsSelectSchema.pick({
						id: true,
						setNumber: true,
						weight: true,
						reps: true,
						rpe: true,
						status: true,
					}),
				)
				.parse(sets),
		);

	return {
		success: true,
		data: {
			exercises: exercisesResponse,
			sets: setsResponse,
		},
	};
}
