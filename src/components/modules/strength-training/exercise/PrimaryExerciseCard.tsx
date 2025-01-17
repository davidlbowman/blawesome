import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status } from "@/drizzle/modules/strength-training/types";
import { StatusBadge } from "../shared/StatusBadge";
import { SetTable } from "./SetTable";

type StatusType = (typeof Status.Enum)[keyof typeof Status.Enum];

interface Set {
	id: string;
	setNumber: number;
	weight: number;
	reps: number;
	rpe: number;
	status: StatusType;
}

interface PrimaryExerciseCardProps {
	name: string;
	type: "primary" | "variation" | "accessory";
	sets: Set[];
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
	const isActive = status === Status.Enum.in_progress;

	return (
		<Card className={className}>
			<CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-lg font-semibold">
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
