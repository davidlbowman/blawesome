import { OneRMForm } from "@/components/1RMForm";
import { CycleCard } from "@/components/CycleCard";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { createCycle } from "@/drizzle/modules/strength-training/functions/cycles/createCycle";
import {
	getTrainingData,
	preloadTrainingData,
} from "@/drizzle/modules/strength-training/functions/cycles/getTrainingData";
import { getWorkoutStats } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutStats";
import type {
	CyclesSelect,
	PrimaryLift,
	WorkoutsSelect,
} from "@/drizzle/modules/strength-training/schemas";
import { Status } from "@/drizzle/modules/strength-training/schemas";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

// Revalidate every 30 seconds
export const revalidate = 30;

type WorkoutStats = {
	totalWorkouts: number;
	completedWorkouts: number;
	nextWorkout: WorkoutsSelect | undefined;
};

function getCompletedWorkouts(cycle: CyclesSelect, stats: WorkoutStats) {
	return cycle.status === Status.Completed
		? stats.totalWorkouts
		: stats.completedWorkouts;
}

function getNextWorkout(
	cycle: CyclesSelect,
	nextWorkout: WorkoutsSelect | undefined,
) {
	if (cycle.status === Status.Completed || !nextWorkout) {
		return undefined;
	}

	return {
		primaryLift:
			nextWorkout.primaryLift as (typeof PrimaryLift)[keyof typeof PrimaryLift],
		status: nextWorkout.status as (typeof Status)[keyof typeof Status],
	};
}

async function createNewCycle(userId: string) {
	"use server";
	await createCycle(userId);
	revalidatePath("/modules/strength-training");
}

function CycleList({
	cycles,
	workoutData,
}: {
	cycles: CyclesSelect[];
	workoutData: WorkoutsSelect[];
}) {
	const stats = getWorkoutStats(workoutData);

	// Separate current and completed cycles
	const currentCycle = cycles.find((cycle) => cycle.status === Status.Pending);
	const completedCycles = cycles
		.filter((cycle) => cycle.status === Status.Completed)
		.sort(
			(a, b) =>
				(b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
		)
		.slice(0, 3);

	return (
		<div className="space-y-8">
			{currentCycle && (
				<div>
					<h2 className="text-xl font-semibold mb-4">Current Cycle</h2>
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
				<div>
					<h2 className="text-xl font-semibold mb-4">Previous Cycles</h2>
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
		</div>
	);
}

export default async function StrengthTrainingPage() {
	const userId = await getUserId();

	// Start loading data early
	preloadTrainingData(userId);

	// Check if user has recorded all main lifts
	const { hasAllMaxes, cycles, workoutData } = await getTrainingData(userId);

	if (!hasAllMaxes) {
		return <OneRMForm />;
	}

	// If there are no cycles, create one
	if (cycles.length === 0) {
		await createNewCycle(userId);
		return <div>Creating new cycle...</div>;
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold mb-6">Your Training Cycles</h1>
			<Suspense fallback={<div>Loading cycles...</div>}>
				<CycleList cycles={cycles} workoutData={workoutData} />
			</Suspense>
		</div>
	);
}
