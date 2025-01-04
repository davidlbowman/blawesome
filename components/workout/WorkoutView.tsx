"use client";

import { Statistic } from "@/components/Statistic";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { completeSet } from "@/drizzle/modules/strength-training/functions/sets/completeSet";
import { skipSet } from "@/drizzle/modules/strength-training/functions/sets/skipSet";
import { startWorkout } from "@/drizzle/modules/strength-training/functions/workouts/startWorkout";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import type { SetPerformance } from "@/drizzle/modules/strength-training/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRestTimer } from "@/hooks/useRestTimer";
import {
	CalendarDays,
	Dumbbell,
	Target,
	TrendingUp,
	Weight,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useOptimistic } from "react";
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

interface WorkoutViewProps {
	workout: {
		id: WorkoutsSelect["id"];
		date: WorkoutsSelect["date"];
		status: WorkoutsSelect["status"];
		exercises: ExerciseWithDefinition[];
	};
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
			return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
		case Status.InProgress:
			return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
		case Status.Skipped:
			return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
		default:
			return "bg-muted text-muted-foreground hover:bg-muted/80";
	}
};

export function WorkoutView({
	workout: initialWorkout,
	cycleId,
}: WorkoutViewProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const restTimer = useRestTimer();
	const [, startTransition] = useTransition();

	// Replace useState with useOptimistic
	const [optimisticWorkout, addOptimisticWorkout] = useOptimistic(
		initialWorkout,
		(
			currentWorkout,
			optimisticValue: {
				type: "start" | "complete" | "skip" | "complete_workout";
				exerciseId?: string;
				setId?: string;
				performance?: SetPerformance;
			},
		) => {
			const newWorkout = { ...currentWorkout };

			switch (optimisticValue.type) {
				case "start": {
					return {
						...newWorkout,
						status: Status.InProgress,
					};
				}

				case "complete": {
					if (!optimisticValue.exerciseId || !optimisticValue.setId)
						return newWorkout;
					const completeExercise = newWorkout.exercises.find(
						(e) => e.exercise.id === optimisticValue.exerciseId,
					);
					if (!completeExercise) return newWorkout;

					const completeSet = completeExercise.sets.find(
						(s) => s.id === optimisticValue.setId,
					);
					if (!completeSet) return newWorkout;

					completeSet.status = Status.Completed;
					if (optimisticValue.performance) {
						completeSet.weight = optimisticValue.performance.weight;
						if (optimisticValue.performance.reps) {
							completeSet.reps = optimisticValue.performance.reps;
						}
					}
					return newWorkout;
				}

				case "skip": {
					if (!optimisticValue.exerciseId || !optimisticValue.setId)
						return newWorkout;
					const skipExercise = newWorkout.exercises.find(
						(e) => e.exercise.id === optimisticValue.exerciseId,
					);
					if (!skipExercise) return newWorkout;

					const skipSet = skipExercise.sets.find(
						(s) => s.id === optimisticValue.setId,
					);
					if (!skipSet) return newWorkout;

					skipSet.status = Status.Skipped;
					return newWorkout;
				}

				case "complete_workout": {
					return {
						...newWorkout,
						status: Status.Completed,
					};
				}

				default:
					return newWorkout;
			}
		},
	);

	// Use optimisticWorkout instead of workout everywhere
	const mainExercise = optimisticWorkout.exercises.find(
		(e) => e.definition.type === "primary",
	);
	const accessoryExercises = optimisticWorkout.exercises.filter(
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
				(s) => s.status === Status.Completed || s.status === Status.Skipped,
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

	// Calculate stats
	const totalSets = optimisticWorkout.exercises.reduce(
		(acc, exercise) => acc + exercise.sets.length,
		0,
	);

	const completedSets = optimisticWorkout.exercises.reduce(
		(acc, exercise) =>
			acc +
			exercise.sets.filter(
				(s) => s.status === Status.Completed || s.status === Status.Skipped,
			).length,
		0,
	);

	const totalVolume = optimisticWorkout.exercises.reduce(
		(acc, exercise) =>
			acc +
			exercise.sets.reduce((setAcc, set) => setAcc + set.weight * set.reps, 0),
		0,
	);

	// TODO: Calculate these from actual data
	const volumeChange = 120;
	const primaryLiftWeight = mainExercise.sets[0].weight;
	const primaryLiftChange = 5;
	const consistency = Math.round((completedSets / totalSets) * 100);

	const handleStartWorkout = async () => {
		startTransition(async () => {
			// Optimistically update UI
			addOptimisticWorkout({ type: "start" });

			// Update database in background
			await startWorkout(optimisticWorkout.id);
		});

		setCurrentExerciseIndex(0);
		setCurrentSetIndex(0);

		// Initialize performance for first set
		const firstSet = mainExercise.sets[0];
		setPerformance({
			weight: firstSet.weight,
			reps: firstSet.reps,
			rpe: mainExercise.definition.type !== "primary" ? 7 : undefined,
		});
	};

	const handleStartSet = () => {
		if (optimisticWorkout.status === Status.Pending) {
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

		startTransition(async () => {
			// Optimistically update UI
			addOptimisticWorkout({
				type: "complete",
				exerciseId: currentExercise.exercise.id,
				setId: currentSet.id,
				performance,
			});

			// Update database in background
			await completeSet(
				currentSet.id,
				currentExercise.exercise.id,
				optimisticWorkout.id,
				performance,
			);
		});

		setIsCollectingData(false);
		restTimer.start();

		// Move to next set or exercise
		if (currentSetIndex === currentExercise.sets.length - 1) {
			if (currentExerciseIndex === accessoryExercises.length) {
				// Workout complete
				setPerformance({ weight: 0 });
				startTransition(() => {
					addOptimisticWorkout({ type: "complete_workout" });
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

		startTransition(async () => {
			// Optimistically update UI
			addOptimisticWorkout({
				type: "skip",
				exerciseId: currentExercise.exercise.id,
				setId: currentSet.id,
			});

			// Update database in background
			await skipSet(currentSet.id);
		});

		// Move to next set or exercise
		if (currentSetIndex === currentExercise.sets.length - 1) {
			if (currentExerciseIndex === accessoryExercises.length) {
				// Workout complete
				setPerformance({ weight: 0 });
				startTransition(() => {
					addOptimisticWorkout({ type: "complete_workout" });
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
		if (optimisticWorkout.status === Status.Pending) {
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

		if (optimisticWorkout.status === Status.Completed) {
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
		<div className="container mx-auto p-6 space-y-6">
			{/* Stats Card */}
			<div className="grid gap-4 md:grid-cols-4">
				<Statistic
					icon={<Target className="h-4 w-4" />}
					value={`${completedSets}/${totalSets}`}
					label="Total Sets"
					description={
						completedSets === totalSets
							? "All sets completed"
							: `${totalSets - completedSets} sets remaining`
					}
				/>
				<Statistic
					icon={<Weight className="h-4 w-4" />}
					value={`${totalVolume.toLocaleString()} lbs`}
					label="Total Volume"
					description={
						volumeChange > 0
							? `+${volumeChange} lbs from last workout`
							: volumeChange < 0
								? `${volumeChange} lbs from last workout`
								: "Same as last workout"
					}
				/>
				<Statistic
					icon={<Dumbbell className="h-4 w-4" />}
					value={`${primaryLiftWeight} lbs`}
					label="Primary Lift"
					description={
						primaryLiftChange > 0
							? `+${primaryLiftChange} lbs from last workout`
							: primaryLiftChange < 0
								? `${primaryLiftChange} lbs from last workout`
								: "Same as last workout"
					}
				/>
				<Statistic
					icon={<TrendingUp className="h-4 w-4" />}
					value={`${consistency}%`}
					label="Consistency"
					description="Sets completed as prescribed"
				/>
			</div>

			{/* Workout Card */}
			<Card className="w-full space-y-3">
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Dumbbell className="h-6 w-6 text-primary" />
							<div className="flex flex-col">
								<CardTitle className="text-2xl font-bold capitalize">
									{mainExercise.definition.name} Day
								</CardTitle>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<CalendarDays className="h-4 w-4" />
									<span>{formatDate(optimisticWorkout.date)}</span>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Badge className={getStatusColor(optimisticWorkout.status)}>
								{optimisticWorkout.status.charAt(0).toUpperCase() +
									optimisticWorkout.status.slice(1)}
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
							workoutStatus={optimisticWorkout.status}
						/>
					)}

					<AccessoryExercises
						exercises={accessoryExercises}
						currentExerciseIndex={currentExerciseIndex}
						currentSetIndex={currentSetIndex}
						workoutStatus={optimisticWorkout.status}
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
								<DialogDescription>
									Track your performance for this set. Enter your actual reps
									and RPE, or skip this set if needed.
								</DialogDescription>
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
								<DrawerDescription>
									Track your performance for this set. Enter your actual reps
									and RPE, or skip this set if needed.
								</DrawerDescription>
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
		</div>
	);
}
