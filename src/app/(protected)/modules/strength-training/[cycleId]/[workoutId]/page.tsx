import { WorkoutView } from "@/components/modules/strength-training/workout/WorkoutView";
import { getWorkoutDetails } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutDetails";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";

type ExerciseType = "primary" | "variation" | "accessory";

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
				(s) => s.status === Status.Completed || s.status === Status.Skipped,
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
		(e) => e.exercise.status === Status.InProgress,
	);
	const startingExerciseIndex =
		currentExerciseIdx === -1 ? 0 : currentExerciseIdx;

	const currentExercise = sorted[startingExerciseIndex];
	const currentSetIdx = currentExercise?.sets.findIndex(
		(s) => s.status === Status.InProgress,
	);
	const startingSetIndex = currentSetIdx === -1 ? 0 : currentSetIdx;

	return (
		<WorkoutView
			workoutId={workoutId}
			cycleId={cycleId}
			status={workout.status}
			date={workout.date}
			primaryExercise={{
				id: mainExercise.exercise.id,
				name: mainExercise.definition.name,
				type: mainExercise.definition.type as ExerciseType,
				sets: mainExercise.sets.map((set) => ({
					id: set.id,
					setNumber: set.setNumber,
					weight: set.weight,
					reps: set.reps ?? 8,
					rpe: set.rpe ?? 8,
					status: set.status,
				})),
				status: mainExercise.exercise.status,
			}}
			accessoryExercises={accessoryExercises.map((exercise) => ({
				id: exercise.exercise.id,
				name: exercise.definition.name,
				type: exercise.definition.type as ExerciseType,
				sets: exercise.sets.map((set) => ({
					id: set.id,
					setNumber: set.setNumber,
					weight: set.weight,
					reps: set.reps ?? 8,
					rpe: set.rpe ?? 8,
					status: set.status,
				})),
				status: exercise.exercise.status,
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
