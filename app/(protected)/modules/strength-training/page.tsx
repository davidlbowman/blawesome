import { OneRMForm } from "@/components/1RMForm";
import { WorkoutCycleCard } from "@/components/CycleCard";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { db } from "@/drizzle/db";
import { createCycle } from "@/drizzle/modules/strength-training/functions/cycles/createCycle";
import {
	type PrimaryLift,
	Status,
	type WorkoutsSelect,
	cycles,
	exerciseDefinitions,
	oneRepMaxes,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { desc, eq } from "drizzle-orm";

async function getTrainingData(userId: string) {
	// Use a single read-only transaction for all queries
	return await db.transaction(
		async (tx) => {
			// Get all required data in parallel
			const [primaryExercises, userOneRepMaxes, userCycles] = await Promise.all(
				[
					tx
						.select()
						.from(exerciseDefinitions)
						.where(eq(exerciseDefinitions.type, "primary")),
					tx.select().from(oneRepMaxes).where(eq(oneRepMaxes.userId, userId)),
					tx
						.select()
						.from(cycles)
						.where(eq(cycles.userId, userId))
						.orderBy(desc(cycles.createdAt)),
				],
			);

			const hasAllMaxes = primaryExercises.every((def) =>
				userOneRepMaxes.some((max) => max.exerciseDefinitionId === def.id),
			);

			// If we have cycles, get the active cycle's workouts
			let workoutData: WorkoutsSelect[] = [];
			if (userCycles.length > 0) {
				const activeCycle = userCycles.find(
					(cycle) =>
						cycle.status === Status.Pending ||
						cycle.status === Status.InProgress,
				);
				if (activeCycle) {
					workoutData = await tx
						.select()
						.from(workouts)
						.where(eq(workouts.cycleId, activeCycle.id))
						.orderBy(workouts.sequence);
				}
			}

			return {
				hasAllMaxes,
				cycles: userCycles,
				workoutData,
			};
		},
		{
			accessMode: "read only",
			isolationLevel: "repeatable read",
		},
	);
}

export default async function StrengthTrainingPage() {
	const userId = await getUserId();

	// Get training data
	const {
		hasAllMaxes,
		cycles: initialCycles,
		workoutData: initialWorkoutData,
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

	const totalWorkouts = initialWorkoutData.length;
	const completedWorkouts = initialWorkoutData.filter(
		(w) => w.status === Status.Completed,
	).length;
	const nextWorkout = initialWorkoutData.find(
		(w) => w.status === Status.Pending,
	);

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
