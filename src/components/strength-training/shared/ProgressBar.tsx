"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
	value: number;
	max: number;
	showLabel?: boolean;
	className?: string;
}

export function ProgressBar({
	value,
	max,
	showLabel = true,
	className,
}: ProgressBarProps) {
	const percentage = Math.round((value / max) * 100);

	return (
		<div className={cn("space-y-2", className)}>
			{showLabel && (
				<div className="text-sm text-muted-foreground">
					Progress: {value} / {max} ({percentage}%)
				</div>
			)}
			<Progress value={percentage} className="h-2" />
		</div>
	);
}
