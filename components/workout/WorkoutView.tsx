"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState } from "react";
import { useRestTimer } from "../../hooks/useRestTimer";
import { SetDataCollection } from "./SetDataCollection";
import { WorkoutCard } from "./WorkoutCard";
import { WorkoutStatsCard } from "./WorkoutStatsCard";

interface ExerciseWithDefinition {
	exercise: {
		id: string;
		order: number;
	};
	definition: {
		id: string;
		name: string;
		type: string;
		rpeMax: number | null;
		repMax: number | null;
	};
	sets: Array<{
		id: string;
		setNumber: number;
		weight: number;
		reps: number;
		percentageOfMax: number;
	}>;
}

interface WorkoutViewProps {
	workout: {
		id: string;
		date: Date;
		status: string;
		exercises: ExerciseWithDefinition[];
	};
}

interface SetPerformance {
	weight?: number;
	reps?: number;
	rpe?: number;
}

export function WorkoutView({ workout }: WorkoutViewProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const restTimer = useRestTimer();
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSetIndex, setCurrentSetIndex] = useState(0);
	const [isCollectingData, setIsCollectingData] = useState(false);
	const [performance, setPerformance] = useState<SetPerformance>({});

	const mainExercise = workout.exercises.find(
		(e) => e.definition.type === "primary",
	);
	const accessoryExercises = workout.exercises.filter(
		(e) => e.definition.type !== "primary",
	);

	// Early return if no main exercise is found
	if (!mainExercise) {
		return (
			<div className="container mx-auto p-6">
				<p className="text-lg text-muted-foreground">
					No primary exercise found for this workout.
				</p>
			</div>
		);
	}

	const handleStartSet = () => {
		if (workout.status === Status.Pending) {
			// Start the workout
			// TODO: Update workout status to InProgress
		}

		const currentExercise =
			currentExerciseIndex === 0
				? mainExercise
				: accessoryExercises[currentExerciseIndex - 1];
		const currentSet = currentExercise?.sets[currentSetIndex];

		if (currentSet) {
			setIsCollectingData(true);
			setPerformance({
				weight: currentSet.weight,
				reps: currentSet.reps,
			});
		}
	};

	const handleCompleteSet = () => {
		const currentExercise =
			currentExerciseIndex === 0
				? mainExercise
				: accessoryExercises[currentExerciseIndex - 1];
		const currentSet = currentExercise?.sets[currentSetIndex];

		if (!currentSet) return;

		// TODO: Record set performance
		// TODO: Update set status to completed

		setIsCollectingData(false);

		// Move to next set or exercise
		if (currentSetIndex === currentExercise.sets.length - 1) {
			if (currentExerciseIndex === accessoryExercises.length) {
				// Workout complete
				// TODO: Update workout status to Completed
				setPerformance({});
			} else {
				setCurrentExerciseIndex((prev) => prev + 1);
				setCurrentSetIndex(0);
				// Initialize performance for next exercise's first set
				const nextExercise = accessoryExercises[currentExerciseIndex];
				if (nextExercise) {
					setPerformance({
						weight: nextExercise.sets[0].weight,
						reps: nextExercise.sets[0].reps,
						rpe: nextExercise.definition.type !== "primary" ? 7 : undefined,
					});
				}
			}
		} else {
			setCurrentSetIndex((prev) => prev + 1);
			// Initialize performance for next set
			const nextSet = currentExercise.sets[currentSetIndex + 1];
			if (nextSet) {
				setPerformance({
					weight: nextSet.weight,
					reps: nextSet.reps,
					rpe: currentExercise.definition.type !== "primary" ? 7 : undefined,
				});
			}
		}

		restTimer.start();
	};

	const handleSkipSet = () => {
		// TODO: Mark set as skipped
		handleCompleteSet();
	};

	// Calculate stats
	const totalSets = workout.exercises.reduce(
		(acc, exercise) => acc + exercise.sets.length,
		0,
	);
	const completedSets = 0; // TODO: Calculate from actual data
	const totalVolume = workout.exercises.reduce(
		(acc, exercise) =>
			acc +
			exercise.sets.reduce((setAcc, set) => setAcc + set.weight * set.reps, 0),
		0,
	);

	const handleSkipRemainingInExercise = () => {
		const currentExercise = workout.exercises[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];
		const isLastExercise =
			currentExerciseIndex === workout.exercises.length - 1;
		const isLastSetOfWorkout =
			isLastExercise && currentSet.setNumber === currentExercise.sets.length;

		if (isLastSetOfWorkout) {
			handleCompleteSet(); // Complete workout
		} else {
			// Skip to next exercise
			setCurrentSetIndex(0);
			setCurrentExerciseIndex((prev) => prev + 1);
			setIsCollectingData(false);
			restTimer.start();
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<WorkoutStatsCard
				totalSets={totalSets}
				completedSets={completedSets}
				totalVolume={totalVolume}
				volumeChange={120} // TODO: Calculate from actual data
				primaryLiftWeight={mainExercise.sets[0].weight}
				primaryLiftChange={5} // TODO: Calculate from actual data
				consistency={98} // TODO: Calculate from actual data
			/>

			<WorkoutCard
				workoutState={{
					primaryLift: mainExercise.definition.name,
					date: workout.date,
					status: workout.status,
				}}
				mainExercise={mainExercise}
				accessoryExercises={accessoryExercises}
				currentExerciseIndex={currentExerciseIndex}
				currentSetIndex={currentSetIndex}
				isCollectingData={isCollectingData}
				onStartSet={handleStartSet}
				onCompleteSet={handleCompleteSet}
				onSkipSet={handleSkipSet}
			/>

			{(() => {
				const currentExercise = workout.exercises[currentExerciseIndex];
				const currentSet = currentExercise.sets[currentSetIndex];
				const dialogTitle = `${currentExercise.definition.name} - Set ${currentSet.setNumber}/${currentExercise.sets.length}`;

				return isDesktop ? (
					<Dialog open={isCollectingData} onOpenChange={setIsCollectingData}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{dialogTitle}</DialogTitle>
							</DialogHeader>
							<SetDataCollection
								exercise={currentExercise}
								currentSet={currentSet}
								performance={performance}
								setPerformance={setPerformance}
								onComplete={handleCompleteSet}
								restTimer={restTimer}
								currentExerciseIndex={currentExerciseIndex}
								totalExercises={workout.exercises.length}
								onSkipRemainingInExercise={handleSkipRemainingInExercise}
							/>
						</DialogContent>
					</Dialog>
				) : (
					<Drawer open={isCollectingData} onOpenChange={setIsCollectingData}>
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>{dialogTitle}</DrawerTitle>
							</DrawerHeader>
							<SetDataCollection
								exercise={currentExercise}
								currentSet={currentSet}
								performance={performance}
								setPerformance={setPerformance}
								onComplete={handleCompleteSet}
								restTimer={restTimer}
								currentExerciseIndex={currentExerciseIndex}
								totalExercises={workout.exercises.length}
								onSkipRemainingInExercise={handleSkipRemainingInExercise}
							/>
						</DrawerContent>
					</Drawer>
				);
			})()}
		</div>
	);
}
