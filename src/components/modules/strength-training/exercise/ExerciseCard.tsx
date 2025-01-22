import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../shared/StatusBadge";

interface ExerciseCardProps {
	sets: AllSetsByWorkoutId[number];
	currentExercise: string | null;
}

export function ExerciseCard({ sets, currentExercise }: ExerciseCardProps) {
	const { name, type } = sets.exerciseDefinitions;
	const status = sets.exercises.status;
	const { weight, reps, rpe } = sets.sets;
	const isCurrentExercise = currentExercise === name;

	isCurrentExercise && console.log(currentExercise, name);

	return (
		<Card className={cn(isCurrentExercise && "bg-muted")}>
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
						<span className="text-2xl">{weight} lbs</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium">RPE</span>
						<span className="text-2xl">{rpe}</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium">Reps</span>
						<span className="text-2xl">{reps}</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-medium">Sets</span>
						<span className="text-2xl">6</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
