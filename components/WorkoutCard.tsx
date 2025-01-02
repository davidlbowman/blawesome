"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CalendarDays, Dumbbell, Save } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

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
	const [status, setStatus] = useState(initialStatus);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [currentSetIndex, setCurrentSetIndex] = useState(0);
	const [isPending, startTransition] = useTransition();
	const [completedSets, setCompletedSets] = useState<string[]>([]);

	const sorted = [...exercises].sort(
		(a, b) => a.exercise.order - b.exercise.order,
	);
	const mainExercise = sorted.find((e) => e.definition.type === "primary");
	const accessoryExercises = sorted.filter(
		(e) => e.definition.type !== "primary",
	);

	const handleStartWorkout = useCallback(async () => {
		if (status === Status.Pending) {
			setStatus(Status.InProgress);
		}
	}, [status]);

	const saveProgress = useCallback(async () => {
		if (completedSets.length === 0) return;

		startTransition(async () => {
			await completeSet(
				completedSets[completedSets.length - 1],
				sorted[currentExerciseIndex].exercise.id,
				id,
			);
			setCompletedSets([]);
		});
	}, [completedSets, id, sorted, currentExerciseIndex]);

	const handleSaveWorkout = useCallback(async () => {
		if (status === Status.InProgress) {
			await saveProgress();
		}
	}, [status, saveProgress]);

	const handleWorkoutProgress = useCallback(async () => {
		if (status !== Status.InProgress) return;

		const currentExercise = sorted[currentExerciseIndex];
		const currentSet = currentExercise.sets[currentSetIndex];

		setCompletedSets((prev) => [...prev, currentSet.id]);

		if (currentSetIndex < currentExercise.sets.length - 1) {
			setCurrentSetIndex((prev) => prev + 1);
		} else if (currentExerciseIndex < sorted.length - 1) {
			setCurrentExerciseIndex((prev) => prev + 1);
			setCurrentSetIndex(0);
		} else {
			startTransition(async () => {
				await completeSet(currentSet.id, currentExercise.exercise.id, id);
				setStatus(Status.Completed);
				queueMicrotask(() => {
					window.location.reload();
				});
			});
		}
	}, [status, currentExerciseIndex, currentSetIndex, sorted, id]);

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
							onClick={handleSaveWorkout}
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

				{status !== Status.Completed && (
					<Button
						className="w-full"
						size="lg"
						onClick={
							status === Status.Pending
								? handleStartWorkout
								: handleWorkoutProgress
						}
						disabled={status === Status.Completed || isPending}
					>
						{isPending
							? "Processing..."
							: status === Status.Pending
								? "Start Workout"
								: currentSetIndex < sorted[currentExerciseIndex].sets.length - 1
									? "Next Set"
									: currentExerciseIndex < sorted.length - 1
										? "Next Exercise"
										: "Finish Workout"}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
