import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { cn } from "@/lib/utils";

type StatusType = (typeof Status)[keyof typeof Status];

interface Set {
	id: string;
	setNumber: number;
	weight: number;
	reps: number;
	rpe: number;
	status: StatusType;
}

interface SetTableProps {
	sets: Set[];
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
								set.status === Status.Completed ||
								set.status === Status.Skipped,
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
