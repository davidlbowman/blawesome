"use server";

import { db } from "@/drizzle/db";
import { createWorkouts } from "@/drizzle/modules/strength-training/functions/workouts/createWorkouts";
import {
	type CyclesInsert,
	Status,
	cycles,
} from "@/drizzle/modules/strength-training/schemas";

export async function createCycle(userId: string) {
	const startDate = new Date();

	const cycleData: CyclesInsert = {
		userId,
		startDate,
		status: Status.Pending,
	};

	const [cycle] = await db.insert(cycles).values(cycleData).returning();

	const { workouts, exercises } = await createWorkouts(
		userId,
		cycle.id,
		startDate,
	);

	return {
		...cycle,
		workouts,
		exercises,
	};
}
