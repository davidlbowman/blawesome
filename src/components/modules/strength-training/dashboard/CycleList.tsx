"use client";

import { CycleCard } from "@/components/modules/strength-training/cycle/CycleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";

interface CycleListProps {
	allCompletedCycles: Pick<
		CyclesSelect,
		"id" | "status" | "startDate" | "completedAt"
	>[];
	currentCycleWorkouts: Pick<WorkoutsSelect, "status" | "primaryLift">[];
}

export function CycleList({
	allCompletedCycles,
	currentCycleWorkouts,
}: CycleListProps) {
	const WORKOUTS_PER_CYCLE = 16;
	const TOTAL_COMPLETE_CYCLES_SHOWN = 10;

	const currentCycle = allCompletedCycles.find(
		(cycle) => cycle.status !== Status.Enum.completed,
	);

	const completedWorkouts = currentCycleWorkouts.filter(
		(w: Pick<WorkoutsSelect, "status" | "primaryLift">) =>
			w.status === Status.Enum.completed,
	).length;

	const nextWorkout = currentCycleWorkouts.find(
		(w: Pick<WorkoutsSelect, "status" | "primaryLift">) =>
			w.status === Status.Enum.pending,
	);

	const completedCycles = allCompletedCycles
		.filter(
			(cycle: Pick<CyclesSelect, "status" | "startDate" | "completedAt">) =>
				cycle.status === Status.Enum.completed,
		)
		.sort(
			(
				a: Pick<CyclesSelect, "startDate" | "completedAt">,
				b: Pick<CyclesSelect, "startDate" | "completedAt">,
			) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
		)
		.slice(0, TOTAL_COMPLETE_CYCLES_SHOWN);

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
							cycle={{
								id: currentCycle.id,
								status: currentCycle.status,
								startDate: currentCycle.startDate,
								completedAt: currentCycle.completedAt,
							}}
							completedWorkouts={completedWorkouts}
							totalWorkouts={WORKOUTS_PER_CYCLE}
							nextWorkout={nextWorkout}
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
									cycle={{
										id: cycle.id,
										status: cycle.status,
										startDate: cycle.startDate,
										completedAt: cycle.completedAt,
									}}
									completedWorkouts={16}
									totalWorkouts={16}
								/>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
