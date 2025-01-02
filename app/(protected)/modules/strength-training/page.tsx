import { OneRMForm } from "@/components/1RMForm";
import { WorkoutCycleCard } from "@/components/CycleCard";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { createCycle } from "@/drizzle/modules/strength-training/functions/cycles/createCycle";
import { getTrainingData } from "@/drizzle/modules/strength-training/functions/cycles/getTrainingData";
import { getWorkoutStats } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutStats";
import type { PrimaryLift } from "@/drizzle/modules/strength-training/schemas";
import { Status } from "@/drizzle/modules/strength-training/schemas";

export default async function StrengthTrainingPage() {
	const userId = await getUserId();

	// Get training data
	const {
		hasAllMaxes,
		cycles: initialCycles,
		workoutData,
	} = await getTrainingData(userId);

	// Check if user has recorded all main lifts
	if (!hasAllMaxes) {
		return <OneRMForm />;
	}

	// Handle cycle creation if needed
	let cycles = initialCycles;
	if (cycles.length === 0) {
		const newCycle = await createCycle(userId);
		cycles = [newCycle];
	}

	const { totalWorkouts, completedWorkouts, nextWorkout } =
		getWorkoutStats(workoutData);

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
