import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { ExerciseCard } from "./ExerciseCard";
import { PrimaryExerciseCard } from "./PrimaryExerciseCard";

type StatusType = (typeof Status)[keyof typeof Status];

interface Set {
	id: string;
	setNumber: number;
	weight: number;
	reps: number | null;
	percentageOfMax: number | null;
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
	currentSetIndex,
	className,
}: ExerciseListProps) {
	const primaryExercise = exercises.find((e) => e.type === "primary");
	const accessoryExercises = exercises.filter(
		(e) => e.type === "variation" || e.type === "accessory",
	);

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
					{accessoryExercises.map((exercise, index) => {
						const exerciseIndex = index + 1; // Add 1 because primary exercise is index 0
						const isCurrentExercise = exerciseIndex === currentExerciseIndex;
						const exerciseSetIndex = isCurrentExercise
							? currentSetIndex
							: undefined;

						return (
							<ExerciseCard
								key={exercise.id}
								name={exercise.name}
								type={exercise.type}
								sets={exercise.sets}
								status={exercise.status}
								currentSetIndex={exerciseSetIndex}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}
