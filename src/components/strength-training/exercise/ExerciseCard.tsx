import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { cn } from "@/lib/utils";
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
	status: StatusType;
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
	const { name, type, sets, status } = exercise;
	const isCurrentExercise = exercise.id === currentExerciseId;
	const targetReps = sets[0]?.reps ?? "-";
	const targetRpe = sets[0]?.rpe ?? "-";
	const suggestedWeight = sets[0]?.weight ?? "-";

	// If exercise is completed, show all sets as completed
	const setsDisplay =
		status === Status.Completed
			? `${sets.length}/${sets.length}`
			: isCurrentExercise
				? `${currentSetIndex + 1}/${sets.length}`
				: `${sets.filter((set) => set.status === Status.Completed || set.status === Status.Skipped).length}/${sets.length}`;

	return (
		<div
			className={cn("rounded-lg bg-muted p-6", {
				"ring-2 ring-primary": isCurrentExercise,
			})}
		>
			<div className="flex items-center justify-between mb-1">
				<h4 className="text-base font-semibold">{name}</h4>
				<StatusBadge status={status} />
			</div>
			<p className="text-sm text-muted-foreground mb-3">
				{`Type: ${type.charAt(0).toUpperCase()}${type.slice(1)}`}
			</p>
			<div className="grid grid-cols-4 gap-4">
				<div className="flex flex-col">
					<span className="text-sm font-medium">Weight</span>
					<span className="text-2xl">{suggestedWeight} lbs</span>
				</div>
				<div className="flex flex-col">
					<span className="text-sm font-medium">RPE</span>
					<span className="text-2xl">{targetRpe}</span>
				</div>
				<div className="flex flex-col">
					<span className="text-sm font-medium">Reps</span>
					<span className="text-2xl">{targetReps}</span>
				</div>
				<div className="flex flex-col">
					<span className="text-sm font-medium">Sets</span>
					<span className="text-2xl">{setsDisplay}</span>
				</div>
			</div>
		</div>
	);
}
