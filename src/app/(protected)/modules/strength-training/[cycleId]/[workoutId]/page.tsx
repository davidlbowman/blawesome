import { WorkoutView } from "@/components/modules/strength-training/workout/WorkoutView";
import { getWorkoutDetails } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutDetails";
import { Status } from "@/drizzle/modules/strength-training/types";

export default async function Page({
	params,
}: {
	params: Promise<{ cycleId: string; workoutId: string }>;
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

	// Calculate stats
	const totalSets = sorted.reduce(
		(acc, exercise) => acc + exercise.sets.length,
		0,
	);

	const completedSetCount = sorted.reduce(
		(acc, exercise) =>
			acc +
			exercise.sets.filter(
				(s) =>
					s.status === Status.Enum.completed ||
					s.status === Status.Enum.skipped,
			).length,
		0,
	);

	const totalVolume = sorted.reduce(
		(acc, exercise) =>
			acc +
			exercise.sets.reduce(
				(setAcc, set) => setAcc + set.weight * (set.reps ?? 0),
				0,
			),
		0,
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

	return (
		<WorkoutView
			workoutId={workout.id}
			cycleId={cycleId}
			status={workout.status}
			date={workout.date}
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
			stats={{
				completedSetCount,
				totalSets,
				totalVolume,
				volumeChange: 0, // TODO: Calculate volume change
				primaryLiftWeight: mainExercise.oneRepMax ?? 0,
				primaryLiftChange: 0, // TODO: Calculate primary lift change
				consistency: (completedSetCount / totalSets) * 100,
			}}
			startingExerciseIndex={startingExerciseIndex}
			startingSetIndex={startingSetIndex}
		/>
	);
}
