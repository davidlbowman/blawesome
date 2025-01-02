import { OneRMForm } from "@/components/1RMForm";
import { WorkoutCycleCard } from "@/components/CycleCard";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
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
import { Suspense } from "react";
import { use } from "react";

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

function CycleList({ userId }: { userId: string }) {
	const { cycles, workoutData } = use(getTrainingData(userId));
	const stats = getWorkoutStats(workoutData);

	return (
		<div className="grid gap-6 md:grid-cols-2">
			{cycles.map((cycle) => (
				<WorkoutCycleCard
					key={cycle.id}
					{...cycle}
					completedWorkouts={getCompletedWorkouts(cycle, stats)}
					totalWorkouts={stats.totalWorkouts}
					nextWorkout={getNextWorkout(cycle, stats.nextWorkout)}
				/>
			))}
		</div>
	);
}

export default async function StrengthTrainingPage() {
	const userId = await getUserId();

	// Start loading data early
	preloadTrainingData(userId);

	// Check if user has recorded all main lifts
	const { hasAllMaxes } = await getTrainingData(userId);
	if (!hasAllMaxes) {
		return <OneRMForm />;
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold mb-6">Your Training Cycles</h1>
			<Suspense fallback={<div>Loading cycles...</div>}>
				<CycleList userId={userId} />
			</Suspense>
		</div>
	);
}
