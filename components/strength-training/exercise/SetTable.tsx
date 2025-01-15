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
	reps: number | null;
	percentageOfMax: number | null;
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
					<TableHead>Weight</TableHead>
					<TableHead>Reps</TableHead>
					<TableHead>% 1RM</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sets.map((set, index) => (
					<TableRow
						key={set.id}
						className={cn({
							"bg-muted": isActive && index === currentSetIndex,
						})}
					>
						<TableCell>{set.setNumber}</TableCell>
						<TableCell>{set.weight}kg</TableCell>
						<TableCell>{set.reps ?? "-"}</TableCell>
						<TableCell>
							{set.percentageOfMax ? `${set.percentageOfMax}%` : "-"}
						</TableCell>
						<TableCell>
							<span
								className={cn("inline-block px-2 py-1 text-xs rounded-full", {
									"bg-slate-100 text-slate-500": set.status === Status.Pending,
									"bg-blue-100 text-blue-500": set.status === Status.InProgress,
									"bg-green-100 text-green-500":
										set.status === Status.Completed,
									"bg-amber-100 text-amber-500": set.status === Status.Skipped,
								})}
							>
								{set.status}
							</span>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
