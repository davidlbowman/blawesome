import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { StatusBadge } from "../shared/StatusBadge";
import { SetTable } from "./SetTable";

type StatusType = (typeof Status)[keyof typeof Status];

interface PrimaryExerciseCardProps {
	name: string;
	type: "primary" | "variation" | "accessory";
	sets: Array<{
		id: string;
		setNumber: number;
		weight: number;
		reps: number | null;
		percentageOfMax: number | null;
		status: StatusType;
	}>;
	status: StatusType;
	currentSetIndex?: number;
	className?: string;
}

export function PrimaryExerciseCard({
	name,
	sets,
	currentSetIndex,
	status,
	className,
}: PrimaryExerciseCardProps) {
	const isActive = status === Status.InProgress;

	return (
		<Card className={className}>
			<CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-base font-medium">
					{name}
					<span className="ml-2 text-xs text-muted-foreground">(Primary)</span>
				</CardTitle>
				<StatusBadge status={status} />
			</CardHeader>
			<CardContent>
				<SetTable
					sets={sets}
					currentSetIndex={currentSetIndex}
					isActive={isActive}
				/>
			</CardContent>
		</Card>
	);
}
