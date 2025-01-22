import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import { cn } from "@/lib/utils";

interface SetTableProps {
	sets: AllSetsByWorkoutId;
	isCurrentExercise: boolean;
	currentSetIndex: number | null;
}

export function SetTable({
	sets,
	isCurrentExercise,
	currentSetIndex,
}: SetTableProps) {
	const currentSet = currentSetIndex !== null ? sets[currentSetIndex] : null;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[100px]">Set</TableHead>
					<TableHead>Weight (lbs)</TableHead>
					<TableHead>Reps</TableHead>
					<TableHead>RPE</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sets.map((set) => (
					<TableRow
						key={set.sets.id}
						className={cn(
							isCurrentExercise &&
								currentSet?.sets.id === set.sets.id &&
								"bg-muted",
						)}
					>
						<TableCell>{set.sets.setNumber}</TableCell>
						<TableCell>{set.sets.weight} lbs</TableCell>
						<TableCell>{set.sets.reps}</TableCell>
						<TableCell>{set.sets.rpe}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
