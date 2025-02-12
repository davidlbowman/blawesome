import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import { ExerciseType } from "@/drizzle/modules/strength-training/types";
import { ExerciseCard } from "./ExerciseCard";
import { PrimaryExerciseCard } from "./PrimaryExerciseCard";

interface ExerciseListProps {
	sets: AllSetsByWorkoutId;
	currentExercise: string | null;
	currentSetIndex: number | null;
}

export function ExerciseList({
	sets,
	currentSetIndex,
	currentExercise,
}: ExerciseListProps) {
	const primaryExercise = sets.find(
		(e) => e.exerciseDefinitions.type === ExerciseType.Enum.primary,
	);

	const primaryExerciseSets = sets.filter(
		(s) => s.sets.exerciseId === primaryExercise?.exercises.id,
	);

	const accessoryExercises = sets
		.filter((s) => s.exerciseDefinitions.type !== ExerciseType.Enum.primary)
		.filter(
			(set, index, array) =>
				array.findIndex((s) => s.exercises.id === set.exercises.id) === index,
		);

	return (
		<div>
			{primaryExercise && (
				<PrimaryExerciseCard
					key={primaryExercise.exercises.id}
					sets={primaryExerciseSets}
					currentExercise={currentExercise}
					currentSetIndex={currentSetIndex}
					className="mb-6"
				/>
			)}

			{accessoryExercises.length > 0 && (
				<div className="grid md:grid-cols-2 gap-6">
					{accessoryExercises.map((exercise) => (
						<ExerciseCard
							key={exercise.exercises.id}
							sets={exercise}
							currentExercise={currentExercise}
						/>
					))}
				</div>
			)}
		</div>
	);
}
