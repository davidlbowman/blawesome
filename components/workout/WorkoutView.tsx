"use client";

import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import type { SetPerformance } from "@/drizzle/modules/strength-training/types";
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
	actions: {
		onStartWorkout: () => Promise<void>;
		onCompleteSet: (
			setId: string,
			exerciseId: string,
			performance: SetPerformance,
		) => Promise<void>;
		onSkipSet: (setId: string) => Promise<void>;
	};
}

export function WorkoutView({ workout, actions }: WorkoutViewProps) {
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

	return (
		<div className="container mx-auto p-6 space-y-6">
			<WorkoutStatsCard
				totalSets={workout.exercises.reduce(
					(acc, exercise) => acc + exercise.sets.length,
					0,
				)}
				completedSets={workout.exercises.reduce(
					(acc, exercise) =>
						acc +
						exercise.sets.filter((s) => s.status === Status.Completed).length,
					0,
				)}
				totalVolume={workout.exercises.reduce(
					(acc, exercise) =>
						acc +
						exercise.sets.reduce(
							(setAcc, set) => setAcc + set.weight * set.reps,
							0,
						),
					0,
				)}
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
				onStartWorkout={actions.onStartWorkout}
				onCompleteSet={actions.onCompleteSet}
				onSkipSet={actions.onSkipSet}
			/>
		</div>
	);
}
