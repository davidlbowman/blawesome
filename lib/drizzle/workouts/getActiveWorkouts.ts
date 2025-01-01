"use server";

import { db } from "@/lib/drizzle/db";
import { workouts } from "@/lib/drizzle/schemas/strength-training";
import { eq } from "drizzle-orm";

export interface ActiveWorkoutsResult {
	workouts: (typeof workouts.$inferSelect)[];
	totalWorkouts: number;
	completedWorkouts: number;
	nextWorkout: typeof workouts.$inferSelect | undefined;
}

export async function getActiveWorkouts(
	cycleId: string,
): Promise<ActiveWorkoutsResult> {
	const activeWorkouts = await db
		.select()
		.from(workouts)
		.where(eq(workouts.cycleId, cycleId))
		.orderBy(workouts.date);

	const totalWorkouts = activeWorkouts.length;
	const completedWorkouts = activeWorkouts.filter(
		(w) => w.status === "completed",
	).length;
	const nextWorkout = activeWorkouts.find((w) => w.status === "pending");

	return {
		workouts: activeWorkouts,
		totalWorkouts,
		completedWorkouts,
		nextWorkout,
	};
}
