"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import { updateSetStatusAndCascade } from "@/drizzle/modules/strength-training/functions/sets/updateSetStatusAndCascade";
import { updateSetsAndCascade } from "@/drizzle/modules/strength-training/functions/sets/updateSetsAndCascade";
import { completeWorkout } from "@/drizzle/modules/strength-training/functions/workouts/completeWorkout";
import { startWorkout } from "@/drizzle/modules/strength-training/functions/workouts/startWorkout";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExerciseList } from "../exercise/ExerciseList";
import { RestTimer } from "./RestTimer";
import { WorkoutActions } from "./WorkoutActions";
import { WorkoutHeader } from "./WorkoutHeader";
import { WorkoutStats } from "./WorkoutStats";

interface WorkoutViewProps {
	cycleId: Pick<CyclesSelect, "id">;
	workoutId: Pick<WorkoutsSelect, "id">;
	sets: AllSetsByWorkoutId;
}

export function WorkoutView({ cycleId, workoutId, sets }: WorkoutViewProps) {
	const router = useRouter();

	const startingSetIndex = sets.findIndex(
		(set) => set.sets.status === Status.Enum.pending,
	);

	const [currentSetIndex, setCurrentSetIndex] = useState<number | null>(
		startingSetIndex !== -1 ? startingSetIndex : null,
	);

	const [currentExercise, setCurrentExercise] = useState<string | null>(
		startingSetIndex !== -1
			? sets[startingSetIndex].exerciseDefinitions.name
			: null,
	);

	const [showRestTimer, setShowRestTimer] = useState(false);

	async function handleStartWorkout() {
		const startWorkoutResponse = await startWorkout({
			workoutId: { id: workoutId.id },
		});

		if (!startWorkoutResponse.success) {
			return; // TODO: Handle error
		}

		router.refresh();
	}

	async function handleCurrentSet(
		status: Status,
		weight: number,
		reps: number,
		rpe: number,
	) {
		if (currentSetIndex === null) return;
		const isLastSetInExercise =
			sets[currentSetIndex].exercises.id !==
			sets[currentSetIndex + 1]?.exercises.id;
		const isLastSetInWorkout = sets[currentSetIndex] === sets[sets.length - 1];

		const updateSetStatusAndCascadeResponse = await updateSetStatusAndCascade({
			setId: {
				id: sets[currentSetIndex].sets.id,
				status,
				weight,
				reps,
				rpe,
			},
			exerciseId: {
				id: sets[currentSetIndex].exercises.id,
				status: Status.Enum.completed,
			},
			workoutId: { id: workoutId.id, status: Status.Enum.completed },
			isLastSetInExercise,
			isLastSetInWorkout,
		});

		if (!updateSetStatusAndCascadeResponse.success) {
			return; // TODO: Handle error
		}

		if (isLastSetInWorkout) {
			setCurrentExercise(null);
			setCurrentSetIndex(null);
		} else {
			const nextSetIndex = currentSetIndex + 1;
			setCurrentExercise(sets[nextSetIndex].exerciseDefinitions.name);
			setCurrentSetIndex(nextSetIndex);
		}

		router.refresh();
	}

	async function handleSkipRemainingExerciseSets() {
		if (currentSetIndex === null) return;
		const isLastExerciseInWorkout =
			sets[currentSetIndex].exercises.id !==
			sets[currentSetIndex + 1]?.exercises.id;

		const remainingSetsInExercise = sets
			.slice(currentSetIndex)
			.filter((set) => set.exercises.id === sets[currentSetIndex].exercises.id)
			.map((set) => ({ id: set.sets.id }));

		const updateSetsAndCascadeResponse = await updateSetsAndCascade({
			setIds: remainingSetsInExercise,
			exerciseId: [{ id: sets[currentSetIndex].exercises.id }],
		});

		if (!updateSetsAndCascadeResponse.success) {
			return; // TODO: Handle error
		}

		if (isLastExerciseInWorkout) {
			setCurrentExercise(null);
			setCurrentSetIndex(null);
		} else {
			const nextSetIndex = currentSetIndex + remainingSetsInExercise.length;
			setCurrentExercise(sets[nextSetIndex].exerciseDefinitions.name);
			setCurrentSetIndex(nextSetIndex);
		}

		router.refresh();
	}

	async function handleSkipRemainingWorkoutSets() {
		if (currentSetIndex === null) return;

		const remainingSetsInWorkout = sets.slice(currentSetIndex).map((set) => ({
			id: set.sets.id,
		}));

		const remainingExercisesInWorkout = [
			...new Set(sets.slice(currentSetIndex).map((set) => set.exercises.id)),
		].map((id) => ({ id }));

		const updateSetsAndCascadeResponse = await updateSetsAndCascade({
			setIds: remainingSetsInWorkout,
			exerciseId: remainingExercisesInWorkout,
			workoutId: { id: workoutId.id },
		});

		if (!updateSetsAndCascadeResponse.success) {
			return; // TODO: Handle error
		}

		setCurrentExercise(null);
		setCurrentSetIndex(null);
		router.refresh();
	}

	async function handleCompleteWorkout() {
		const completeWorkoutResponse = await completeWorkout({
			workoutId: { id: workoutId.id },
		});

		if (!completeWorkoutResponse.success) {
			return; // TODO: Handle error
		}

		router.refresh();
	}

	function handleStartRest() {
		setShowRestTimer(!showRestTimer);
	}

	// Workout Header
	const workoutPrimaryLift = sets[0].workouts.primaryLift;
	const workoutCreatedAt = sets[0].workouts.createdAt;
	const workoutStatus = sets[0].workouts.status;

	// Workout Stats
	const workoutCompletedSetCount = sets.filter(
		(set) => set.sets.status === Status.Enum.completed,
	).length;
	const workoutTotalSets = sets.length;
	const workoutTotalVolume = sets.reduce(
		(acc, set) => acc + set.sets.weight * set.sets.reps,
		0,
	);
	const workoutVolumeChange = 0; // TODO: Calculate volume change
	const workoutPrimaryLiftWeight = 0; // TODO: Calculate primary lift weight
	const workoutPrimaryLiftChange = 0; // TODO: Calculate primary lift change
	const workoutConsistency =
		(workoutCompletedSetCount / workoutTotalSets) * 100;

	return (
		<Card>
			<CardContent className="p-6 space-y-6">
				<WorkoutHeader
					exerciseName={workoutPrimaryLift}
					date={workoutCreatedAt}
					status={workoutStatus}
				/>

				<WorkoutStats
					completedSetCount={workoutCompletedSetCount}
					totalSets={workoutTotalSets}
					totalVolume={workoutTotalVolume}
					volumeChange={workoutVolumeChange}
					primaryLiftWeight={workoutPrimaryLiftWeight}
					primaryLiftChange={workoutPrimaryLiftChange}
					consistency={workoutConsistency}
				/>

				<ExerciseList
					sets={sets}
					currentExercise={currentExercise}
					currentSetIndex={currentSetIndex}
				/>

				<WorkoutActions
					status={workoutStatus}
					cycleId={cycleId.id}
					onStartWorkout={handleStartWorkout}
					onStartRest={handleStartRest}
					onHandleCurrentSet={handleCurrentSet}
					onCompleteWorkout={handleCompleteWorkout}
					onSkipRemainingWorkoutSets={handleSkipRemainingWorkoutSets}
				/>

				{showRestTimer && currentSetIndex !== null && (
					<RestTimer
						show={showRestTimer}
						set={sets[currentSetIndex]}
						setShowRestTimer={setShowRestTimer}
						onOpenChange={setShowRestTimer}
						onHandleCurrentSet={handleCurrentSet}
						onSkipRemainingExerciseSets={handleSkipRemainingExerciseSets}
					/>
				)}
			</CardContent>
		</Card>
	);
}
