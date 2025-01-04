"use client";

import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { WorkoutCard } from "./WorkoutCard";
import { WorkoutStatsCard } from "./WorkoutStatsCard";

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

export function WorkoutView({ workout, cycleId }: WorkoutViewProps) {
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

	// Calculate stats
	const totalSets = workout.exercises.reduce(
		(acc, exercise) => acc + exercise.sets.length,
		0,
	);

	const completedSets = workout.exercises.reduce(
		(acc, exercise) =>
			acc +
			exercise.sets.filter(
				(s) => s.status === Status.Completed || s.status === Status.Skipped,
			).length,
		0,
	);

	const totalVolume = workout.exercises.reduce(
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

	return (
		<div className="container mx-auto p-6 space-y-6">
			<WorkoutStatsCard
				totalSets={totalSets}
				completedSets={completedSets}
				totalVolume={totalVolume}
				volumeChange={volumeChange}
				primaryLiftWeight={primaryLiftWeight}
				primaryLiftChange={primaryLiftChange}
				consistency={consistency}
			/>

			<WorkoutCard
				workoutState={{
					id: workout.id,
					primaryLift: mainExercise.definition.name,
					date: workout.date,
					status: workout.status,
				}}
				mainExercise={mainExercise}
				accessoryExercises={accessoryExercises}
				cycleId={cycleId}
			/>
		</div>
	);
}
