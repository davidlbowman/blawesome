"use server";

import { db } from "@/drizzle/db";
import {
	type WorkoutsSelect,
	cycles,
	exerciseDefinitions,
	oneRepMaxes,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { desc, eq } from "drizzle-orm";

export async function getTrainingData(userId: string) {
	return await db.transaction(
		async (tx) => {
			// Get primary exercises and their one rep maxes in a single query
			const exerciseData = await tx
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
					eq(oneRepMaxes.exerciseDefinitionId, exerciseDefinitions.id),
				)
				.where(eq(exerciseDefinitions.type, "primary"));

			const hasAllMaxes = exerciseData.every((data) => data.oneRepMax?.weight);

			// Get active cycle and its workouts in a single query
			const cycleData = await tx
				.select({
					cycle: {
						id: cycles.id,
						status: cycles.status,
						startDate: cycles.startDate,
						endDate: cycles.endDate,
						createdAt: cycles.createdAt,
						completedAt: cycles.completedAt,
					},
					workout: {
						id: workouts.id,
						primaryLift: workouts.primaryLift,
						status: workouts.status,
						sequence: workouts.sequence,
					},
				})
				.from(cycles)
				.leftJoin(workouts, eq(workouts.cycleId, cycles.id))
				.where(eq(cycles.userId, userId))
				.orderBy(desc(cycles.createdAt), workouts.sequence);

			// Process cycle data
			const userCycles = cycleData.reduce(
				(acc, row) => {
					if (!acc.some((c) => c.id === row.cycle.id)) {
						acc.push(row.cycle);
					}
					return acc;
				},
				[] as (typeof cycleData)[number]["cycle"][],
			);

			const workoutData = cycleData
				.filter((row) => row.workout?.id)
				.map((row) => row.workout as WorkoutsSelect);

			return {
				hasAllMaxes,
				cycles: userCycles,
				workoutData,
			};
		},
		{
			accessMode: "read only",
			isolationLevel: "repeatable read",
		},
	);
}
