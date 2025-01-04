import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { completeSet } from "@/drizzle/modules/strength-training/functions/sets/completeSet";
import { skipSet } from "@/drizzle/modules/strength-training/functions/sets/skipSet";
import { startWorkout } from "@/drizzle/modules/strength-training/functions/workouts/startWorkout";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import type { SetPerformance } from "@/drizzle/modules/strength-training/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRestTimer } from "@/hooks/useRestTimer";
import { CalendarDays, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccessoryExercises } from "./AccessoryExercises";
import { MainExercise } from "./MainExercise";
import { SetDataCollection } from "./SetDataCollection";

interface ExerciseWithDefinition {
	exercise: {
		id: string;
		order: number;
		status: string;
	};
	definition: {
		id: string;
		name: string;
		type: string;
		rpeMax: number;
		repMax: number;
	};
	sets: Array<{
		id: string;
		setNumber: number;
		weight: number;
		reps: number;
		percentageOfMax: number;
		status: string;
	}>;
}

interface WorkoutCardProps {
	workoutState: {
		id: string;
		primaryLift: string;
		date: Date;
		status: string;
	};
	mainExercise: ExerciseWithDefinition;
	accessoryExercises: ExerciseWithDefinition[];
	cycleId: string;
}

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
};

const getStatusColor = (status: string) => {
	switch (status) {
		case Status.Completed:
			return "bg-green-500 text-white";
		case Status.InProgress:
			return "bg-blue-500 text-white";
		default:
			return "bg-secondary text-secondary-foreground";
	}
};

export function WorkoutCard({
	workoutState,
	mainExercise,
	accessoryExercises,
	cycleId,
}: WorkoutCardProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const restTimer = useRestTimer();

	// Initialize state based on workout progress
	const findCurrentProgress = () => {
		// First check main exercise
		const mainInProgressSet = mainExercise.sets.findIndex(
			(s) => s.status === Status.InProgress,
		);
		if (mainInProgressSet !== -1) {
			return { exerciseIndex: 0, setIndex: mainInProgressSet };
		}

		// If main exercise is complete, check accessory exercises
		for (let i = 0; i < accessoryExercises.length; i++) {
			const exercise = accessoryExercises[i];
			const inProgressSet = exercise.sets.findIndex(
				(s) => s.status === Status.InProgress,
			);
			if (inProgressSet !== -1) {
				return { exerciseIndex: i + 1, setIndex: inProgressSet };
			}

			// If this exercise isn't started yet but previous is complete, this is next
			const isComplete = exercise.sets.every(
				(s) => s.status === Status.Completed,
			);
			if (!isComplete) {
				const firstPendingSet = exercise.sets.findIndex(
					(s) => s.status === Status.Pending,
				);
				if (firstPendingSet !== -1) {
					return { exerciseIndex: i + 1, setIndex: firstPendingSet };
				}
			}
		}

		// If no in-progress set found, find the first incomplete set
		if (mainExercise.sets.some((s) => s.status === Status.Pending)) {
			const firstPendingSet = mainExercise.sets.findIndex(
				(s) => s.status === Status.Pending,
			);
			return { exerciseIndex: 0, setIndex: firstPendingSet };
		}

		// Default to first set if nothing is in progress
		return { exerciseIndex: 0, setIndex: 0 };
	};

	const initialProgress = findCurrentProgress();
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(
		initialProgress.exerciseIndex,
	);
	const [currentSetIndex, setCurrentSetIndex] = useState(
		initialProgress.setIndex,
	);
	const [isCollectingData, setIsCollectingData] = useState(false);

	const currentExercise =
		currentExerciseIndex === 0
			? mainExercise
			: accessoryExercises[currentExerciseIndex - 1];
	const currentSet = currentExercise?.sets[currentSetIndex];

	// Initialize performance state based on current set
	const [performance, setPerformance] = useState<SetPerformance>(() => ({
		weight: currentSet?.weight || 0,
		reps: currentSet?.reps,
		rpe: currentExercise?.definition.type !== "primary" ? 7 : undefined,
	}));

	const [localWorkoutState, setLocalWorkoutState] = useState(workoutState);

	const handleStartWorkout = async () => {
		await startWorkout(workoutState.id);

		// Update local state to reflect the changes
		setLocalWorkoutState({
			...workoutState,
			status: Status.InProgress,
		});

		setCurrentExerciseIndex(0);
		setCurrentSetIndex(0);

		// Initialize performance for first set but don't open dialog
		const firstSet = mainExercise.sets[0];
		setPerformance({
			weight: firstSet.weight,
			reps: firstSet.reps,
			rpe: mainExercise.definition.type !== "primary" ? 7 : undefined,
		});
	};

	const handleStartSet = () => {
		if (localWorkoutState.status === Status.Pending) {
			handleStartWorkout();
			return;
		}

		// Only open dialog if not on the last set
		if (currentSet && !isLastSetOfLastExercise) {
			setIsCollectingData(true);
			setPerformance({
				weight: currentSet.weight,
				reps: currentSet.reps,
			});
		} else if (isLastSetOfLastExercise) {
			// If it's the last set, complete the workout
			handleCompleteSet();
		}
	};

	const handleCompleteSet = async () => {
		if (!currentSet) return;

		await completeSet(
			currentSet.id,
			currentExercise.exercise.id,
			workoutState.id,
			performance,
		);
		setIsCollectingData(false);
		restTimer.start();

		// Move to next set or exercise
		if (currentSetIndex === currentExercise.sets.length - 1) {
			if (currentExerciseIndex === accessoryExercises.length) {
				// Workout complete
				setPerformance({ weight: 0 });
				setLocalWorkoutState({
					...localWorkoutState,
					status: Status.Completed,
				});
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
	};

	const handleSkipSet = async () => {
		if (!currentSet) return;

		// Mark the set as skipped in the database
		await skipSet(currentSet.id);

		// Move to next set or exercise
		if (currentSetIndex === currentExercise.sets.length - 1) {
			if (currentExerciseIndex === accessoryExercises.length) {
				// Workout complete
				setPerformance({ weight: 0 });
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
	};

	const handleSkipRemainingInExercise = () => {
		const isLastExercise = currentExerciseIndex === accessoryExercises.length;
		const isLastSetOfWorkout =
			isLastExercise && currentSetIndex === currentExercise.sets.length - 1;

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

	const isLastSetOfLastExercise =
		currentExerciseIndex === accessoryExercises.length &&
		currentSetIndex === currentExercise?.sets.length - 1;

	const renderActionButtons = () => {
		if (localWorkoutState.status === Status.Pending) {
			return (
				<Button
					className="w-full"
					onClick={handleStartWorkout}
					disabled={isCollectingData}
				>
					Start Workout
				</Button>
			);
		}

		if (localWorkoutState.status === Status.Completed) {
			return (
				<Link
					href={`/modules/strength-training/${cycleId}`}
					className={buttonVariants({ className: "w-full" })}
				>
					Return to Cycle
				</Link>
			);
		}

		if (isLastSetOfLastExercise) {
			return (
				<Button
					className="w-full"
					onClick={handleStartSet}
					disabled={isCollectingData}
				>
					Complete Workout
				</Button>
			);
		}

		return (
			<div className="grid grid-cols-2 gap-2">
				<Button onClick={handleStartSet} disabled={isCollectingData}>
					Rest
				</Button>
				{!isCollectingData && (
					<Button variant="outline" onClick={handleSkipSet}>
						Skip Set
					</Button>
				)}
			</div>
		);
	};

	return (
		<>
			<Card className="w-full space-y-3">
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Dumbbell className="h-6 w-6 text-primary" />
							<div className="flex flex-col">
								<CardTitle className="text-2xl font-bold capitalize">
									{workoutState.primaryLift} Day
								</CardTitle>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<CalendarDays className="h-4 w-4" />
									<span>{formatDate(workoutState.date)}</span>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Badge className={getStatusColor(localWorkoutState.status)}>
								{localWorkoutState.status.charAt(0).toUpperCase() +
									localWorkoutState.status.slice(1)}
							</Badge>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{mainExercise && (
						<MainExercise
							exercise={mainExercise}
							currentExerciseIndex={currentExerciseIndex}
							currentSetIndex={currentSetIndex}
							workoutStatus={localWorkoutState.status}
						/>
					)}

					<AccessoryExercises
						exercises={accessoryExercises}
						currentExerciseIndex={currentExerciseIndex}
						currentSetIndex={currentSetIndex}
						workoutStatus={localWorkoutState.status}
					/>

					{renderActionButtons()}
				</CardContent>
			</Card>

			{(() => {
				if (!currentSet) return null;

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
								totalExercises={accessoryExercises.length + 1}
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
								totalExercises={accessoryExercises.length + 1}
								onSkipRemainingInExercise={handleSkipRemainingInExercise}
							/>
						</DrawerContent>
					</Drawer>
				);
			})()}
		</>
	);
}
