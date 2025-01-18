import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SetTable } from "./SetTable";
import type { ExerciseWithSets } from "./types";

interface ExerciseCardProps {
	exercise: ExerciseWithSets;
	currentExerciseId?: string;
	currentSetIndex?: number;
	className?: string;
}

export function ExerciseCard({
	exercise,
	currentExerciseId,
	currentSetIndex,
	className,
}: ExerciseCardProps) {
	const isActive = exercise.id === currentExerciseId;

	return (
		<Card className={cn(className, isActive && "border-primary")}>
			<CardHeader>
				<CardTitle>{exercise.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<SetTable
					sets={exercise.sets}
					currentSetIndex={isActive ? currentSetIndex : undefined}
					isActive={isActive}
				/>
			</CardContent>
		</Card>
	);
}
