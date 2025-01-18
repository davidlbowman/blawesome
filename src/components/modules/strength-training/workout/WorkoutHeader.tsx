"use client";

import { StatusBadge } from "@/components/modules/strength-training/shared/StatusBadge";
import { CardTitle } from "@/components/ui/card";
import type { Status } from "@/drizzle/modules/strength-training/types";
import { formatDate } from "@/lib/formatDate";
import { CalendarDays, Dumbbell } from "lucide-react";

interface WorkoutHeaderProps {
	exerciseName: string;
	date: Date;
	status: Status;
}

export function WorkoutHeader({
	exerciseName,
	date,
	status,
}: WorkoutHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<Dumbbell className="h-6 w-6 text-primary" />
				<div className="flex flex-col">
					<CardTitle className="text-2xl font-bold capitalize">
						{exerciseName} Day
					</CardTitle>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<CalendarDays className="h-4 w-4" />
						<span>{formatDate({ date, month: "long" })}</span>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<StatusBadge status={status} />
			</div>
		</div>
	);
}
