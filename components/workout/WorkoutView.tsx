"use client";

import { Statistic } from "@/components/Statistic";
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
import { startWorkout } from "@/drizzle/modules/strength-training/functions/workouts/startWorkout";
import { Status } from "@/drizzle/modules/strength-training/schemas";
import type { SetPerformance } from "@/drizzle/modules/strength-training/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRestTimer } from "@/hooks/useRestTimer";
import {
	CalendarDays,
	Dumbbell,
	Save,
	Target,
	TrendingUp,
	Weight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

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
		rpeMax: number | null;
		repMax: number | null;
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

interface WorkoutDetails {
	id: string;
	date: Date;
	status: string;
	exercises: ExerciseWithDefinition[];
}

interface WorkoutViewProps {
	workout: WorkoutDetails;
	cycleId: string;
}

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

export function WorkoutView({
	workout: initialWorkout,
	cycleId,
}: WorkoutViewProps) {
	const router = useRouter();
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const restTimer = useRestTimer();
	const [status, setStatus] = useState(initialWorkout.status);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSetIndex, setCurrentSetIndex] = useState(0);
	const [isPending, startTransition] = useTransition();
	const [completedSets, setCompletedSets] = useState<string[]>([]);
	const [showRestTimer, setShowRestTimer] = useState(false);
	const [performance, setPerformance] = useState<SetPerformance>(() => {
		const currentSet = initialWorkout.exercises[0]?.sets[0];
		return {
			weight: currentSet?.weight || 0,
			reps: currentSet?.reps,
		};
	});

	const sorted = [...initialWorkout.exercises].sort(
		(a, b) => a.exercise.order - b.exercise.order,
	);
	const mainExercise = sorted.find((e) => e.definition.type === "primary");
	const accessoryExercises = sorted.filter(
		(e) => e.definition.type !== "primary",
	);

	// Calculate stats
	const totalSets = sorted.reduce(
		(acc, exercise) => acc + exercise.sets.length,
		0,
	);

	const completedSetCount = sorted.reduce(
		(acc, exercise) =>
			acc +
			exercise.sets.filter(
				(s) => s.status === Status.Completed || s.status === Status.Skipped,
			).length,
		0,
	);

	const totalVolume = sorted.reduce(
		(acc, exercise) =>
			acc +
			exercise.sets.reduce((setAcc, set) => setAcc + set.weight * set.reps, 0),
		0,
	);

	// TODO: Calculate these from actual data
	const volumeChange = 120;
	const primaryLiftWeight = mainExercise?.sets[0].weight ?? 0;
	const primaryLiftChange = 5;
	const consistency = Math.round((completedSetCount / totalSets) * 100);

	const handleStartRest = useCallback(() => {
		setShowRestTimer(true);
		restTimer.start();
	}, [restTimer]);

	const handleCompleteSet = useCallback(async () => {
		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		setCompletedSets((prev) => [...prev, currentSet.id]);
		setShowRestTimer(false);

		if (currentSetIndex < currentExercise.sets.length - 1) {
			setCurrentSetIndex((prev) => prev + 1);
			const nextSet = currentExercise.sets[currentSetIndex + 1];
			setPerformance({
				weight: nextSet.weight,
				reps: nextSet.reps,
			});
		} else if (currentExerciseIndex < sorted.length - 1) {
			setCurrentExerciseIndex((prev) => prev + 1);
			setCurrentSetIndex(0);
			const nextExercise = sorted[currentExerciseIndex + 1];
			const nextSet = nextExercise.sets[0];
			setPerformance({
				weight: nextSet.weight,
				reps: nextSet.reps,
			});
		} else {
			startTransition(async () => {
				await completeSet(
					currentSet.id,
					currentExercise.exercise.id,
					initialWorkout.id,
					performance,
				);
				setStatus(Status.Completed);
				router.refresh();
			});
		}
	}, [
		currentExerciseIndex,
		currentSetIndex,
		sorted,
		initialWorkout.id,
		performance,
		router,
	]);

	const handleSkipSet = useCallback(() => {
		const currentExercise = sorted[currentExerciseIndex];

		// Move to next set or exercise
		if (currentSetIndex < currentExercise.sets.length - 1) {
			setCurrentSetIndex((prev) => prev + 1);
			const nextSet = currentExercise.sets[currentSetIndex + 1];
			setPerformance({
				weight: nextSet.weight,
				reps: nextSet.reps,
			});
		} else if (currentExerciseIndex < sorted.length - 1) {
			setCurrentExerciseIndex((prev) => prev + 1);
			setCurrentSetIndex(0);
			const nextExercise = sorted[currentExerciseIndex + 1];
			const nextSet = nextExercise.sets[0];
			setPerformance({
				weight: nextSet.weight,
				reps: nextSet.reps,
			});
		} else {
			setStatus(Status.Completed);
			router.refresh();
		}
	}, [currentExerciseIndex, currentSetIndex, sorted, router]);

	const handleWorkoutProgress = useCallback(async () => {
		if (status === Status.Pending) {
			startTransition(async () => {
				await startWorkout(initialWorkout.id);
				setStatus(Status.InProgress);
			});
			return;
		}

		if (status !== Status.InProgress) return;

		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		setPerformance({
			weight: currentSet.weight,
			reps: currentSet.reps,
		});
		handleStartRest();
	}, [
		status,
		initialWorkout.id,
		currentExerciseIndex,
		currentSetIndex,
		sorted,
		handleStartRest,
	]);

	const handleSkipRemainingExerciseSets = useCallback(() => {
		setCurrentExerciseIndex((prev) => prev + 1);
		setCurrentSetIndex(0);
		setShowRestTimer(false);

		if (currentExerciseIndex < sorted.length - 1) {
			const nextExercise = sorted[currentExerciseIndex + 1];
			const nextSet = nextExercise.sets[0];
			setPerformance({
				weight: nextSet.weight,
				reps: nextSet.reps,
			});
		} else {
			setStatus(Status.Completed);
			router.refresh();
		}
	}, [currentExerciseIndex, sorted, router]);

	const handleCompleteWorkout = useCallback(async () => {
		setStatus(Status.Completed);
		await completeSet(
			sorted[currentExerciseIndex].sets[currentSetIndex].id,
			sorted[currentExerciseIndex].exercise.id,
			initialWorkout.id,
			performance,
		);
		router.refresh();
	}, [
		currentExerciseIndex,
		currentSetIndex,
		initialWorkout.id,
		performance,
		sorted,
		router,
	]);

	if (!mainExercise) {
		return (
			<div className="container mx-auto p-6">
				<p className="text-lg text-muted-foreground">
					No primary exercise found for this workout.
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Stats Section */}
			<div className="grid gap-4 md:grid-cols-4">
				<Statistic
					icon={<Target className="h-4 w-4" />}
					value={`${completedSetCount}/${totalSets}`}
					label="Total Sets"
					description={
						completedSetCount === totalSets
							? "All sets completed"
							: `${totalSets - completedSetCount} sets remaining`
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
									<span>{formatDate(initialWorkout.date)}</span>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								size="icon"
								onClick={handleWorkoutProgress}
								className="text-muted-foreground hover:text-primary"
								disabled={
									status !== Status.InProgress ||
									isPending ||
									completedSets.length === 0
								}
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
					{/* Main Exercise */}
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

					{/* Accessory Exercises */}
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

					{/* Action Buttons */}
					{status !== Status.Completed ? (
						status === Status.Pending ? (
							<Button
								className="w-full"
								size="lg"
								onClick={handleWorkoutProgress}
								disabled={isPending}
							>
								{isPending ? "Processing..." : "Start Workout"}
							</Button>
						) : (
							<div className="grid grid-cols-2 gap-2">
								<Button
									className="w-full"
									size="lg"
									onClick={handleWorkoutProgress}
									disabled={isPending}
								>
									Rest
								</Button>
								{currentExerciseIndex === sorted.length - 1 &&
								currentSetIndex ===
									sorted[currentExerciseIndex].sets.length - 1 ? (
									<Button
										variant="outline"
										size="lg"
										onClick={handleCompleteWorkout}
										disabled={isPending}
									>
										Skip and Complete Workout
									</Button>
								) : (
									<Button
										variant="outline"
										size="lg"
										onClick={handleSkipSet}
										disabled={isPending}
									>
										Skip Set
									</Button>
								)}
							</div>
						)
					) : (
						<Link
							href={`/modules/strength-training/${cycleId}`}
							className="block w-full"
						>
							<Button className="w-full" size="lg">
								Return to Cycle
							</Button>
						</Link>
					)}
				</CardContent>
			</Card>

			{/* Rest Timer Dialog/Drawer */}
			{(() => {
				const currentExercise = sorted[currentExerciseIndex];
				const currentSet = currentExercise?.sets[currentSetIndex];
				if (!currentSet) return null;

				const dialogTitle = `${currentExercise.definition.name} - Set ${currentSet.setNumber}/${currentExercise.sets.length}`;
				const isPrimary = currentExercise.definition.type === "primary";
				const isLastSet = currentSet.setNumber === currentExercise.sets.length;

				const timerContent = (
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
												variant={
													performance.rpe === rpe ? "default" : "outline"
												}
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
							<Button onClick={handleCompleteSet}>
								{isLastSet && currentExerciseIndex === sorted.length - 1
									? "Complete Workout"
									: isLastSet
										? "Start Next Exercise"
										: "Start Next Set"}
							</Button>
							<Button
								variant="ghost"
								className="text-destructive hover:text-destructive"
								onClick={handleSkipRemainingExerciseSets}
							>
								Skip Remaining Exercise Sets
							</Button>
						</div>
					</div>
				);

				if (isDesktop) {
					return (
						<Dialog open={showRestTimer} onOpenChange={setShowRestTimer}>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>{dialogTitle}</DialogTitle>
								</DialogHeader>
								{timerContent}
							</DialogContent>
						</Dialog>
					);
				}

				return (
					<Drawer open={showRestTimer} onOpenChange={setShowRestTimer}>
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>{dialogTitle}</DrawerTitle>
							</DrawerHeader>
							{timerContent}
						</DrawerContent>
					</Drawer>
				);
			})()}
		</div>
	);
}
