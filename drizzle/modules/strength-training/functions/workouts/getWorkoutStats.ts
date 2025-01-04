import {
	Status,
	type WorkoutsSelect,
} from "@/drizzle/modules/strength-training/schemas";

export interface WorkoutStats {
	totalWorkouts: number;
	completedWorkouts: number;
	nextWorkout: WorkoutsSelect | undefined;
}

export function getWorkoutStats(
	workouts: WorkoutsSelect[],
	cycleId?: string,
): WorkoutStats {
	// Filter workouts by cycle ID if provided
	const cycleWorkouts = cycleId
		? workouts.filter((w) => w.cycleId === cycleId)
		: workouts;

	return {
		totalWorkouts: cycleWorkouts.length,
		completedWorkouts: cycleWorkouts.filter(
			(w) => w.status === Status.Completed,
		).length,
		nextWorkout: cycleWorkouts.find((w) => w.status === Status.Pending),
	};
}
