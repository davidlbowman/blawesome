import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status } from "@/drizzle/modules/strength-training/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../shared/StatusBadge";
import { SetTable } from "./SetTable";
import type { ExerciseWithSets } from "./types";

interface PrimaryExerciseCardProps {
	exercise: ExerciseWithSets;
	currentSetIndex?: number;
	className?: string;
}

export function PrimaryExerciseCard({
	exercise,
	currentSetIndex,
	className,
}: PrimaryExerciseCardProps) {
	const isActive = exercise.status === Status.Enum.in_progress;

	return (
		<Card className={cn("bg-muted", className)}>
			<CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-lg font-semibold">
					{exercise.name}
					<span className="ml-2 text-xs text-muted-foreground">(Primary)</span>
				</CardTitle>
				<StatusBadge status={exercise.status} />
			</CardHeader>
			<CardContent>
				<SetTable
					sets={exercise.sets}
					currentSetIndex={currentSetIndex}
					isActive={isActive}
				/>
			</CardContent>
		</Card>
	);
}
