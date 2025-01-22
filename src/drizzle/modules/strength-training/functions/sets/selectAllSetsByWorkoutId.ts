"use server";

import type { Response } from "@/drizzle/core/types";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import {
	exerciseDefinitions,
	exerciseDefinitionsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import {
	sets,
	setsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/sets";
import {
	type WorkoutsSelect,
	workouts,
	workoutsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/workouts";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { exercises, exercisesSelectSchema } from "../../schemas/exercises";

interface SelectAllSetsByWorkoutIdParams {
	workoutId: Pick<WorkoutsSelect, "id">;
	tx?: DrizzleTransaction;
}

const allSetsByWorkoutIdSchema = z.array(
	z.object({
		workouts: workoutsSelectSchema.pick({
			status: true,
			primaryLift: true,
			createdAt: true,
		}),
		exercises: exercisesSelectSchema.pick({
			id: true,
			oneRepMax: true,
			createdAt: true,
			status: true,
		}),
		exerciseDefinitions: exerciseDefinitionsSelectSchema.pick({
			name: true,
			type: true,
		}),
		sets: setsSelectSchema.pick({
			id: true,
			exerciseId: true,
			setNumber: true,
			weight: true,
			reps: true,
			rpe: true,
			status: true,
		}),
	}),
);

export type AllSetsByWorkoutId = z.infer<typeof allSetsByWorkoutIdSchema>;
type AllSetsByWorkoutIdResponse = Response<AllSetsByWorkoutId>;

export async function selectAllSetsByWorkoutId({
	workoutId,
	tx,
}: SelectAllSetsByWorkoutIdParams): Promise<AllSetsByWorkoutIdResponse> {
	try {
		const querryRunner = tx || db;
		const allSetsByWorkoutId = await querryRunner
			.select({
				workouts: {
					status: workouts.status,
					primaryLift: workouts.primaryLift,
					createdAt: workouts.createdAt,
				},
				exercises: {
					id: exercises.id,
					oneRepMax: exercises.oneRepMax,
					createdAt: exercises.createdAt,
					status: exercises.status,
				},
				exerciseDefinitions: {
					name: exerciseDefinitions.name,
					type: exerciseDefinitions.type,
				},
				sets: {
					id: sets.id,
					exerciseId: sets.exerciseId,
					setNumber: sets.setNumber,
					weight: sets.weight,
					reps: sets.reps,
					rpe: sets.rpe,
					status: sets.status,
				},
			})
			.from(workouts)
			.where(eq(workouts.id, workoutId.id))
			.innerJoin(exercises, eq(workouts.id, exercises.workoutId))
			.innerJoin(
				exerciseDefinitions,
				eq(exercises.exerciseDefinitionId, exerciseDefinitions.id),
			)
			.innerJoin(sets, eq(sets.exerciseId, exercises.id))
			.then((sets) => allSetsByWorkoutIdSchema.parse(sets));

		return {
			success: true,
			data: allSetsByWorkoutId,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error("Unknown error"),
		};
	}
}
