import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { SetsInsert } from "@/drizzle/modules/strength-training/schemas/sets";
import { Status } from "@/drizzle/modules/strength-training/types";
import { cn } from "@/lib/utils";

interface SetTableProps {
	sets: Pick<
		SetsInsert,
		"id" | "setNumber" | "weight" | "reps" | "rpe" | "status"
	>[];
	currentSetIndex?: number;
	isActive: boolean;
}

export function SetTable({ sets, currentSetIndex, isActive }: SetTableProps) {
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
				{sets.map((set, index) => (
					<TableRow
						key={set.id}
						className={cn({
							"bg-muted": isActive && index === currentSetIndex,
							"bg-muted/50":
								set.status === Status.Enum.completed ||
								set.status === Status.Enum.skipped,
						})}
					>
						<TableCell>{set.setNumber}</TableCell>
						<TableCell>{set.weight} lbs</TableCell>
						<TableCell>{set.reps}</TableCell>
						<TableCell>{set.rpe}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
