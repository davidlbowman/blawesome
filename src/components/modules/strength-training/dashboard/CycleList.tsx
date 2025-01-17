"use client";

import { CycleCard } from "@/components/modules/strength-training/cycle/CycleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";

type WorkoutStats = {
	totalWorkouts: number;
	completedWorkouts: number;
	nextWorkout: WorkoutsSelect | undefined;
};

function calculateWorkoutStats(workouts: WorkoutsSelect[]): WorkoutStats {
	// Group workouts by cycle
	const workoutsByCycle = workouts.reduce(
		(acc, workout) => {
			if (!acc[workout.cycleId]) {
				acc[workout.cycleId] = [];
			}
			acc[workout.cycleId].push(workout);
			return acc;
		},
		{} as Record<string, WorkoutsSelect[]>,
	);

	// Get the active cycle's workouts (the one that has pending workouts)
	const activeCycleWorkouts =
		Object.values(workoutsByCycle).find((cycleWorkouts) =>
			cycleWorkouts.some((w) => w.status === Status.Enum.pending),
		) ?? [];

	return {
		totalWorkouts: 16, // Each cycle has exactly 16 workouts
		completedWorkouts: activeCycleWorkouts.filter(
			(w) => w.status === Status.Enum.completed,
		).length,
		nextWorkout: activeCycleWorkouts.find(
			(w) => w.status === Status.Enum.pending,
		),
	};
}

function getCompletedWorkouts(cycle: CyclesSelect, stats: WorkoutStats) {
	return cycle.status === Status.Enum.completed ? 16 : stats.completedWorkouts;
}

function getNextWorkout(
	cycle: CyclesSelect,
	nextWorkout: WorkoutsSelect | undefined,
) {
	if (cycle.status === Status.Enum.completed || !nextWorkout) {
		return undefined;
	}

	return {
		primaryLift: nextWorkout.primaryLift,
		status: nextWorkout.status,
	};
}

interface CycleListProps {
	cycles: CyclesSelect[];
	workoutData: WorkoutsSelect[];
}

export function CycleList({ cycles, workoutData }: CycleListProps) {
	const stats = calculateWorkoutStats(workoutData);

	// Separate current and completed cycles
	const currentCycle = cycles.find(
		(cycle) => cycle.status !== Status.Enum.completed,
	);
	const completedCycles = cycles
		.filter((cycle) => cycle.status === Status.Enum.completed)
		.sort(
			(a, b) =>
				(b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
		)
		.slice(0, 3);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Workout Cycles</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{currentCycle && (
					<div>
						<h3 className="text-lg font-semibold mb-4">Current Cycle</h3>
						<CycleCard
							key={currentCycle.id}
							{...currentCycle}
							completedWorkouts={getCompletedWorkouts(currentCycle, stats)}
							totalWorkouts={stats.totalWorkouts}
							nextWorkout={getNextWorkout(currentCycle, stats.nextWorkout)}
						/>
					</div>
				)}

				{completedCycles.length > 0 && (
					<div className="mt-8">
						<h3 className="text-lg font-semibold mb-4">Previous Cycles</h3>
						<div className="grid gap-6 md:grid-cols-2">
							{completedCycles.map((cycle) => (
								<CycleCard
									key={cycle.id}
									{...cycle}
									completedWorkouts={getCompletedWorkouts(cycle, stats)}
									totalWorkouts={stats.totalWorkouts}
									nextWorkout={getNextWorkout(cycle, stats.nextWorkout)}
								/>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
