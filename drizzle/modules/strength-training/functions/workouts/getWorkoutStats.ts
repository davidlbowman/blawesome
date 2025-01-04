import { db } from "@/drizzle/db";
import {
	Status,
	type WorkoutsSelect,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export interface WorkoutStats {
	totalWorkouts: number;
	completedWorkouts: number;
	nextWorkout: WorkoutsSelect | undefined;
}

export async function getWorkoutStats(cycleId: string): Promise<WorkoutStats> {
	const cycleWorkouts = await db
		.select()
		.from(workouts)
		.where(eq(workouts.cycleId, cycleId))
		.orderBy(workouts.sequence);

	const totalWorkouts = cycleWorkouts.length;
	const completedWorkouts = cycleWorkouts.filter(
		(w) => w.status === Status.Completed,
	).length;
	const nextWorkout = cycleWorkouts.find((w) => w.status === Status.Pending);

	return {
		totalWorkouts,
		completedWorkouts,
		nextWorkout,
	};
}
