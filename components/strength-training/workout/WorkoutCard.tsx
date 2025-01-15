"use client";

import { ProgressBar } from "@/components/strength-training/shared/ProgressBar";
import { StatusBadge } from "@/components/strength-training/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { formatDate } from "@/lib/formatDate";
import { Calendar, CheckCircle, Dumbbell, XCircle } from "lucide-react";
import Link from "next/link";

type StatusType = (typeof Status)[keyof typeof Status];

interface WorkoutCardProps {
	id: string;
	status: StatusType;
	date: Date;
	completedAt?: Date | null;
	primaryLift: string;
	sequence: number;
	completedSets: number;
	totalSets: number;
	cycleId: string;
}

const getPrimaryLiftDisplayName = (lift: string) => {
	return lift
		.split("_")
		.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export function WorkoutCard({
	id,
	status,
	date,
	completedAt,
	primaryLift,
	sequence,
	cycleId,
	completedSets,
	totalSets,
}: WorkoutCardProps) {
	return (
		<Link
			href={`/modules/strength-training/${cycleId}/${id}`}
			className="block"
		>
			<Card className="w-full transition-colors hover:bg-muted/50">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Workout {sequence} - {getPrimaryLiftDisplayName(primaryLift)}
					</CardTitle>
					<StatusBadge status={status} />
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-4 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>
							{status === Status.Completed && completedAt
								? `Completed on ${formatDate({ date: completedAt })}`
								: status === Status.Skipped
									? `Skipped on ${formatDate({ date: completedAt ?? date })}`
									: `Scheduled for ${formatDate({ date: date })}`}
						</span>
					</div>
					<div className="mt-4">
						<ProgressBar value={completedSets} max={totalSets} />
					</div>
					{status === Status.Completed ? (
						<div className="mt-4 flex items-center space-x-4 text-sm text-green-500">
							<CheckCircle className="h-4 w-4" />
							<span className="font-medium">Workout Completed</span>
						</div>
					) : status === Status.Skipped ? (
						<div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
							<XCircle className="h-4 w-4" />
							<span className="font-medium">Workout Skipped</span>
						</div>
					) : (
						<div className="mt-4 flex items-center space-x-4 text-sm">
							<Dumbbell className="h-4 w-4 text-muted-foreground" />
							<span>
								{status === Status.InProgress ? (
									<span className="font-medium">In Progress</span>
								) : (
									<span>Upcoming Workout</span>
								)}
							</span>
						</div>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}
