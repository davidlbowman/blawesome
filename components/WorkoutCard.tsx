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

function useInterval(callback: () => void, delay: number | null) {
	const savedCallback = useRef(callback);

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		if (delay !== null) {
			const id = setInterval(() => savedCallback.current(), delay);
			return () => clearInterval(id);
		}
	}, [delay]);
}

const useRestTimer = () => {
	const [displayTime, setDisplayTime] = useState(0);
	const startTimeRef = useRef<number | null>(null);
	const isRunningRef = useRef(false);

	const start = useCallback(() => {
		startTimeRef.current = performance.now();
		isRunningRef.current = true;
	}, []);

	const stop = useCallback(() => {
		isRunningRef.current = false;
		startTimeRef.current = null;
		setDisplayTime(0);
	}, []);

	useInterval(
		() => {
			if (startTimeRef.current && isRunningRef.current) {
				const elapsed = Math.floor(
					(performance.now() - startTimeRef.current) / 1000,
				);
				setDisplayTime(elapsed);
			}
		},
		isRunningRef.current ? 1000 : null,
	);

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
	onSkip,
}: {
	exercise: ExerciseWithDefinition;
	currentSet: ExerciseWithDefinition["sets"][0];
	performance: SetPerformance;
	setPerformance: (perf: SetPerformance) => void;
	onComplete: () => void;
	onSkip: () => void;
}) => {
	const isPrimary = exercise.definition.type === "primary";

	return (
		<div className="space-y-6 p-4">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">{exercise.definition.name}</h3>
				<p className="text-sm text-muted-foreground">
					Set {currentSet.setNumber}
				</p>
			</div>

			{isPrimary ? (
				<>
					<div className="space-y-4">
						<div>
							<Label htmlFor="weight">Weight (lbs)</Label>
							<div className="flex items-center space-x-2">
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
								<div className="flex space-x-1">
									<Button
										size="sm"
										variant="outline"
										onClick={() =>
											setPerformance({
												...performance,
												weight: (performance.weight || 0) - 5,
											})
										}
									>
										-5
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() =>
											setPerformance({
												...performance,
												weight: (performance.weight || 0) - 2.5,
											})
										}
									>
										-2.5
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() =>
											setPerformance({
												...performance,
												weight: (performance.weight || 0) + 2.5,
											})
										}
									>
										+2.5
									</Button>
									<Button
										size="sm"
										variant="outline"
										onClick={() =>
											setPerformance({
												...performance,
												weight: (performance.weight || 0) + 5,
											})
										}
									>
										+5
									</Button>
								</div>
							</div>
						</div>

						<div>
							<Label htmlFor="reps">Reps</Label>
							<div className="flex items-center space-x-2">
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
								<Button
									size="sm"
									variant="outline"
									onClick={() =>
										setPerformance({
											...performance,
											reps: (performance.reps || 0) - 1,
										})
									}
								>
									-1
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() =>
										setPerformance({
											...performance,
											reps: (performance.reps || 0) + 1,
										})
									}
								>
									+1
								</Button>
							</div>
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
						<div className="flex space-x-2">
							{[6, 7, 8, 9].map((rpe) => (
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

			<div className="flex justify-between pt-4">
				<Button variant="outline" onClick={onSkip}>
					Skip Set
				</Button>
				<Button onClick={onComplete}>Complete & Continue</Button>
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
	const restTimer = useRestTimer();

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
		setSetPerformance({
			weight: currentSet.weight,
			reps: currentSet.reps,
			rpe: currentExercise.definition.type !== "primary" ? 7 : undefined,
		});
	}, [status, currentExerciseIndex, currentSetIndex, sorted, restTimer]);

	const handleCompleteSet = useCallback(async () => {
		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		try {
			await completeSet(currentSet.id, currentExercise.exercise.id, id);

			setIsCollectingData(false);
			restTimer.start();

			if (currentSetIndex < currentExercise.sets.length - 1) {
				setCurrentSetIndex((prev) => prev + 1);
			} else if (currentExerciseIndex < sorted.length - 1) {
				setCurrentExerciseIndex((prev) => prev + 1);
				setCurrentSetIndex(0);
			} else {
				setStatus(Status.Completed);
				restTimer.stop();
				window.location.reload();
			}
		} catch (err: unknown) {
			console.error("Failed to save set:", err);
			toast({
				title: "Error saving set",
				description: "Failed to save your progress. Please try again.",
				variant: "destructive",
			});
		}
	}, [id, currentExerciseIndex, currentSetIndex, sorted, restTimer, toast]);

	const handleSkipSet = useCallback(async () => {
		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		try {
			await completeSet(currentSet.id, currentExercise.exercise.id, id);

			setIsCollectingData(false);
			restTimer.start();

			if (currentSetIndex < currentExercise.sets.length - 1) {
				setCurrentSetIndex((prev) => prev + 1);
			} else if (currentExerciseIndex < sorted.length - 1) {
				setCurrentExerciseIndex((prev) => prev + 1);
				setCurrentSetIndex(0);
			} else {
				setStatus(Status.Completed);
				restTimer.stop();
				window.location.reload();
			}
		} catch (err: unknown) {
			console.error("Failed to skip set:", err);
			toast({
				title: "Error skipping set",
				description: "Failed to skip set. Please try again.",
				variant: "destructive",
			});
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
														? "bg-green-500/10"
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

				<div className="flex justify-between items-center">
					{restTimer.isRunning && (
						<div className="text-xl font-mono">
							Rest: {restTimer.formatTime(restTimer.time)}
						</div>
					)}
					<Button
						onClick={handleStartSet}
						disabled={status === Status.Completed || isCollectingData}
					>
						{status === Status.Pending
							? "Start Workout"
							: currentExerciseIndex === 0 && currentSetIndex === 0
								? "Start First Set"
								: "Complete Set"}
					</Button>
				</div>

				{isDesktop ? (
					<Dialog open={isCollectingData} onOpenChange={setIsCollectingData}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Complete Set</DialogTitle>
							</DialogHeader>
							<DataCollectionInterface
								exercise={sorted[currentExerciseIndex]}
								currentSet={sorted[currentExerciseIndex].sets[currentSetIndex]}
								performance={setPerformance}
								setPerformance={setSetPerformance}
								onComplete={handleCompleteSet}
								onSkip={handleSkipSet}
							/>
						</DialogContent>
					</Dialog>
				) : (
					<Drawer open={isCollectingData} onOpenChange={setIsCollectingData}>
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>Complete Set</DrawerTitle>
							</DrawerHeader>
							<DataCollectionInterface
								exercise={sorted[currentExerciseIndex]}
								currentSet={sorted[currentExerciseIndex].sets[currentSetIndex]}
								performance={setPerformance}
								setPerformance={setSetPerformance}
								onComplete={handleCompleteSet}
								onSkip={handleSkipSet}
							/>
						</DrawerContent>
					</Drawer>
				)}
			</CardContent>
		</Card>
	);
}
