import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../shared/StatusBadge";
import { SetTable } from "./SetTable";

interface PrimaryExerciseCardProps {
	sets: AllSetsByWorkoutId;
	className?: string;
}

export function PrimaryExerciseCard({
	sets,
	className,
}: PrimaryExerciseCardProps) {
	const exerciseName = sets[0].exerciseDefinitions.name;
	const exerciseStatus = sets[0].exercises.status;

	return (
		<Card className={cn("bg-muted", className)}>
			<CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-lg font-semibold">
					{exerciseName}
					<span className="ml-2 text-xs text-muted-foreground">(Primary)</span>
				</CardTitle>
				<StatusBadge status={exerciseStatus} />
			</CardHeader>
			<CardContent>
				<SetTable sets={sets} />
			</CardContent>
		</Card>
	);
}
