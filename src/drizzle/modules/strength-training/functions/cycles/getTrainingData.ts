"use server";

import type { UserSelect } from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import {
	cycles,
	cyclesSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/cycles";
import { exerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { oneRepMaxes } from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import { oneRepMaxesSelectSchema } from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import {
	type WorkoutsSelect,
	workoutsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/workouts";
import { workouts } from "@/drizzle/modules/strength-training/schemas/workouts";
import { ExerciseType } from "@/drizzle/modules/strength-training/types";
import { Status } from "@/drizzle/modules/strength-training/types";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

interface GetTrainingDataParams {
	userId: Pick<UserSelect, "id">;
	tx?: DrizzleTransaction;
}

type GetTrainingDataResponse = Promise<
	Response<{
		hasAllMaxes: boolean;
		cycles: CyclesSelect[];
		workoutData: WorkoutsSelect[];
	}>
>;

export async function getTrainingData({
	userId,
	tx,
}: GetTrainingDataParams): GetTrainingDataResponse {
	const queryRunner = tx || db;

	const exerciseData = await queryRunner
		.select({ weight: oneRepMaxes.weight })
		.from(oneRepMaxes)
		.innerJoin(
			exerciseDefinitions,
			and(
				eq(oneRepMaxes.exerciseDefinitionId, exerciseDefinitions.id),
				eq(exerciseDefinitions.type, ExerciseType.Enum.primary),
			),
		)
		.where(eq(oneRepMaxes.userId, userId.id))
		.then((rows) =>
			z.array(oneRepMaxesSelectSchema.pick({ weight: true })).parse(rows),
		);

	const cyclesData = await queryRunner
		.select()
		.from(cycles)
		.where(eq(cycles.userId, userId.id))
		.orderBy(desc(cycles.createdAt))
		.then((rows) => z.array(cyclesSelectSchema).parse(rows));

	const currentCycle = cyclesData.find(
		(cycle) => cycle.status !== Status.Enum.completed,
	);

	const workoutsData = currentCycle
		? await queryRunner
				.select()
				.from(workouts)
				.where(eq(workouts.cycleId, currentCycle.id))
				.then((rows) => z.array(workoutsSelectSchema).parse(rows))
		: [];

	const hasAllMaxes = exerciseData.every((data) => data.weight);

	return {
		success: true,
		data: {
			hasAllMaxes,
			cycles: cyclesData,
			workoutData: workoutsData,
		},
	};
}
