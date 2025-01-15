"use client";

import { Card, CardContent } from "@/components/ui/card";
import { completeSet } from "@/drizzle/modules/strength-training/functions/sets/completeSet";
import { completeWorkout } from "@/drizzle/modules/strength-training/functions/workouts/completeWorkout";
import { skipRemainingWorkoutSets } from "@/drizzle/modules/strength-training/functions/workouts/skipRemainingWorkoutSets";
import { skipSet } from "@/drizzle/modules/strength-training/functions/workouts/skipSet";
import { startWorkout } from "@/drizzle/modules/strength-training/functions/workouts/startWorkout";
import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExerciseList } from "../exercise/ExerciseList";
import { RestTimer } from "./RestTimer";
import { WorkoutActions } from "./WorkoutActions";
import { WorkoutHeader } from "./WorkoutHeader";
import { WorkoutStats } from "./WorkoutStats";

type StatusType = (typeof Status)[keyof typeof Status];

interface Exercise {
	id: string;
	name: string;
	type: "primary" | "variation" | "accessory";
	sets: Array<{
		id: string;
		setNumber: number;
		weight: number;
		reps: number | null;
		percentageOfMax: number | null;
		status: StatusType;
	}>;
	status: StatusType;
}

interface WorkoutViewProps {
	workoutId: string;
	cycleId: string;
	status: StatusType;
	date: Date;
	primaryExercise: Exercise;
	accessoryExercises: Exercise[];
	stats: {
		completedSetCount: number;
		totalSets: number;
		totalVolume: number;
		volumeChange: number;
		primaryLiftWeight: number;
		primaryLiftChange: number;
		consistency: number;
	};
	startingExerciseIndex: number;
	startingSetIndex: number;
}

export function WorkoutView({
	workoutId,
	cycleId,
	status,
	date,
	primaryExercise,
	accessoryExercises,
	stats,
	startingExerciseIndex,
	startingSetIndex,
}: WorkoutViewProps) {
	const router = useRouter();
	const [showRestTimer, setShowRestTimer] = useState(false);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(
		startingExerciseIndex,
	);
	const [currentSetIndex, setCurrentSetIndex] = useState(startingSetIndex);
	const [performance, setPerformance] = useState<{
		weight: number;
		reps: number | null;
		rpe: number | null;
	}>({
		weight: 0,
		reps: null,
		rpe: null,
	});

	const handleStartWorkout = async () => {
		await startWorkout(workoutId);
		router.refresh();
	};

	const handleStartRest = async () => {
		setShowRestTimer(true);
	};

	const handleSkipSet = async () => {
		await skipSet(workoutId);
		router.refresh();
	};

	const handleCompleteWorkout = async () => {
		await completeWorkout(workoutId);
		router.refresh();
	};

	const handleSkipRemainingWorkoutSets = async () => {
		await skipRemainingWorkoutSets(workoutId);
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

		await completeSet(
			currentExercise.id,
			currentExercise.exerciseId,
			workoutId,
			performance,
		);
		setShowRestTimer(false);

		// Update current exercise and set indices
		if (currentExerciseIndex === 0) {
			// Primary exercise
			if (currentSetIndex + 1 < primaryExercise.sets.length) {
				setCurrentSetIndex(currentSetIndex + 1);
			} else if (accessoryExercises.length > 0) {
				setCurrentExerciseIndex(1);
				setCurrentSetIndex(0);
			}
		} else {
			// Accessory exercise
			const currentAccessoryExercise =
				accessoryExercises[currentExerciseIndex - 1];
			if (currentSetIndex + 1 < currentAccessoryExercise.sets.length) {
				setCurrentSetIndex(currentSetIndex + 1);
			} else if (currentExerciseIndex < accessoryExercises.length) {
				setCurrentExerciseIndex(currentExerciseIndex + 1);
				setCurrentSetIndex(0);
			}
		}

		router.refresh();
	};

	const handleSkipRemainingExerciseSets = async () => {
		const currentExercise =
			currentExerciseIndex === 0
				? primaryExercise
				: accessoryExercises[currentExerciseIndex - 1];

		// Skip all remaining sets in current exercise
		for (let i = currentSetIndex; i < currentExercise.sets.length; i++) {
			await skipSet(workoutId);
		}

		// Move to next exercise if available
		if (currentExerciseIndex === 0 && accessoryExercises.length > 0) {
			setCurrentExerciseIndex(1);
			setCurrentSetIndex(0);
		} else if (currentExerciseIndex < accessoryExercises.length) {
			setCurrentExerciseIndex(currentExerciseIndex + 1);
			setCurrentSetIndex(0);
		}

		setShowRestTimer(false);
		router.refresh();
	};

	const isLastSet =
		currentExerciseIndex === accessoryExercises.length &&
		currentSetIndex ===
			(accessoryExercises[accessoryExercises.length - 1]?.sets.length ?? 0) - 1;

	const currentExerciseName =
		currentExerciseIndex === 0
			? primaryExercise.name
			: accessoryExercises[currentExerciseIndex - 1]?.name;

	const allExercises = [primaryExercise, ...accessoryExercises];

	return (
		<Card>
			<CardContent className="p-6 space-y-6">
				<WorkoutHeader
					exerciseName={primaryExercise.name}
					date={date}
					status={status}
				/>

				<WorkoutStats {...stats} />

				<ExerciseList
					exercises={allExercises}
					currentExerciseIndex={currentExerciseIndex}
					currentSetIndex={currentSetIndex}
				/>

				<WorkoutActions
					status={status}
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
