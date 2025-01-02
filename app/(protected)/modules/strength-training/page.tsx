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
	return await db.transaction(
		async (tx) => {
			// Get primary exercises and their one rep maxes in a single query
			const exerciseData = await tx
				.select({
					exercise: {
						id: exerciseDefinitions.id,
						type: exerciseDefinitions.type,
					},
					oneRepMax: {
						weight: oneRepMaxes.weight,
					},
				})
				.from(exerciseDefinitions)
				.leftJoin(
					oneRepMaxes,
					eq(oneRepMaxes.exerciseDefinitionId, exerciseDefinitions.id),
				)
				.where(eq(exerciseDefinitions.type, "primary"));

			const hasAllMaxes = exerciseData.every((data) => data.oneRepMax?.weight);

			// Get active cycle and its workouts in a single query
			const cycleData = await tx
				.select({
					cycle: {
						id: cycles.id,
						status: cycles.status,
						startDate: cycles.startDate,
						endDate: cycles.endDate,
						createdAt: cycles.createdAt,
						completedAt: cycles.completedAt,
					},
					workout: {
						id: workouts.id,
						primaryLift: workouts.primaryLift,
						status: workouts.status,
						sequence: workouts.sequence,
					},
				})
				.from(cycles)
				.leftJoin(workouts, eq(workouts.cycleId, cycles.id))
				.where(eq(cycles.userId, userId))
				.orderBy(desc(cycles.createdAt), workouts.sequence);

			// Process cycle data
			const userCycles = cycleData.reduce(
				(acc, row) => {
					if (!acc.some((c) => c.id === row.cycle.id)) {
						acc.push(row.cycle);
					}
					return acc;
				},
				[] as (typeof cycleData)[number]["cycle"][],
			);

			const workoutData = cycleData
				.filter((row) => row.workout?.id)
				.map((row) => row.workout as WorkoutsSelect);

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
