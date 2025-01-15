import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../shared/StatusBadge";

type StatusType = (typeof Status)[keyof typeof Status];

interface ExerciseCardProps {
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
	currentSetIndex?: number;
	status: StatusType;
	className?: string;
}

export function ExerciseCard({
	name,
	type,
	sets,
	currentSetIndex,
	status,
	className,
}: ExerciseCardProps) {
	const isActive = status === Status.InProgress;
	const currentSet =
		currentSetIndex !== undefined ? sets[currentSetIndex] : null;
	const targetReps = sets[0]?.reps ?? "-";

	const completedSets = sets.filter(
		(set) => set.status === Status.Completed || set.status === Status.Skipped,
	).length;

	return (
		<div
			className={cn(
				"rounded-lg bg-muted p-6",
				{
					"ring-2 ring-primary": isActive,
				},
				className,
			)}
		>
			<div className="flex items-center justify-between mb-1">
				<h4 className="text-base font-semibold">{name}</h4>
				<StatusBadge status={status} />
			</div>
			<p className="text-sm text-muted-foreground mb-3">
				{`Type: ${type.charAt(0).toUpperCase()}${type.slice(1)}`}
			</p>
			<div className="grid grid-cols-3 gap-4">
				<div className="flex flex-col">
					<span className="text-sm font-medium">Weight</span>
					<span className="text-2xl">
						{currentSet?.weight ?? sets[0]?.weight ?? 0} lbs
					</span>
				</div>
				<div className="flex flex-col">
					<span className="text-sm font-medium">Reps</span>
					<span className="text-2xl">{targetReps}</span>
				</div>
				<div className="flex flex-col">
					<span className="text-sm font-medium">Sets</span>
					<span className="text-2xl">
						{isActive && currentSetIndex !== undefined
							? `${currentSetIndex + 1}/${sets.length}`
							: `${completedSets}/${sets.length}`}
					</span>
				</div>
			</div>
		</div>
	);
}
