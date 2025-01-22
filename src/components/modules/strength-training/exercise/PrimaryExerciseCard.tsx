import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../shared/StatusBadge";
import { SetTable } from "./SetTable";

interface PrimaryExerciseCardProps {
	sets: AllSetsByWorkoutId;
	currentExercise: string | null;
	currentSetIndex: number | null;
	className?: string;
}

export function PrimaryExerciseCard({
	sets,
	currentExercise,
	currentSetIndex,
	className,
}: PrimaryExerciseCardProps) {
	const exerciseName = sets[0].exerciseDefinitions.name;
	const exerciseStatus = sets[0].exercises.status;
	const isCurrentExercise = currentExercise === exerciseName;

	return (
		<Card className={cn(className)}>
			<CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-lg font-semibold">
					{exerciseName}
					<span className="ml-2 text-xs text-muted-foreground">(Primary)</span>
				</CardTitle>
				<StatusBadge status={exerciseStatus} />
			</CardHeader>
			<CardContent>
				<SetTable
					sets={sets}
					isCurrentExercise={isCurrentExercise}
					currentSetIndex={currentSetIndex}
				/>
			</CardContent>
		</Card>
	);
}
