import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Status } from "@/drizzle/modules/strength-training/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../shared/StatusBadge";
import type { ExerciseWithSets } from "./types";

interface ExerciseCardProps {
	exercise: ExerciseWithSets;
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
		status === Status.Enum.completed
			? `${sets.length}/${sets.length}`
			: isCurrentExercise
				? `${currentSetIndex + 1}/${sets.length}`
				: `${sets.filter((set) => set.status === Status.Enum.completed || set.status === Status.Enum.skipped).length}/${sets.length}`;

	return (
		<Card className={cn(isCurrentExercise && "ring-2 ring-primary")}>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<h4 className="text-base font-semibold">{name}</h4>
					<StatusBadge status={status} />
				</div>
				<p className="text-sm text-muted-foreground">
					{`Type: ${type.charAt(0).toUpperCase()}${type.slice(1)}`}
				</p>
			</CardHeader>
			<CardContent>
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
			</CardContent>
		</Card>
	);
}
