import { db } from "@/drizzle/db";
import {
	type WorkoutsSelect,
	workouts,
} from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
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
		(w) => w.status === Status.Enum.completed,
	).length;
	const nextWorkout = cycleWorkouts.find(
		(w) => w.status === Status.Enum.pending,
	) as WorkoutsSelect | undefined;

	return {
		totalWorkouts,
		completedWorkouts,
		nextWorkout,
	};
}
