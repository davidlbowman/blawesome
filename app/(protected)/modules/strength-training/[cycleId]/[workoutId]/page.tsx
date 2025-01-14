import { WorkoutView } from "@/components/strength-training/workout/WorkoutView";
import { getWorkoutDetails } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutDetails";

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
				(s) => s.status === "completed" || s.status === "skipped",
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

	// TODO: Calculate these from actual data
	const volumeChange = 120;
	const primaryLiftWeight = mainExercise.sets[0]?.weight ?? 0;
	const primaryLiftChange = 5;
	const consistency = Math.round((completedSetCount / totalSets) * 100);

	// Find current exercise and set indices from DB state
	const currentExerciseIdx = sorted.findIndex(
		(e) => e.exercise.status === "in_progress",
	);
	const startingExerciseIndex =
		currentExerciseIdx === -1 ? 0 : currentExerciseIdx;

	const currentExercise = sorted[startingExerciseIndex];
	const currentSetIdx = currentExercise?.sets.findIndex(
		(s) => s.status === "in_progress",
	);
	const startingSetIndex = currentSetIdx === -1 ? 0 : currentSetIdx;

	return (
		<WorkoutView
			workoutId={workoutId}
			cycleId={cycleId}
			status={workout.status}
			date={workout.date}
			primaryExercise={{
				name: mainExercise.definition.name,
				type: mainExercise.definition.type,
				sets: mainExercise.sets.map((set) => ({
					id: set.id,
					setNumber: set.setNumber,
					weight: set.weight,
					reps: set.reps,
					percentageOfMax: set.percentageOfMax ?? 0,
					status: set.status,
				})),
			}}
			accessoryExercises={accessoryExercises.map((exercise) => ({
				exercise: {
					id: exercise.exercise.id,
				},
				definition: {
					id: exercise.definition.id,
					name: exercise.definition.name,
					type: exercise.definition.type,
					rpeMax: exercise.definition.rpeMax,
					repMax: exercise.definition.repMax,
				},
				sets: exercise.sets.map((set) => ({
					id: set.id,
					status: set.status,
					length: exercise.sets.length,
				})),
			}))}
			stats={{
				completedSetCount,
				totalSets,
				totalVolume,
				volumeChange,
				primaryLiftWeight,
				primaryLiftChange,
				consistency,
			}}
			startingExerciseIndex={startingExerciseIndex}
			startingSetIndex={startingSetIndex}
		/>
	);
}
