import {
	Status,
	type WorkoutsSelect,
} from "@/drizzle/modules/strength-training/schemas";

export interface WorkoutStats {
	totalWorkouts: number;
	completedWorkouts: number;
	nextWorkout: WorkoutsSelect | undefined;
}

export function getWorkoutStats(workouts: WorkoutsSelect[]): WorkoutStats {
	return {
		totalWorkouts: workouts.length,
		completedWorkouts: workouts.filter((w) => w.status === Status.Completed)
			.length,
		nextWorkout: workouts.find((w) => w.status === Status.Pending),
	};
}
