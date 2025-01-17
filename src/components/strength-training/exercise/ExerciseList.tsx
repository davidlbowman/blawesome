import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { ExerciseCard } from "./ExerciseCard";
import { PrimaryExerciseCard } from "./PrimaryExerciseCard";

type StatusType = (typeof Status)[keyof typeof Status];

interface Set {
	id: string;
	setNumber: number;
	weight: number;
	reps: number;
	rpe: number;
	status: StatusType;
}

interface Exercise {
	id: string;
	name: string;
	type: "primary" | "variation" | "accessory";
	sets: Set[];
	status: StatusType;
}

interface ExerciseListProps {
	exercises: Exercise[];
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
					name={primaryExercise.name}
					type={primaryExercise.type}
					sets={primaryExercise.sets}
					status={primaryExercise.status}
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
