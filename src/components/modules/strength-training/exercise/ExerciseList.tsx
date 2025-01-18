import type { ExerciseDefinitionsSelect } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import type { ExercisesSelect } from "@/drizzle/modules/strength-training/schemas/exercises";
import type { SetsSelect } from "@/drizzle/modules/strength-training/schemas/sets";
import { ExerciseCard } from "./ExerciseCard";
import { PrimaryExerciseCard } from "./PrimaryExerciseCard";

type ExerciseSet = Pick<
	SetsSelect,
	"id" | "setNumber" | "weight" | "reps" | "rpe" | "status"
>;

interface ExerciseWithSets
	extends Omit<
		ExercisesSelect,
		| "userId"
		| "workoutId"
		| "exerciseDefinitionId"
		| "order"
		| "createdAt"
		| "updatedAt"
		| "completedAt"
	> {
	name: string;
	type: ExerciseDefinitionsSelect["type"];
	sets: ExerciseSet[];
}

interface ExerciseListProps {
	exercises: ExerciseWithSets[];
	currentExerciseIndex?: number;
	currentSetIndex?: number;
	className?: string;
}

export function ExerciseList({
	exercises,
	currentExerciseIndex,
	currentSetIndex = 0,
	className,
}: ExerciseListProps) {
	const primaryExercise = exercises.find((e) => e.type === "primary");
	const accessoryExercises = exercises.filter(
		(e) => e.type === "variation" || e.type === "accessory",
	);

	const currentExerciseId =
		currentExerciseIndex !== undefined
			? exercises[currentExerciseIndex]?.id
			: "";

	return (
		<div className={className}>
			{primaryExercise && (
				<PrimaryExerciseCard
					key={primaryExercise.id}
					exercise={primaryExercise}
					currentSetIndex={
						currentExerciseIndex === 0 ? currentSetIndex : undefined
					}
					className="mb-6"
				/>
			)}

			{accessoryExercises.length > 0 && (
				<div className="grid md:grid-cols-2 gap-6">
					{accessoryExercises.map((exercise) => (
						<ExerciseCard
							key={exercise.id}
							exercise={exercise}
							currentExerciseId={currentExerciseId}
							currentSetIndex={currentSetIndex}
						/>
					))}
				</div>
			)}
		</div>
	);
}
