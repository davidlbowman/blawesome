import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import { StatusBadge } from "../shared/StatusBadge";

interface ExerciseCardProps {
	sets: AllSetsByWorkoutId[number];
}

export function ExerciseCard({ sets }: ExerciseCardProps) {
	const { name, type } = sets.exerciseDefinitions;
	const status = sets.workouts.status;
	const { weight, reps, rpe } = sets.sets;

	return (
		<Card>
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
