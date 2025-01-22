import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";

interface SetTableProps {
	sets: AllSetsByWorkoutId;
}

export function SetTable({ sets }: SetTableProps) {
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
					<TableRow key={set.sets.id}>
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
