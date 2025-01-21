import { Button } from "@/components/ui/button";
import { skipRemainingWorkouts } from "@/drizzle/modules/strength-training/functions/cycles/skipRemainingWorkouts";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
import { redirect } from "next/navigation";
import { WorkoutList } from "../workout/WorkoutList";
import { CycleStats } from "./CycleStats";

interface CycleViewProps {
	cycleId: Pick<CyclesSelect, "id">;
	workouts: Pick<
		WorkoutsSelect,
		| "id"
		| "cycleId"
		| "status"
		| "createdAt"
		| "completedAt"
		| "primaryLift"
		| "sequence"
	>[];
}

export function CycleView({ workouts, cycleId }: CycleViewProps) {
	const totalWorkouts = workouts.length;
	const completedWorkouts = workouts.filter(
		(workout) => workout.status === Status.Enum.completed,
	).length;
	const totalVolume = 10000;
	const consistency = 100;

	const currentWorkout = workouts.find(
		(workout) => workout.status === Status.Enum.in_progress,
	);
	const nextWorkouts = workouts.filter(
		(workout) => workout.status === Status.Enum.pending,
	);
	const previousWorkouts = workouts.filter(
		(workout) =>
			workout.status === Status.Enum.completed ||
			workout.status === Status.Enum.skipped,
	);

	async function handleSkipRemainingWorkouts() {
		"use server";
		await skipRemainingWorkouts(cycleId.id);
		redirect("/modules/strength-training");
	}

	return (
		<div className="container mx-auto p-6 space-y-8">
			<CycleStats
				totalWorkouts={totalWorkouts}
				completedWorkouts={completedWorkouts}
				totalVolume={totalVolume}
				consistency={consistency}
			/>

			<WorkoutList
				currentWorkout={currentWorkout}
				nextWorkouts={nextWorkouts}
				previousWorkouts={previousWorkouts}
			/>

			{nextWorkouts.length > 0 ? (
				<form action={handleSkipRemainingWorkouts}>
					<Button type="submit" variant="destructive" className="w-full">
						Skip Remaining Workouts & End Cycle
					</Button>
				</form>
			) : (
				<form action={handleSkipRemainingWorkouts}>
					<Button type="submit" className="w-full">
						Complete Cycle
					</Button>
				</form>
			)}
		</div>
	);
}
