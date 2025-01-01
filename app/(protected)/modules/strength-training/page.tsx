import { OneRMForm } from "@/components/1RMForm";
import { WorkoutCycleCard } from "@/components/CycleCard";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { createCycle } from "@/drizzle/modules/strength-training/functions/cycles/createCycle";
import { getCycles } from "@/drizzle/modules/strength-training/functions/cycles/getCycles";
import { hasAllMain1RepMaxes } from "@/drizzle/modules/strength-training/functions/oneRepMaxes/hasAllMain1RepMaxes";
import { getActiveWorkouts } from "@/drizzle/modules/strength-training/functions/workouts/getActiveWorkouts";
import {
	type PrimaryLift,
	Status,
} from "@/drizzle/modules/strength-training/schemas";

export default async function StrengthTrainingPage() {
	const userId = await getUserId();

	// Check if user has recorded all main lifts
	if (!(await hasAllMain1RepMaxes(userId))) {
		return <OneRMForm />;
	}

	// Get or create cycles
	let cycles = await getCycles(userId);
	if (cycles.length === 0) {
		cycles = [await createCycle(userId)];
	}

	// Find active cycle
	const activeCycle = cycles.find(
		(cycle) =>
			cycle.status === Status.Pending || cycle.status === Status.InProgress,
	);

	// Get active workouts if there's an active cycle
	const { totalWorkouts, completedWorkouts, nextWorkout } = activeCycle
		? await getActiveWorkouts(activeCycle.id)
		: { totalWorkouts: 0, completedWorkouts: 0, nextWorkout: undefined };

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-bold mb-6">Your Training Cycles</h1>
			<div className="grid gap-6 md:grid-cols-2">
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
