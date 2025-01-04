import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import type { SetPerformance } from "@/drizzle/modules/strength-training/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRestTimer } from "@/hooks/useRestTimer";
import { CalendarDays, Dumbbell } from "lucide-react";
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
		primaryLift: string;
		date: Date;
		status: string;
	};
	mainExercise: ExerciseWithDefinition;
	accessoryExercises: ExerciseWithDefinition[];
	onStartWorkout: () => Promise<void>;
	onCompleteSet: (
		setId: string,
		exerciseId: string,
		performance: SetPerformance,
	) => Promise<void>;
	onSkipSet: (setId: string) => Promise<void>;
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
	onStartWorkout,
	onCompleteSet,
	onSkipSet,
}: WorkoutCardProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const restTimer = useRestTimer();
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSetIndex, setCurrentSetIndex] = useState(0);
	const [isCollectingData, setIsCollectingData] = useState(false);
	const [performance, setPerformance] = useState<SetPerformance>({ weight: 0 });

	const currentExercise =
		currentExerciseIndex === 0
			? mainExercise
			: accessoryExercises[currentExerciseIndex - 1];
	const currentSet = currentExercise?.sets[currentSetIndex];

	const handleStartWorkout = async () => {
		await onStartWorkout();
		setCurrentExerciseIndex(0);
		setCurrentSetIndex(0);
	};

	const handleStartSet = () => {
		if (workoutState.status === Status.Pending) {
			handleStartWorkout();
			return;
		}

		if (currentSet) {
			setIsCollectingData(true);
			setPerformance({
				weight: currentSet.weight,
				reps: currentSet.reps,
			});
		}
	};

	const handleCompleteSet = async () => {
		if (!currentSet) return;

		await onCompleteSet(
			currentSet.id,
			currentExercise.exercise.id,
			performance,
		);
		setIsCollectingData(false);
		restTimer.start();

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

	const handleSkipSet = async () => {
		if (!currentSet) return;

		await onSkipSet(currentSet.id);
		handleCompleteSet();
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

	const isLastSet =
		currentExerciseIndex === accessoryExercises.length - 1 &&
		currentSet?.setNumber === currentExercise?.sets.length;

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
							<Badge className={getStatusColor(workoutState.status)}>
								{workoutState.status.charAt(0).toUpperCase() +
									workoutState.status.slice(1)}
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
							workoutStatus={workoutState.status}
						/>
					)}

					<AccessoryExercises
						exercises={accessoryExercises}
						currentExerciseIndex={currentExerciseIndex}
						currentSetIndex={currentSetIndex}
						workoutStatus={workoutState.status}
					/>

					{workoutState.status === Status.Pending ? (
						<Button
							className="w-full"
							onClick={handleStartWorkout}
							disabled={
								workoutState.status === Status.Completed || isCollectingData
							}
						>
							Start Workout
						</Button>
					) : (
						<div className="grid grid-cols-2 gap-2">
							<Button
								onClick={handleStartSet}
								disabled={
									workoutState.status === Status.Completed || isCollectingData
								}
							>
								{isLastSet ? "Complete Workout" : "Rest"}
							</Button>
							{workoutState.status === Status.InProgress &&
							!isCollectingData ? (
								<Button variant="outline" onClick={handleSkipSet}>
									Skip Set
								</Button>
							) : (
								<div />
							)}
						</div>
					)}
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
