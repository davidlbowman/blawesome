"use client";

import { Button } from "@/components/ui/button";
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
	currentWorkout?: WorkoutData;
	nextWorkouts: WorkoutData[];
	previousWorkouts: WorkoutData[];
	onSkipRemainingWorkouts: () => void;
}

interface WorkoutData {
	id: string;
	status: string;
	date: Date;
	completedAt?: Date | null;
	primaryLift: string;
	sequence: number;
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

			{nextWorkouts.length > 0 && (
				<form action={onSkipRemainingWorkouts}>
					<Button type="submit" variant="destructive" className="w-full">
						Skip Remaining Workouts & End Cycle
					</Button>
				</form>
			)}
		</div>
	);
}
