import { Status } from "@/drizzle/modules/strength-training/schemas/types";

interface ExerciseWithDefinition {
	exercise: {
		id: string;
		order: number;
	};
	definition: {
		id: string;
		name: string;
		type: string;
		rpeMax: number | null;
		repMax: number | null;
	};
	sets: Array<{
		id: string;
		setNumber: number;
		weight: number;
		reps: number;
		percentageOfMax: number;
	}>;
}

interface AccessoryExercisesProps {
	exercises: ExerciseWithDefinition[];
	currentExerciseIndex: number;
	currentSetIndex: number;
	workoutStatus: string;
}

export function AccessoryExercises({
	exercises,
	currentExerciseIndex,
	currentSetIndex,
	workoutStatus,
}: AccessoryExercisesProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			{exercises.map((exercise, index) => (
				<div
					key={`${exercise.exercise.id}-${exercise.definition.id}`}
					className={`rounded-lg bg-muted p-6 ${
						workoutStatus === Status.InProgress &&
						currentExerciseIndex === index + 1
							? "ring-2 ring-primary"
							: ""
					}`}
				>
					<h4 className="text-base font-semibold mb-1">
						{exercise.definition.name}
					</h4>
					<p className="text-sm text-muted-foreground mb-3">
						{`Type: ${exercise.definition.type.charAt(0).toUpperCase()}${exercise.definition.type.slice(1)}`}
					</p>
					<div className="grid grid-cols-3 gap-4">
						<div className="flex flex-col">
							<span className="text-sm font-medium">RPE</span>
							<span className="text-2xl">
								{exercise.definition.rpeMax ?? 7}
							</span>
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-medium">Reps</span>
							<span className="text-2xl">
								{exercise.definition.repMax ?? 8}
							</span>
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-medium">Sets</span>
							<span className="text-2xl">
								{workoutStatus === Status.InProgress &&
								currentExerciseIndex === index + 1
									? `${currentSetIndex + 1}/${exercise.sets.length}`
									: exercise.sets.length}
							</span>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
