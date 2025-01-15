"use client";

import { Badge } from "@/components/ui/badge";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { cn } from "@/lib/utils";

type StatusType = (typeof Status)[keyof typeof Status];

interface StatusBadgeProps {
	status: StatusType;
	className?: string;
}

const STATUS_STYLES = {
	[Status.Pending]: "bg-slate-100 text-slate-500 hover:bg-slate-100",
	[Status.Started]: "bg-blue-100 text-blue-500 hover:bg-blue-100",
	[Status.InProgress]: "bg-blue-100 text-blue-500 hover:bg-blue-100",
	[Status.Completed]: "bg-green-100 text-green-500 hover:bg-green-100",
	[Status.Skipped]: "bg-amber-100 text-amber-500 hover:bg-amber-100",
} as const;

const STATUS_LABELS = {
	[Status.Pending]: "Pending",
	[Status.Started]: "Started",
	[Status.InProgress]: "In Progress",
	[Status.Completed]: "Completed",
	[Status.Skipped]: "Skipped",
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
	return (
		<Badge variant="secondary" className={cn(STATUS_STYLES[status], className)}>
			{STATUS_LABELS[status]}
		</Badge>
	);
}
