"use server";

import { db } from "@/drizzle/db";
import {
	type WorkoutsSelect,
	workouts,
	workoutsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/workouts";
import { eq } from "drizzle-orm";
import { Status } from "../../types";

export interface ActiveWorkoutsResult {
	workouts: WorkoutsSelect[];
	totalWorkouts: number;
	completedWorkouts: number;
	nextWorkout: WorkoutsSelect | undefined;
}

export async function getActiveWorkouts(
	cycleId: string,
): Promise<ActiveWorkoutsResult> {
	const rawWorkouts = await db
		.select()
		.from(workouts)
		.where(eq(workouts.cycleId, cycleId))
		.orderBy(workouts.sequence);

	// Parse workouts and handle any invalid data
	const parsedWorkouts = rawWorkouts
		.map((workout) => {
			try {
				return workoutsSelectSchema.parse(workout);
			} catch (error) {
				console.error(`Failed to parse workout ${workout.id}:`, error, workout);
				return null;
			}
		})
		.filter((w): w is WorkoutsSelect => w !== null);

	const totalWorkouts = rawWorkouts.length;
	const completedWorkouts = parsedWorkouts.filter(
		(w) => w.status === Status.Enum.completed,
	).length;

	const nextWorkout = parsedWorkouts.find(
		(w) => w.status === Status.Enum.pending,
	);

	return {
		workouts: parsedWorkouts,
		totalWorkouts,
		completedWorkouts,
		nextWorkout,
	};
}
