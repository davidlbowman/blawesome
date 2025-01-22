import { WorkoutView } from "@/components/modules/strength-training/workout/WorkoutView";
import { selectAllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import { getWorkoutDetails } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutDetails";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
import { notFound } from "next/navigation";

export default async function Page({
	params,
}: {
	params: Promise<{
		cycleId: CyclesSelect["id"];
		workoutId: WorkoutsSelect["id"];
	}>;
}) {
	const { cycleId, workoutId } = await params;
	const workout = await getWorkoutDetails(workoutId);

	if (!workout) {
		return <div>Workout not found</div>;
	}

	// Find and keep main exercise separate from current exercise
	const sorted = [...workout.exercises].sort(
		(a, b) => a.exercise.order - b.exercise.order,
	);

	const mainExercise = sorted.find((e) => e.definition.type === "primary");
	if (!mainExercise) {
		return <div>No primary exercise found for this workout.</div>;
	}

	const accessoryExercises = sorted.filter(
		(e) =>
			e.definition.type === "variation" || e.definition.type === "accessory",
	);

	// Find the first incomplete exercise and set
	let startingExerciseIndex = 0;
	let startingSetIndex = 0;

	for (let i = 0; i < sorted.length; i++) {
		const exercise = sorted[i];
		const incompleteSets = exercise.sets.findIndex(
			(s) =>
				s.status === Status.Enum.pending ||
				s.status === Status.Enum.in_progress,
		);

		if (incompleteSets !== -1) {
			startingExerciseIndex = i;
			startingSetIndex = incompleteSets;
			break;
		}
	}

	const allSetsResponse = await selectAllSetsByWorkoutId({
		workoutId: { id: workoutId },
	});

	if (!allSetsResponse.success || !allSetsResponse.data) {
		return notFound();
	}

	return (
		<WorkoutView
			workoutId={workout.id}
			cycleId={cycleId}
			primaryExercise={{
				id: mainExercise.exercise.id,
				name: mainExercise.definition.name,
				type: mainExercise.definition.type,
				oneRepMax: mainExercise.oneRepMax,
				sets: mainExercise.sets,
				status: mainExercise.exercise.status,
			}}
			accessoryExercises={accessoryExercises.map((e) => ({
				id: e.exercise.id,
				name: e.definition.name,
				type: e.definition.type,
				oneRepMax: e.oneRepMax,
				sets: e.sets,
				status: e.exercise.status,
			}))}
			startingExerciseIndex={startingExerciseIndex}
			startingSetIndex={startingSetIndex}
			sets={allSetsResponse.data}
		/>
	);
}
