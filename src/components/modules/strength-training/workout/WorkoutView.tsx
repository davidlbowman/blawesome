"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
import { ExerciseList } from "../exercise/ExerciseList";
import { WorkoutHeader } from "./WorkoutHeader";
import { WorkoutStats } from "./WorkoutStats";

interface WorkoutViewProps {
	cycleId: Pick<CyclesSelect, "id">;
	workoutId: Pick<WorkoutsSelect, "id">;
	sets: AllSetsByWorkoutId;
}

export function WorkoutView({ cycleId, workoutId, sets }: WorkoutViewProps) {
	console.log(cycleId, workoutId);
	// const router = useRouter();

	// const startingSetIndex = sets.findIndex(
	// 	(set) => set.sets.status === Status.Enum.pending,
	// );
	// const [currentSetIndex, setCurrentSetIndex] = useState<number | null>(
	// 	startingSetIndex !== -1 ? startingSetIndex : null,
	// );

	// async function handleStartWorkout() {
	// 	const startWorkoutResponse = await startWorkout({
	// 		workoutId: { id: workoutId.id },
	// 	});

	// 	if (!startWorkoutResponse.success) {
	// 		return; // TODO: Handle error
	// 	}

	// 	router.refresh();
	// }

	// async function handleSkipSet() {
	// 	if (currentSetIndex === null) return;

	// 	const skipSetResponse = await skipSets({
	// 		setIds: [{ id: sets[currentSetIndex].sets.id }],
	// 	});

	// 	if (!skipSetResponse.success) {
	// 		return; // TODO: Handle error
	// 	}

	// 	setCurrentSetIndex(currentSetIndex + 1);
	// 	router.refresh();
	// }

	// async function handleCompleteSet() {
	// 	if (currentSetIndex === null) return;

	// 	const completeSetResponse = await completeSet({
	// 		setId: { id: sets[currentSetIndex].sets.id },
	// 	});

	// 	if (!completeSetResponse.success) {
	// 		return; // TODO: Handle error
	// 	}

	// 	setCurrentSetIndex(currentSetIndex + 1);
	// 	router.refresh();
	// }

	// async function handleSkipRemainingExerciseSets() {
	// 	if (currentSetIndex === null) return;
	// 	const currentExerciseId = sets[currentSetIndex].exercises.id;
	// 	const remainingSetsInExercise = sets
	// 		.slice(currentSetIndex)
	// 		.filter((set) => set.exercises.id === currentExerciseId)
	// 		.map((set) => ({ id: set.sets.id }));

	// 	const skipSetsResponse = await skipSets({
	// 		setIds: remainingSetsInExercise,
	// 	});

	// 	if (!skipSetsResponse.success) {
	// 		return; // TODO: Handle error
	// 	}

	// 	setCurrentSetIndex(currentSetIndex + remainingSetsInExercise.length);
	// 	router.refresh();
	// }

	// async function handleSkipRemainingWorkoutSets() {
	// 	if (currentSetIndex === null) return;
	// 	const remainingSetsInWorkout = sets.slice(currentSetIndex).map((set) => ({
	// 		id: set.sets.id,
	// 	}));

	// 	const skipSetsResponse = await skipSets({
	// 		setIds: remainingSetsInWorkout,
	// 	});

	// 	if (!skipSetsResponse.success) {
	// 		return; // TODO: Handle error
	// 	}

	// 	setCurrentSetIndex(null);
	// 	router.refresh();
	// }

	// async function handleCompleteWorkout() {
	// 	const completeWorkoutResponse = await completeWorkout({
	// 		workoutId: { id: workoutId.id },
	// 	});

	// 	if (!completeWorkoutResponse.success) {
	// 		return; // TODO: Handle error
	// 	}

	// 	router.refresh();
	// }

	// TODO:handleStartRest

	// Workout Header
	const workoutPrimaryLift = sets[0].workouts.primaryLift;
	const workoutCreatedAt = sets[0].workouts.createdAt;
	const workoutStatus = sets[0].workouts.status;

	// Workout Stats
	const workoutCompletedSetCount = sets.filter(
		(set) => set.sets.status === Status.Enum.completed,
	).length;
	const workoutTotalSets = sets.length;
	const workoutTotalVolume = sets.reduce(
		(acc, set) => acc + set.sets.weight * set.sets.reps,
		0,
	);
	const workoutVolumeChange = 0; // TODO: Calculate volume change
	const workoutPrimaryLiftWeight = 0; // TODO: Calculate primary lift weight
	const workoutPrimaryLiftChange = 0; // TODO: Calculate primary lift change
	const workoutConsistency =
		(workoutCompletedSetCount / workoutTotalSets) * 100;

	return (
		<Card>
			<CardContent className="p-6 space-y-6">
				<WorkoutHeader
					exerciseName={workoutPrimaryLift}
					date={workoutCreatedAt}
					status={workoutStatus}
				/>

				<WorkoutStats
					completedSetCount={workoutCompletedSetCount}
					totalSets={workoutTotalSets}
					totalVolume={workoutTotalVolume}
					volumeChange={workoutVolumeChange}
					primaryLiftWeight={workoutPrimaryLiftWeight}
					primaryLiftChange={workoutPrimaryLiftChange}
					consistency={workoutConsistency}
				/>

				<ExerciseList sets={sets} />

				{/* <WorkoutActions
					status={workoutStatus}
					cycleId={cycleId}
					isLastSet={isLastSet}
					onStartWorkout={handleStartWorkout}
					onStartRest={handleStartRest}
					onSkipSet={handleSkipSet}
					onCompleteWorkout={handleCompleteWorkout}
					onSkipRemainingWorkoutSets={handleSkipRemainingWorkoutSets}
				/> */}

				{/* <RestTimer
					show={showRestTimer}
					onOpenChange={setShowRestTimer}
					exerciseName={currentExerciseName}
					currentSetNumber={currentSetIndex + 1}
					totalSets={
						currentExerciseIndex === 0
							? primaryExercise.sets.length
							: (accessoryExercises[currentExerciseIndex - 1]?.sets.length ?? 0)
					}
					isPrimary={currentExerciseIndex === 0}
					isLastSet={isLastSet}
					performance={performance}
					onPerformanceChange={setPerformance}
					onCompleteSet={handleCompleteSet}
					onSkipRemainingExerciseSets={handleSkipRemainingExerciseSets}
				/> */}
			</CardContent>
		</Card>
	);
}
