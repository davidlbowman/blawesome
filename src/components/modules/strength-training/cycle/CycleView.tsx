"use client";

import { Button } from "@/components/ui/button";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { WorkoutList } from "../workout/WorkoutList";
import { CycleStats } from "./CycleStats";

interface CycleViewProps {
	cycleId: string;
	cycleWorkoutStats: {
		totalWorkouts: number;
		completedWorkouts: number;
	};
	totalVolume: number;
	consistency: number;
	currentWorkout?: WorkoutListData;
	nextWorkouts: WorkoutListData[];
	previousWorkouts: WorkoutListData[];
	onSkipRemainingWorkouts: () => void;
}

interface WorkoutListData extends WorkoutsSelect {
	completedSets: number;
	totalSets: number;
}

export function CycleView({
	cycleId,
	cycleWorkoutStats,
	totalVolume,
	consistency,
	currentWorkout,
	nextWorkouts,
	previousWorkouts,
	onSkipRemainingWorkouts,
}: CycleViewProps) {
	return (
		<div className="container mx-auto p-6 space-y-8">
			<CycleStats
				totalWorkouts={cycleWorkoutStats.totalWorkouts}
				completedWorkouts={cycleWorkoutStats.completedWorkouts}
				totalVolume={totalVolume}
				consistency={consistency}
			/>

			<WorkoutList
				currentWorkout={currentWorkout}
				nextWorkouts={nextWorkouts}
				previousWorkouts={previousWorkouts}
				cycleId={cycleId}
			/>

			{nextWorkouts.length > 0 ? (
				<form action={onSkipRemainingWorkouts}>
					<Button type="submit" variant="destructive" className="w-full">
						Skip Remaining Workouts & End Cycle
					</Button>
				</form>
			) : (
				<form action={onSkipRemainingWorkouts}>
					<Button type="submit" className="w-full">
						Complete Cycle
					</Button>
				</form>
			)}
		</div>
	);
}
