import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { StatusBadge } from "../shared/StatusBadge";

type StatusType = (typeof Status)[keyof typeof Status];

interface Set {
	id: string;
	weight: number;
	reps: number;
	rpe: number;
	status: StatusType;
}

interface Exercise {
	id: string;
	name: string;
	type: string;
	sets: Set[];
}

interface ExerciseCardProps {
	exercise: Exercise;
	currentExerciseId: string;
	currentSetIndex: number;
}

export function ExerciseCard({
	exercise,
	currentExerciseId,
	currentSetIndex,
}: ExerciseCardProps) {
	const { name, sets } = exercise;
	const isCurrentExercise = exercise.id === currentExerciseId;
	const currentSet = isCurrentExercise ? sets[currentSetIndex] : null;
	const targetReps = sets[0]?.reps ?? "-";
	const targetRpe = sets[0]?.rpe ?? "-";
	const suggestedWeight = sets[0]?.weight ?? "-";

	const completedSets = sets.filter(
		(set) => set.status === Status.Completed || set.status === Status.Skipped,
	).length;

	return (
		<div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
			<div className="col-span-2">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold">{name}</h3>
					<StatusBadge status={currentSet?.status ?? Status.Pending} />
				</div>
			</div>
			<div>
				<p className="text-sm text-muted-foreground">Suggested Weight</p>
				<p className="text-lg font-medium">{suggestedWeight} lbs</p>
			</div>
			<div>
				<p className="text-sm text-muted-foreground">Reps</p>
				<p className="text-lg font-medium">{targetReps}</p>
			</div>
			<div>
				<p className="text-sm text-muted-foreground">RPE</p>
				<p className="text-lg font-medium">{targetRpe}</p>
			</div>
			<div>
				<p className="text-sm text-muted-foreground">Sets</p>
				<p className="text-lg font-medium">
					{isCurrentExercise
						? `${currentSetIndex + 1}/${sets.length}`
						: `${completedSets}/${sets.length}`}
				</p>
			</div>
		</div>
	);
}
