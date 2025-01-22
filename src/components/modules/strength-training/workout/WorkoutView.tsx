"use client";

import { Card, CardContent } from "@/components/ui/card";
import { completeSet } from "@/drizzle/modules/strength-training/functions/sets/completeSet";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import { completeWorkout } from "@/drizzle/modules/strength-training/functions/workouts/completeWorkout";
import { skipRemainingExerciseSets } from "@/drizzle/modules/strength-training/functions/workouts/skipRemainingExerciseSets";
import { skipRemainingWorkoutSets } from "@/drizzle/modules/strength-training/functions/workouts/skipRemainingWorkoutSets";
import { skipSet } from "@/drizzle/modules/strength-training/functions/workouts/skipSet";
import { startWorkout } from "@/drizzle/modules/strength-training/functions/workouts/startWorkout";
import { Status } from "@/drizzle/modules/strength-training/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExerciseList } from "../exercise/ExerciseList";
import type { ExerciseWithSets } from "../exercise/types";
import { RestTimer } from "./RestTimer";
import { WorkoutActions } from "./WorkoutActions";
import { WorkoutHeader } from "./WorkoutHeader";
import { WorkoutStats } from "./WorkoutStats";

interface SetPerformance {
	weight: number;
	reps: number | null;
	rpe: number | null;
}

interface WorkoutViewProps {
	workoutId: string;
	cycleId: string;
	primaryExercise: ExerciseWithSets;
	accessoryExercises: ExerciseWithSets[];
	startingExerciseIndex: number;
	startingSetIndex: number;
	sets: AllSetsByWorkoutId;
}

export function WorkoutView({
	workoutId,
	cycleId,
	primaryExercise,
	accessoryExercises,
	startingExerciseIndex,
	startingSetIndex,
	sets,
}: WorkoutViewProps) {
	const router = useRouter();
	const [showRestTimer, setShowRestTimer] = useState(false);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(
		startingExerciseIndex,
	);
	const [currentSetIndex, setCurrentSetIndex] = useState(startingSetIndex);
	const [performance, setPerformance] = useState<SetPerformance>({
		weight: 0,
		reps: null,
		rpe: null,
	});

	const handleStartWorkout = async () => {
		await startWorkout(workoutId);
		router.refresh();
	};

	const handleStartRest = async () => {
		const currentExercise =
			currentExerciseIndex === 0
				? primaryExercise
				: accessoryExercises[currentExerciseIndex - 1];

		const currentSet = currentExercise.sets[currentSetIndex];

		setPerformance({
			weight: currentSet.weight,
			reps: currentExerciseIndex === 0 ? currentSet.reps : null,
			rpe: currentExerciseIndex === 0 ? null : 8, // Default RPE for accessory exercises
		});

		setShowRestTimer(true);
	};

	const handleSkipSet = async () => {
		await skipSet(workoutId);
		await router.refresh();

		if (currentExerciseIndex === 0) {
			if (currentSetIndex + 1 < primaryExercise.sets.length) {
				setCurrentSetIndex(currentSetIndex + 1);
			} else if (accessoryExercises.length > 0) {
				setCurrentExerciseIndex(1);
				setCurrentSetIndex(0);
			}
		} else {
			const currentAccessoryExercise =
				accessoryExercises[currentExerciseIndex - 1];
			if (currentSetIndex + 1 < currentAccessoryExercise.sets.length) {
				setCurrentSetIndex(currentSetIndex + 1);
			} else if (currentExerciseIndex < accessoryExercises.length) {
				setCurrentExerciseIndex(currentExerciseIndex + 1);
				setCurrentSetIndex(0);
			}
		}
	};

	const handleCompleteWorkout = async () => {
		await completeWorkout(workoutId);
		router.refresh();
	};

	const handleSkipRemainingWorkoutSets = async () => {
		await skipRemainingWorkoutSets(workoutId);
		await completeWorkout(workoutId);
		await router.refresh();
		router.push(`/modules/strength-training/${cycleId}`);
	};

	const handleCompleteSet = async () => {
		const currentExercise =
			currentExerciseIndex === 0
				? {
						id: primaryExercise.sets[currentSetIndex].id,
						exerciseId: primaryExercise.id,
					}
				: {
						id: accessoryExercises[currentExerciseIndex - 1].sets[
							currentSetIndex
						].id,
						exerciseId: accessoryExercises[currentExerciseIndex - 1].id,
					};

		if (!currentExercise.id) return;

		await completeSet(
			currentExercise.id,
			currentExercise.exerciseId,
			workoutId,
			performance,
		);

		await router.refresh();
		setShowRestTimer(false);

		if (currentExerciseIndex === 0) {
			if (currentSetIndex + 1 < primaryExercise.sets.length) {
				setCurrentSetIndex(currentSetIndex + 1);
			} else if (accessoryExercises.length > 0) {
				setCurrentExerciseIndex(1);
				setCurrentSetIndex(0);
			}
		} else {
			const currentAccessoryExercise =
				accessoryExercises[currentExerciseIndex - 1];
			if (currentSetIndex + 1 < currentAccessoryExercise.sets.length) {
				setCurrentSetIndex(currentSetIndex + 1);
			} else if (currentExerciseIndex < accessoryExercises.length) {
				setCurrentExerciseIndex(currentExerciseIndex + 1);
				setCurrentSetIndex(0);
			}
		}

		setPerformance({
			weight: 0,
			reps: null,
			rpe: null,
		});
	};

	const handleSkipRemainingExerciseSets = async () => {
		const currentExercise =
			currentExerciseIndex === 0
				? primaryExercise
				: accessoryExercises[currentExerciseIndex - 1];

		await skipRemainingExerciseSets(currentExercise.id);

		if (currentExerciseIndex === 0 && accessoryExercises.length > 0) {
			setCurrentExerciseIndex(1);
			setCurrentSetIndex(0);
		} else if (currentExerciseIndex < accessoryExercises.length) {
			setCurrentExerciseIndex(currentExerciseIndex + 1);
			setCurrentSetIndex(0);
		}

		setShowRestTimer(false);
		await router.refresh();
	};

	const isLastSet =
		currentExerciseIndex === accessoryExercises.length &&
		currentSetIndex ===
			(accessoryExercises[accessoryExercises.length - 1]?.sets.length ?? 0) - 1;

	const currentExerciseName =
		currentExerciseIndex === 0
			? primaryExercise.name
			: accessoryExercises[currentExerciseIndex - 1]?.name;

	// Fixed Code

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
	const workoutPrimaryLiftWeight = primaryExercise.oneRepMax ?? 0;
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
					currentExerciseIndex={currentExerciseIndex}
					currentSetIndex={currentSetIndex}
				/>

				<WorkoutActions
					status={workoutStatus}
					cycleId={cycleId}
					isLastSet={isLastSet}
					onStartWorkout={handleStartWorkout}
					onStartRest={handleStartRest}
					onSkipSet={handleSkipSet}
					onCompleteWorkout={handleCompleteWorkout}
					onSkipRemainingWorkoutSets={handleSkipRemainingWorkoutSets}
				/>

				<RestTimer
					show={showRestTimer}
					onOpenChange={setShowRestTimer}
					exerciseName={currentExerciseName}
					currentSetNumber={currentSetIndex + 1}
					totalSets={
						currentExerciseIndex === 0
							? primaryExercise.sets.length
							: (accessoryExercises[currentExerciseIndex - 1]?.sets.length ?? 0)
					}
					isPrimary={currentExerciseIndex === 0}
					isLastSet={isLastSet}
					performance={performance}
					onPerformanceChange={setPerformance}
					onCompleteSet={handleCompleteSet}
					onSkipRemainingExerciseSets={handleSkipRemainingExerciseSets}
				/>
			</CardContent>
		</Card>
	);
}
