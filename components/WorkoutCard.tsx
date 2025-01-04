"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { completeSet } from "@/drizzle/modules/strength-training/functions/sets/completeSet";
import type { WorkoutDetails } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutDetails";
import { Status } from "@/drizzle/modules/strength-training/schemas";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Dumbbell, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const useRestTimer = (initialValue = 0) => {
	const [displayTime, setDisplayTime] = useState(initialValue);
	const startTimeRef = useRef<number | null>(null);
	const isRunningRef = useRef<boolean>(false);
	const frameRef = useRef<number | undefined>(undefined);

	const tick = useCallback((startTime: number) => {
		if (!isRunningRef.current) return;

		const elapsed = Math.floor((performance.now() - startTime) / 1000);
		setDisplayTime(elapsed);
		frameRef.current = requestAnimationFrame(() => tick(startTime));
	}, []);

	const start = useCallback(() => {
		const startTime = performance.now();
		startTimeRef.current = startTime;
		isRunningRef.current = true;
		frameRef.current = requestAnimationFrame(() => tick(startTime));
	}, [tick]);

	const stop = useCallback(() => {
		isRunningRef.current = false;
		startTimeRef.current = null;
		setDisplayTime(0);
		if (frameRef.current !== undefined) {
			cancelAnimationFrame(frameRef.current);
			frameRef.current = undefined;
		}
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (frameRef.current !== undefined) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	return {
		time: displayTime,
		start,
		stop,
		isRunning: isRunningRef.current,
		formatTime: (time: number) => {
			const minutes = Math.floor(time / 60);
			const seconds = time % 60;
			return `${minutes}:${seconds.toString().padStart(2, "0")}`;
		},
	};
};

// Fix types for DataCollectionInterface
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
	}>;
}

interface SetPerformance {
	weight?: number;
	reps?: number;
	rpe?: number;
}

const DataCollectionInterface = ({
	exercise,
	currentSet,
	performance,
	setPerformance,
	onComplete,
	restTimer,
	currentExerciseIndex,
	totalExercises,
	onSkipRemainingInExercise,
}: {
	exercise: ExerciseWithDefinition;
	currentSet: ExerciseWithDefinition["sets"][0];
	performance: SetPerformance;
	setPerformance: (perf: SetPerformance) => void;
	onComplete: () => void;
	restTimer: ReturnType<typeof useRestTimer>;
	currentExerciseIndex: number;
	totalExercises: number;
	onSkipRemainingInExercise: () => void;
}) => {
	const isPrimary = exercise.definition.type === "primary";
	const isLastSet = currentSet.setNumber === exercise.sets.length;
	const isLastExercise = currentExerciseIndex === totalExercises - 1;

	return (
		<div className="space-y-6 p-4">
			{/* Rest Timer */}
			<div className="text-center space-y-3">
				<div className="text-6xl font-mono font-bold tracking-tight">
					{restTimer.formatTime(restTimer.time)}
				</div>
				<p className="text-sm text-muted-foreground">
					{isPrimary
						? "Enter your actual performance for this set. If you completed the set as prescribed, you can leave the values unchanged."
						: "Enter the weight used and select your RPE (Rate of Perceived Exertion) for this set."}
				</p>
			</div>

			{isPrimary ? (
				<>
					<div className="space-y-4">
						<div>
							<Label htmlFor="weight">Weight (lbs)</Label>
							<Input
								id="weight"
								type="number"
								value={performance.weight}
								onChange={(e) =>
									setPerformance({
										...performance,
										weight: Number(e.target.value),
									})
								}
							/>
						</div>

						<div>
							<Label htmlFor="reps">Reps</Label>
							<Input
								id="reps"
								type="number"
								value={performance.reps}
								onChange={(e) =>
									setPerformance({
										...performance,
										reps: Number(e.target.value),
									})
								}
							/>
						</div>
					</div>
				</>
			) : (
				<>
					<div>
						<Label htmlFor="weight">Weight (lbs)</Label>
						<Input
							id="weight"
							type="number"
							value={performance.weight}
							onChange={(e) =>
								setPerformance({
									...performance,
									weight: Number(e.target.value),
								})
							}
						/>
					</div>

					<div>
						<Label>RPE</Label>
						<div className="grid grid-cols-6 gap-2">
							{[5, 6, 7, 8, 9, 10].map((rpe) => (
								<Button
									key={rpe}
									variant={performance.rpe === rpe ? "default" : "outline"}
									onClick={() => setPerformance({ ...performance, rpe })}
								>
									{rpe}
								</Button>
							))}
						</div>
					</div>
				</>
			)}

			<div className="flex flex-col gap-2 pt-4">
				<Button onClick={onComplete}>
					{isLastSet ? "Start Next Exercise" : "Start Next Set"}
				</Button>
				<Button
					variant="ghost"
					className="text-destructive hover:text-destructive"
					onClick={onSkipRemainingInExercise}
				>
					{isLastExercise && isLastSet
						? "Finish Workout"
						: "Skip Remaining Sets"}
				</Button>
			</div>
		</div>
	);
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

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
};

export function WorkoutCard({
	id,
	date,
	primaryLift,
	status: initialStatus,
	exercises,
}: WorkoutDetails) {
	const { toast } = useToast();
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const restTimer = useRestTimer(0);

	const [status, setStatus] = useState(initialStatus);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSetIndex, setCurrentSetIndex] = useState(0);
	const [isCollectingData, setIsCollectingData] = useState(false);
	const [setPerformance, setSetPerformance] = useState<{
		weight?: number;
		reps?: number;
		rpe?: number;
	}>({});

	const sorted = [...exercises].sort(
		(a, b) => a.exercise.order - b.exercise.order,
	);
	const mainExercise = sorted.find((e) => e.definition.type === "primary");
	const accessoryExercises = sorted.filter(
		(e) => e.definition.type !== "primary",
	);

	const handleStartSet = useCallback(() => {
		if (status === Status.Pending) {
			setStatus(Status.InProgress);
		}

		restTimer.stop();
		setIsCollectingData(true);

		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		console.log("Before:", {
			setId: currentSet.id,
			exerciseId: currentExercise.exercise.id,
			workoutId: id,
			currentData: {
				weight: currentSet.weight,
				reps: currentSet.reps,
				exerciseType: currentExercise.definition.type,
			},
		});

		setSetPerformance({
			weight: currentSet.weight,
			reps: currentSet.reps,
			rpe: currentExercise.definition.type !== "primary" ? 7 : undefined,
		});
		restTimer.start();
	}, [status, currentExerciseIndex, currentSetIndex, sorted, restTimer, id]);

	const handleCompleteSet = useCallback(async () => {
		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		try {
			// Optimistically update UI
			setIsCollectingData(false);
			restTimer.start();

			const performance = {
				weight: setPerformance.weight ?? currentSet.weight,
				...(currentExercise.definition.type === "primary"
					? { reps: setPerformance.reps ?? currentSet.reps }
					: { rpe: setPerformance.rpe ?? 7 }),
			};

			console.log("After:", {
				setId: currentSet.id,
				exerciseId: currentExercise.exercise.id,
				workoutId: id,
				performance,
				exerciseType: currentExercise.definition.type,
			});

			// Save to DB in background
			await completeSet(
				currentSet.id,
				currentExercise.exercise.id,
				id,
				performance,
			);

			// Update local state
			if (currentSetIndex < currentExercise.sets.length - 1) {
				setCurrentSetIndex((prev) => prev + 1);
			} else if (currentExerciseIndex < sorted.length - 1) {
				setCurrentExerciseIndex((prev) => prev + 1);
				setCurrentSetIndex(0);
			} else {
				setStatus(Status.Completed);
				restTimer.stop();
			}
		} catch (err: unknown) {
			console.error("Failed to save set:", err);
			toast({
				title: "Error saving set",
				description: "Failed to save your progress. Please try again.",
				variant: "destructive",
			});
			// Revert optimistic updates on error
			setIsCollectingData(true);
			restTimer.stop();
		}
	}, [
		id,
		currentExerciseIndex,
		currentSetIndex,
		sorted,
		restTimer,
		toast,
		setPerformance,
	]);

	const handleSkipSet = useCallback(async () => {
		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		try {
			// Optimistically update UI
			setIsCollectingData(false);
			restTimer.start();

			// Save to DB in background with default values
			await completeSet(currentSet.id, currentExercise.exercise.id, id, {
				weight: currentSet.weight,
				...(currentExercise.definition.type === "primary"
					? { reps: currentSet.reps }
					: { rpe: 7 }),
			});

			// Update local state
			if (currentSetIndex < currentExercise.sets.length - 1) {
				setCurrentSetIndex((prev) => prev + 1);
			} else if (currentExerciseIndex < sorted.length - 1) {
				setCurrentExerciseIndex((prev) => prev + 1);
				setCurrentSetIndex(0);
			} else {
				setStatus(Status.Completed);
				restTimer.stop();
			}
		} catch (err: unknown) {
			console.error("Failed to skip set:", err);
			toast({
				title: "Error skipping set",
				description: "Failed to skip set. Please try again.",
				variant: "destructive",
			});
			// Revert optimistic updates on error
			setIsCollectingData(true);
			restTimer.stop();
		}
	}, [id, currentExerciseIndex, currentSetIndex, sorted, restTimer, toast]);

	return (
		<Card className="w-full max-w-4xl space-y-3">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Dumbbell className="h-6 w-6 text-primary" />
						<div className="flex flex-col">
							<CardTitle className="text-2xl font-bold capitalize">
								{primaryLift} Day
							</CardTitle>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<CalendarDays className="h-4 w-4" />
								<span>{formatDate(date)}</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleCompleteSet}
							className="text-muted-foreground hover:text-primary"
							disabled={status !== Status.InProgress || isCollectingData}
						>
							<Save className="h-5 w-5" />
						</Button>
						<Badge className={getStatusColor(status)}>
							{status.charAt(0).toUpperCase() + status.slice(1)}
						</Badge>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{mainExercise && (
					<div className="rounded-lg bg-muted p-6">
						<h4 className="text-lg font-semibold mb-1">
							{mainExercise.definition.name}
						</h4>
						<p className="text-sm text-muted-foreground mb-4">
							{`Type: ${mainExercise.definition.type.charAt(0).toUpperCase()}${mainExercise.definition.type.slice(1)}`}
						</p>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Set</TableHead>
									<TableHead>Weight (lbs)</TableHead>
									<TableHead>Reps</TableHead>
									<TableHead>% of Max</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{mainExercise.sets.map((set) => (
									<TableRow
										key={set.id}
										className={
											status === Status.InProgress && currentExerciseIndex === 0
												? set.setNumber - 1 === currentSetIndex
													? "bg-primary/20"
													: set.setNumber - 1 < currentSetIndex
														? "bg-muted-foreground/10"
														: ""
												: ""
										}
									>
										<TableCell>{set.setNumber}</TableCell>
										<TableCell>{set.weight}</TableCell>
										<TableCell>{set.reps}</TableCell>
										<TableCell>{`${set.percentageOfMax}%`}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				<div className="grid gap-4 md:grid-cols-2">
					{accessoryExercises.map((exercise, index) => (
						<div
							key={`${exercise.exercise.id}-${exercise.definition.id}`}
							className={`rounded-lg bg-muted p-6 ${
								status === Status.InProgress &&
								currentExerciseIndex === index + 1
									? "ring-2 ring-primary"
									: ""
							}`}
						>
							<h4 className="text-base font-semibold mb-1">
								{exercise.definition.name}
							</h4>
							<p className="text-sm text-muted-foreground mb-3">
								{`Type: ${exercise.definition.type.charAt(0).toUpperCase()}${exercise.definition.type.slice(1)}`}
							</p>
							<div className="grid grid-cols-3 gap-4">
								<div className="flex flex-col">
									<span className="text-sm font-medium">RPE</span>
									<span className="text-2xl">
										{exercise.definition.rpeMax ?? 7}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-sm font-medium">Reps</span>
									<span className="text-2xl">
										{exercise.definition.repMax ?? 8}
									</span>
								</div>
								<div className="flex flex-col">
									<span className="text-sm font-medium">Sets</span>
									<span className="text-2xl">
										{status === Status.InProgress &&
										currentExerciseIndex === index + 1
											? `${currentSetIndex + 1}/${exercise.sets.length}`
											: exercise.sets.length}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>

				{status === Status.Pending ? (
					<Button
						className="w-full"
						onClick={handleStartSet}
						disabled={status === Status.Completed || isCollectingData}
					>
						Start Workout
					</Button>
				) : (
					<div className="grid grid-cols-2 gap-2">
						<Button
							onClick={handleStartSet}
							disabled={status === Status.Completed || isCollectingData}
						>
							Rest
						</Button>
						{status === Status.InProgress && !isCollectingData ? (
							<Button variant="outline" onClick={handleSkipSet}>
								Skip Set
							</Button>
						) : (
							<div />
						)}
					</div>
				)}

				{(() => {
					const currentExercise = sorted[currentExerciseIndex];
					const currentSet = currentExercise.sets[currentSetIndex];

					const handleSkipRemainingInExercise = () => {
						const isLastExercise = currentExerciseIndex === sorted.length - 1;
						const isLastSetOfWorkout =
							isLastExercise &&
							currentSet.setNumber === currentExercise.sets.length;

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

					return isDesktop ? (
						<Dialog open={isCollectingData} onOpenChange={setIsCollectingData}>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										{currentExercise.definition.name} - Set{" "}
										{currentSet.setNumber}/{currentExercise.sets.length}
									</DialogTitle>
								</DialogHeader>
								<DataCollectionInterface
									exercise={currentExercise}
									currentSet={currentSet}
									performance={setPerformance}
									setPerformance={setSetPerformance}
									onComplete={handleCompleteSet}
									restTimer={restTimer}
									currentExerciseIndex={currentExerciseIndex}
									totalExercises={sorted.length}
									onSkipRemainingInExercise={handleSkipRemainingInExercise}
								/>
							</DialogContent>
						</Dialog>
					) : (
						<Drawer open={isCollectingData} onOpenChange={setIsCollectingData}>
							<DrawerContent>
								<DrawerHeader>
									<DrawerTitle>
										{currentExercise.definition.name} - Set{" "}
										{currentSet.setNumber}/{currentExercise.sets.length}
									</DrawerTitle>
								</DrawerHeader>
								<DataCollectionInterface
									exercise={currentExercise}
									currentSet={currentSet}
									performance={setPerformance}
									setPerformance={setSetPerformance}
									onComplete={handleCompleteSet}
									restTimer={restTimer}
									currentExerciseIndex={currentExerciseIndex}
									totalExercises={sorted.length}
									onSkipRemainingInExercise={handleSkipRemainingInExercise}
								/>
							</DrawerContent>
						</Drawer>
					);
				})()}
			</CardContent>
		</Card>
	);
}
