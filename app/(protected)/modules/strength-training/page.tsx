import { OneRMForm } from "@/components/1RMForm";
import { WorkoutCycleCard } from "@/components/CycleCard";
import { createCycle } from "@/lib/drizzle/cycles/createCycle";
import { getCycles } from "@/lib/drizzle/cycles/getCycles";
import { db } from "@/lib/drizzle/db";
import { hasAllMainLifts } from "@/lib/drizzle/oneRepMaxes/hasAllMainLifts";
import {
	type PrimaryLift,
	Status,
	workouts,
} from "@/lib/drizzle/schemas/strength-training";
import { getUserId } from "@/lib/drizzle/users/getUserId";
import { eq } from "drizzle-orm";

export default async function StrengthTrainingPage() {
	const userId = await getUserId();

	// Check if user has recorded all main lifts
	if (!(await hasAllMainLifts(userId))) {
		return <OneRMForm />;
	}

	// Get or create cycles
	let cycles = await getCycles(userId);
	if (cycles.length === 0) {
		cycles = [await createCycle(userId)];
	}

	// Find active cycle and its workouts
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

	const totalWorkouts = activeWorkouts.length;
	const completedWorkouts = activeWorkouts.filter(
		(w) => w.status === Status.Completed,
	).length;
	const nextWorkout = activeWorkouts.find((w) => w.status === Status.Pending);

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold mb-6">Your Training Cycles</h1>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{cycles.map((cycle) => (
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
										primaryLift:
											nextWorkout.primaryLift as (typeof PrimaryLift)[keyof typeof PrimaryLift],
										status:
											nextWorkout.status as (typeof Status)[keyof typeof Status],
									}
								: undefined
						}
					/>
				))}
			</div>
		</div>
	);
}
