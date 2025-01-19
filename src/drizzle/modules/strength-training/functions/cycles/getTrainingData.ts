"use server";

import { db } from "@/drizzle/db";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import { cycles } from "@/drizzle/modules/strength-training/schemas/cycles";
import { exerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { oneRepMaxes } from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { workouts } from "@/drizzle/modules/strength-training/schemas/workouts";
import { and, desc, eq } from "drizzle-orm";
import type { Response } from "@/drizzle/core/types";
import type { UserSelect } from "@/drizzle/core/schemas/users";

interface GetTrainingDataParams {
	userId: Pick<UserSelect, "id">;
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
}: GetTrainingDataParams): GetTrainingDataResponse {
	// Start both queries in parallel
	const [exerciseData, cycleData] = await Promise.all([
		db
			.select({
				exercise: {
					id: exerciseDefinitions.id,
					type: exerciseDefinitions.type,
				},
				oneRepMax: {
					weight: oneRepMaxes.weight,
				},
			})
			.from(exerciseDefinitions)
			.leftJoin(
				oneRepMaxes,
				and(
					eq(oneRepMaxes.exerciseDefinitionId, exerciseDefinitions.id),
					eq(oneRepMaxes.userId, userId.id),
				),
			)
			.where(eq(exerciseDefinitions.type, "primary")),

		db
			.select({
				cycle: {
					id: cycles.id,
					status: cycles.status,
					startDate: cycles.startDate,
					endDate: cycles.endDate,
					completedAt: cycles.completedAt,
				},
				workout: {
					id: workouts.id,
					cycleId: workouts.cycleId,
					primaryLift: workouts.primaryLift,
					status: workouts.status,
					sequence: workouts.sequence,
				},
			})
			.from(cycles)
			.leftJoin(workouts, eq(workouts.cycleId, cycles.id))
			.where(eq(cycles.userId, userId.id))
			.orderBy(desc(cycles.createdAt)),
	]);

	const hasAllMaxes = exerciseData.every((data) => data.oneRepMax?.weight);

	// Process cycle data
	const userCycles = cycleData.reduce((acc: CyclesSelect[], row) => {
		if (!acc.some((c) => c.id === row.cycle.id)) {
			acc.push(row.cycle as CyclesSelect);
		}
		return acc;
	}, []);

	const workoutData = cycleData
		.filter((row) => row.workout)
		.map((row) => row.workout as WorkoutsSelect)
		.sort((a, b) => a.sequence - b.sequence);

	return {
		success: true,
		data: {
			hasAllMaxes,
			cycles: userCycles,
			workoutData,
		},
	};
}
