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
	console.log("Getting workout stats", {
		totalWorkouts: workouts.length,
		cycleId,
		workoutCycleIds: workouts.map((w) => w.cycleId),
		workoutStatuses: workouts.map((w) => w.status),
	});

	// Filter workouts by cycle ID if provided
	const cycleWorkouts = cycleId
		? workouts.filter((w) => w.cycleId === cycleId)
		: workouts;

	console.log("Stats for cycle", cycleId, {
		totalWorkouts: cycleWorkouts.length,
		workoutIds: cycleWorkouts.map((w) => w.id),
		cycleWorkouts: cycleWorkouts.map((w) => ({
			id: w.id,
			cycleId: w.cycleId,
			status: w.status,
		})),
	});

	return {
		totalWorkouts: cycleWorkouts.length,
		completedWorkouts: cycleWorkouts.filter(
			(w) => w.status === Status.Completed,
		).length,
		nextWorkout: cycleWorkouts.find((w) => w.status === Status.Pending),
	};
}
