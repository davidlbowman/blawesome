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
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import {
	Activity,
	CalendarDays,
	Dumbbell,
	Save,
	TrendingUp,
	Weight,
} from "lucide-react";
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

interface WorkoutProgressProps {
	workout: WorkoutDetails;
}

function WorkoutProgress({ workout }: WorkoutProgressProps) {
	// Calculate progress metrics
	const totalSets = workout.exercises.reduce(
		(acc: number, ex) => acc + ex.sets.length,
		0,
	);
	const completedSets = workout.exercises.reduce(
		(acc: number, ex) =>
			acc + ex.sets.filter((s) => s.status === "completed").length,
		0,
	);
	const totalVolume = workout.exercises.reduce(
		(acc: number, ex) =>
			acc +
			ex.sets.reduce(
				(setAcc: number, set) => setAcc + set.weight * (set.reps || 0),
				0,
			),
		0,
	);
	const primaryExercise = workout.exercises.find(
		(ex) => ex.definition.type === "primary",
	);
	const primaryLiftMax =
		primaryExercise?.sets.reduce(
			(max: number, set) => Math.max(max, set.weight),
			0,
		) ?? 0;

	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Sets</CardTitle>
					<Dumbbell className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{completedSets}/{totalSets}
					</div>
					<p className="text-xs text-muted-foreground">
						{completedSets === totalSets
							? "All sets completed"
							: "Sets remaining"}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Volume</CardTitle>
					<Weight className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{totalVolume.toLocaleString()} lbs
					</div>
					<p className="text-xs text-muted-foreground">
						Current workout volume
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Primary Lift</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{primaryLiftMax} lbs</div>
					<p className="text-xs text-muted-foreground">Heaviest set today</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Consistency</CardTitle>
					<Activity className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{Math.round((completedSets / totalSets) * 100)}%
					</div>
					<p className="text-xs text-muted-foreground">Workout completion</p>
				</CardContent>
			</Card>
		</div>
	);
}

interface WorkoutViewProps {
	workout: WorkoutDetails;
}

export function WorkoutView({ workout }: WorkoutViewProps) {
	const { toast } = useToast();
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const restTimer = useRestTimer(0);

	const [workoutState, setWorkoutState] = useState(workout);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSetIndex, setCurrentSetIndex] = useState(0);
	const [isCollectingData, setIsCollectingData] = useState(false);
	const [setPerformance, setSetPerformance] = useState<SetPerformance>({});

	const sorted = [...workoutState.exercises].sort(
		(a, b) => a.exercise.order - b.exercise.order,
	);
	const mainExercise = sorted.find((e) => e.definition.type === "primary");
	const accessoryExercises = sorted.filter(
		(e) => e.definition.type !== "primary",
	);

	const handleStartSet = useCallback(() => {
		if (workoutState.status === Status.Pending) {
			setWorkoutState((prev) => ({ ...prev, status: Status.InProgress }));
		}

		restTimer.stop();
		setIsCollectingData(true);

		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		setSetPerformance({
			weight: currentSet.weight,
			reps: currentSet.reps,
			rpe: currentExercise.definition.type !== "primary" ? 7 : undefined,
		});
		restTimer.start();
	}, [
		currentExerciseIndex,
		currentSetIndex,
		sorted,
		restTimer,
		workoutState.status,
	]);

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

			// Save to DB in background
			await completeSet(
				currentSet.id,
				currentExercise.exercise.id,
				workoutState.id,
				performance,
			);

			// Update local state
			setWorkoutState((prev) => {
				const newState = { ...prev };
				const exercise = newState.exercises[currentExerciseIndex];
				exercise.sets[currentSetIndex] = {
					...exercise.sets[currentSetIndex],
					...performance,
					status: "completed",
					completedAt: new Date(),
				};
				return newState;
			});

			if (currentSetIndex < currentExercise.sets.length - 1) {
				setCurrentSetIndex((prev) => prev + 1);
			} else if (currentExerciseIndex < sorted.length - 1) {
				setCurrentExerciseIndex((prev) => prev + 1);
				setCurrentSetIndex(0);
			} else {
				setWorkoutState((prev) => ({ ...prev, status: Status.Completed }));
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
		currentExerciseIndex,
		currentSetIndex,
		sorted,
		restTimer,
		toast,
		setPerformance,
		workoutState.id,
	]);

	const handleSkipSet = useCallback(async () => {
		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		try {
			// Optimistically update UI
			setIsCollectingData(false);
			restTimer.start();

			const performance = {
				weight: currentSet.weight,
				...(currentExercise.definition.type === "primary"
					? { reps: currentSet.reps }
					: { rpe: 7 }),
			};

			// Save to DB in background
			await completeSet(
				currentSet.id,
				currentExercise.exercise.id,
				workoutState.id,
				performance,
			);

			// Update local state
			setWorkoutState((prev) => {
				const newState = { ...prev };
				const exercise = newState.exercises[currentExerciseIndex];
				exercise.sets[currentSetIndex] = {
					...exercise.sets[currentSetIndex],
					...performance,
					status: "completed",
					completedAt: new Date(),
				};
				return newState;
			});

			if (currentSetIndex < currentExercise.sets.length - 1) {
				setCurrentSetIndex((prev) => prev + 1);
			} else if (currentExerciseIndex < sorted.length - 1) {
				setCurrentExerciseIndex((prev) => prev + 1);
				setCurrentSetIndex(0);
			} else {
				setWorkoutState((prev) => ({ ...prev, status: Status.Completed }));
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
	}, [
		currentExerciseIndex,
		currentSetIndex,
		sorted,
		restTimer,
		toast,
		workoutState.id,
	]);

	return (
		<div className="container space-y-8 py-8">
			<WorkoutProgress workout={workoutState} />

			<Card className="w-full max-w-4xl space-y-3">
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
							<Button
								variant="ghost"
								size="icon"
								onClick={handleCompleteSet}
								className="text-muted-foreground hover:text-primary"
								disabled={
									workoutState.status !== Status.InProgress || isCollectingData
								}
							>
								<Save className="h-5 w-5" />
							</Button>
							<Badge className={getStatusColor(workoutState.status)}>
								{workoutState.status.charAt(0).toUpperCase() +
									workoutState.status.slice(1)}
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
												workoutState.status === Status.InProgress &&
												currentExerciseIndex === 0
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
									workoutState.status === Status.InProgress &&
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
											{workoutState.status === Status.InProgress &&
											currentExerciseIndex === index + 1
												? `${currentSetIndex + 1}/${exercise.sets.length}`
												: exercise.sets.length}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>

					{workoutState.status === Status.Pending ? (
						<Button
							className="w-full"
							onClick={handleStartSet}
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
								Rest
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
							<Dialog
								open={isCollectingData}
								onOpenChange={setIsCollectingData}
							>
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
							<Drawer
								open={isCollectingData}
								onOpenChange={setIsCollectingData}
							>
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
		</div>
	);
}
