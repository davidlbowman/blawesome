"use client";

import { Badge } from "@/components/ui/badge";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
	status: string;
	variant?: "default" | "solid";
	className?: string;
}

const getStatusColor = (
	status: string,
	variant: "default" | "solid" = "default",
) => {
	const colors = {
		default: {
			[Status.Pending]:
				"bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
			[Status.InProgress]: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
			[Status.Completed]:
				"bg-green-500/10 text-green-500 hover:bg-green-500/20",
			[Status.Skipped]: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
		},
		solid: {
			[Status.Pending]: "bg-yellow-500 text-white",
			[Status.InProgress]: "bg-blue-500 text-white",
			[Status.Completed]: "bg-green-500 text-white",
			[Status.Skipped]: "bg-gray-500 text-white",
		},
	};

	return (
		colors[variant][status as keyof typeof Status] ||
		"bg-secondary text-secondary-foreground"
	);
};

const formatStatus = (status: string): string => {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export function StatusBadge({
	status,
	variant = "default",
	className,
}: StatusBadgeProps) {
	return (
		<Badge className={cn(getStatusColor(status, variant), className)}>
			{formatStatus(status)}
		</Badge>
	);
}
