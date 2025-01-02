"use server";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import "server-only";
import { db } from "@/drizzle/db";
import type {
	CyclesSelect,
	ExerciseDefinitionsSelect,
	OneRepMaxesSelect,
	WorkoutsSelect,
} from "@/drizzle/modules/strength-training/schemas";
import {
	cycles,
	exerciseDefinitions,
	oneRepMaxes,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { and, desc, eq } from "drizzle-orm";

type ExerciseData = {
	exercise: ExerciseDefinitionsSelect;
	oneRepMax: OneRepMaxesSelect | null;
};

type CycleData = {
	cycle: CyclesSelect;
	workout: WorkoutsSelect | null;
};

// Preload function for eager data fetching
export async function preloadTrainingData(userId: string) {
	void getTrainingData(userId);
}

const REVALIDATE_TIME = 60;

// Cached database queries
const getExerciseData = unstable_cache(
	async (userId: string) => {
		return await db.transaction(async (tx) => {
			const data = await tx
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
				.where(eq(exerciseDefinitions.type, "primary"));

			return data as ExerciseData[];
		});
	},
	["exercise-data"],
	{
		revalidate: REVALIDATE_TIME,
		tags: ["exercises"],
	},
);

const getCycleData = unstable_cache(
	async (userId: string) => {
		return await db.transaction(async (tx) => {
			// First get the current cycle (most recent non-completed cycle)
			const currentCycleData = await tx
				.select({
					cycle: {
						id: cycles.id,
						userId: cycles.userId,
						status: cycles.status,
						startDate: cycles.startDate,
						endDate: cycles.endDate,
						createdAt: cycles.createdAt,
						updatedAt: cycles.updatedAt,
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
				.where(and(eq(cycles.userId, userId), eq(cycles.status, "pending")))
				.orderBy(desc(cycles.createdAt), workouts.sequence);

			// Then get the last 3 completed cycles
			const completedCyclesData = await tx
				.select({
					cycle: {
						id: cycles.id,
						userId: cycles.userId,
						status: cycles.status,
						startDate: cycles.startDate,
						endDate: cycles.endDate,
						createdAt: cycles.createdAt,
						updatedAt: cycles.updatedAt,
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
				.where(and(eq(cycles.userId, userId), eq(cycles.status, "completed")))
				.orderBy(desc(cycles.completedAt), workouts.sequence)
				.limit(3);

			// Combine the results
			return [...currentCycleData, ...completedCyclesData] as CycleData[];
		});
	},
	["cycle-data"],
	{
		revalidate: REVALIDATE_TIME,
		tags: ["cycles"],
	},
);

// Main function wrapped with React cache
export const getTrainingData = cache(async (userId: string) => {
	// Start both queries in parallel
	const [exerciseData, cycleData] = await Promise.all([
		getExerciseData(userId),
		getCycleData(userId),
	]);

	const hasAllMaxes = exerciseData.every((data) => data.oneRepMax?.weight);

	// Process cycle data
	const userCycles = cycleData.reduce(
		(acc: CycleData["cycle"][], row: CycleData) => {
			if (!acc.some((c: CycleData["cycle"]) => c.id === row.cycle.id)) {
				acc.push(row.cycle);
			}
			return acc;
		},
		[],
	);

	const workoutData = cycleData
		.filter((row: CycleData) => row.workout?.id)
		.map((row: CycleData) => row.workout as WorkoutsSelect);

	return {
		hasAllMaxes,
		cycles: userCycles,
		workoutData,
	};
});
