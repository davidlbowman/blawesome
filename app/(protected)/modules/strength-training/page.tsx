import { OneRMForm } from "@/components/1RMForm";
import { WorkoutCycleCard } from "@/components/CycleCard";
import { createCycle } from "@/lib/drizzle/cycles/createCycle";
import { getCycles } from "@/lib/drizzle/cycles/getCycles";
import { db } from "@/lib/drizzle/db";
import { getPrimaryExerciseDefinitions } from "@/lib/drizzle/exerciseDefinitions/getPrimaryExerciseDefinitions";
import { oneRepMaxes } from "@/lib/drizzle/schemas/strength-training";
import { Status, workouts } from "@/lib/drizzle/schemas/strength-training";
import { getUserId } from "@/lib/drizzle/users/getUserId";
import { eq } from "drizzle-orm";

async function getUserOneRepMaxes() {
	const userId = await getUserId();
	const allExerciseDefinitions = await getPrimaryExerciseDefinitions();

	const mainLiftNames = ["Squat", "Bench Press", "Deadlift", "Overhead Press"];
	const mainLifts = allExerciseDefinitions.filter((def) =>
		mainLiftNames.includes(def.name),
	);

	const lifts = await db
		.select()
		.from(oneRepMaxes)
		.where(eq(oneRepMaxes.userId, userId));

	const hasAllLifts = mainLifts.every((def) =>
		lifts.some((lift) => lift.exerciseDefinitionId === def.id),
	);

	return hasAllLifts;
}

export default async function StrengthTrainingPage() {
	const userId = await getUserId();
	const hasAllLifts = await getUserOneRepMaxes();

	if (!hasAllLifts) {
		return <OneRMForm />;
	}

	let cycles = await getCycles(userId);

	if (cycles.length === 0) {
		const newCycle = await createCycle(userId);
		cycles = [newCycle];
	}

	// Find the active cycle and its workouts
	const activeCycle = cycles.find(
		(cycle) =>
			cycle.status === Status.Pending || cycle.status === Status.InProgress,
	);

	const activeWorkouts = activeCycle
		? await db
				.select()
				.from(workouts)
				.where(eq(workouts.cycleId, activeCycle.id))
		: [];

	// Calculate stats
	const totalWorkouts = activeWorkouts.length;
	const completedWorkouts = activeWorkouts.filter(
		(w) => w.status === Status.Completed,
	).length;
	const nextWorkout =
		activeCycle?.status !== Status.Completed
			? activeWorkouts.find((w) => w.status === Status.Pending)
			: undefined;

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold mb-6">Your Training Cycles</h1>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{cycles.map((cycle) => {
					console.log("Cycle Status:", cycle.status);
					console.log(
						"Rendering Next Workout:",
						cycle.status !== Status.Completed && nextWorkout
							? {
									primaryLift: nextWorkout.primaryLift,
									status: nextWorkout.status,
								}
							: undefined,
					);
					return (
						<WorkoutCycleCard
							key={cycle.id}
							{...cycle}
							completedWorkouts={
								cycle.status === Status.Completed
									? totalWorkouts
									: completedWorkouts
							}
							totalWorkouts={totalWorkouts}
							nextWorkout={
								cycle.status !== Status.Completed && nextWorkout
									? {
											primaryLift: (nextWorkout.primaryLift
												.charAt(0)
												.toUpperCase() + nextWorkout.primaryLift.slice(1)) as
												| "Squat"
												| "Bench"
												| "Deadlift"
												| "Overhead",
											status: (nextWorkout.status.charAt(0).toUpperCase() +
												nextWorkout.status.slice(1)) as
												| "Pending"
												| "InProgress"
												| "Completed",
										}
									: undefined
							}
						/>
					);
				})}
			</div>
		</div>
	);
}
