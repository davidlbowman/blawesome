import { WorkoutView } from "@/components/workout/WorkoutView";
import { completeSet } from "@/drizzle/modules/strength-training/functions/sets/completeSet";
import { skipSet } from "@/drizzle/modules/strength-training/functions/sets/skipSet";
import { getWorkoutById } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutById";
import { startWorkout } from "@/drizzle/modules/strength-training/functions/workouts/startWorkout";
import type { SetPerformance } from "@/drizzle/modules/strength-training/types";
import { notFound } from "next/navigation";

interface Props {
	params: Promise<{
		cycleId: string;
		workoutId: string;
	}>;
}

export default async function WorkoutPage({ params }: Props) {
	const { workoutId } = await params;
	const workout = await getWorkoutById(workoutId);

	if (!workout) {
		notFound();
	}

	return (
		<WorkoutView
			workout={workout}
			actions={{
				onStartWorkout: async () => {
					"use server";
					await startWorkout(workoutId);
				},
				onCompleteSet: async (
					setId: string,
					exerciseId: string,
					performance: SetPerformance,
				) => {
					"use server";
					await completeSet(setId, exerciseId, workoutId, performance);
				},
				onSkipSet: async (setId: string) => {
					"use server";
					await skipSet(setId);
				},
			}}
		/>
	);
}
