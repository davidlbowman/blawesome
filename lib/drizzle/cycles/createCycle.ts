"use server";

import { db } from "@/lib/drizzle/db";
import {
	type CyclesInsert,
	Status,
	cycles,
} from "@/lib/drizzle/schemas/strength-training";
import { createWorkouts } from "../workouts/createWorkouts";

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
