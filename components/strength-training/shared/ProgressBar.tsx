"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
	value: number;
	max?: number;
	showLabel?: boolean;
	className?: string;
	progressClassName?: string;
	labelClassName?: string;
}

export function ProgressBar({
	value,
	max = 100,
	showLabel = true,
	className,
	progressClassName,
	labelClassName,
}: ProgressBarProps) {
	const percentage = Math.round((value / max) * 100);

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<div className="flex-grow">
				<Progress value={percentage} className={cn("h-2", progressClassName)} />
			</div>
			{showLabel && (
				<span
					className={cn(
						"text-sm font-medium text-muted-foreground shrink-0",
						labelClassName,
					)}
				>
					{value} / {max}
				</span>
			)}
		</div>
	);
}
