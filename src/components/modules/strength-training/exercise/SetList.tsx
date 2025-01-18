import { Status } from "@/drizzle/modules/strength-training/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "../shared/StatusBadge";
import type { ExerciseSet } from "./types";

interface SetListProps {
	sets: ExerciseSet[];
	currentSetIndex?: number;
}

export function SetList({ sets, currentSetIndex }: SetListProps) {
	return (
		<div className="space-y-2">
			{sets.map((set, index) => (
				<div
					key={set.id}
					className={cn(
						"flex items-center justify-between p-3 rounded-lg",
						currentSetIndex === index && "bg-primary/10",
						set.status === Status.Enum.completed && "bg-success/10",
						set.status === Status.Enum.skipped && "bg-destructive/10",
					)}
				>
					<div className="flex items-center gap-4">
						<span className="text-sm font-medium">Set {set.setNumber}</span>
						<div className="flex items-center gap-2">
							<span className="text-sm">{set.weight}lbs</span>
							<span className="text-muted-foreground">×</span>
							<span className="text-sm">{set.reps} reps</span>
							{set.rpe && (
								<>
									<span className="text-muted-foreground">@</span>
									<span className="text-sm">RPE {set.rpe}</span>
								</>
							)}
						</div>
					</div>
					<StatusBadge status={set.status} />
				</div>
			))}
		</div>
	);
}
