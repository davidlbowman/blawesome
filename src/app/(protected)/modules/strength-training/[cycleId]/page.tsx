import { CycleView } from "@/components/modules/strength-training/cycle/CycleView";
import { skipRemainingWorkouts } from "@/drizzle/modules/strength-training/functions/cycles/skipRemainingWorkouts";
import { getActiveWorkouts } from "@/drizzle/modules/strength-training/functions/workouts/getActiveWorkouts";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { redirect } from "next/navigation";

type PageProps = {
	params: Promise<{ cycleId: CyclesSelect["id"] }>;
};

export default async function CyclePage({ params }: PageProps) {
	const { cycleId } = await params;
	const { workouts } = await getActiveWorkouts(cycleId);

	if (!workouts.length) {
		return (
			<div className="container mx-auto p-6">
				<h1 className="text-2xl font-bold mb-6">No workouts found</h1>
			</div>
		);
	}

	const cycleStatus =
		workouts[0]?.status === "completed" || workouts[0]?.status === "skipped"
			? "completed"
			: "in_progress";

	// For completed cycles, we know it's always 16/16
	const cycleWorkoutStats =
		cycleStatus === "completed"
			? { totalWorkouts: 16, completedWorkouts: 16 }
			: {
					totalWorkouts: 16,
					completedWorkouts: workouts.filter((w) => w.status === "completed")
						.length,
				};

	// Calculate sets for each workout
	const workoutsWithSets = workouts.map((workout) => {
		const totalSets = 25; // This should come from the actual workout data
		const completedSets =
			workout.status === Status.Completed
				? totalSets
				: workout.status === Status.InProgress
					? Math.floor(totalSets * 0.5)
					: 0;
		return {
			...workout,
			completedSets,
			totalSets,
		};
	});

	// Find current, next, and previous workouts
	const currentWorkout = workoutsWithSets.find(
		(w) => w.status === Status.InProgress,
	);
	const nextWorkouts = workoutsWithSets.filter(
		(w) => w.status === Status.Pending,
	);
	const previousWorkouts = workoutsWithSets.filter(
		(w) => w.status === Status.Completed || w.status === "skipped",
	);

	// Static data for now - we'll implement these calculations later
	const totalVolume = 45600; // lbs
	const consistency = 92; // percentage

	async function handleSkipRemainingWorkouts() {
		"use server";
		await skipRemainingWorkouts(cycleId);
		redirect("/modules/strength-training");
	}

	return (
		<CycleView
			cycleId={cycleId}
			cycleWorkoutStats={cycleWorkoutStats}
			totalVolume={totalVolume}
			consistency={consistency}
			currentWorkout={currentWorkout}
			nextWorkouts={nextWorkouts}
			previousWorkouts={previousWorkouts}
			onSkipRemainingWorkouts={handleSkipRemainingWorkouts}
		/>
	);
}
