"use server";

import { db } from "@/drizzle/db";
import type {
	CyclesSelect,
	WorkoutsSelect,
} from "@/drizzle/modules/strength-training/schemas";
import {
	cycles,
	exerciseDefinitions,
	oneRepMaxes,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { and, desc, eq } from "drizzle-orm";

export async function getTrainingData(userId: string) {
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
					eq(oneRepMaxes.userId, userId),
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
					primaryLift: workouts.primaryLift,
					status: workouts.status,
					sequence: workouts.sequence,
				},
			})
			.from(cycles)
			.leftJoin(workouts, eq(workouts.cycleId, cycles.id))
			.where(eq(cycles.userId, userId))
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
		hasAllMaxes,
		cycles: userCycles,
		workoutData,
	};
}
