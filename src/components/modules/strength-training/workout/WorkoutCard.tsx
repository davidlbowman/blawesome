"use client";

import { ProgressBar } from "@/components/modules/strength-training/shared/ProgressBar";
import { StatusBadge } from "@/components/modules/strength-training/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
import { formatDate } from "@/lib/formatDate";
import { Calendar, CheckCircle, Dumbbell, XCircle } from "lucide-react";
import Link from "next/link";

interface WorkoutCardProps {
	workout: Pick<
		WorkoutsSelect,
		| "id"
		| "cycleId"
		| "status"
		| "createdAt"
		| "completedAt"
		| "primaryLift"
		| "sequence"
	>;
	completedSets: number;
	totalSets: number;
}

const getPrimaryLiftDisplayName = (lift: string) => {
	return lift
		.split("_")
		.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export function WorkoutCard({
	workout,
	completedSets,
	totalSets,
}: WorkoutCardProps) {
	return (
		<Link
			href={`/modules/strength-training/${workout.cycleId}/${workout.id}`}
			className="block"
		>
			<Card className="w-full transition-colors hover:bg-muted/50">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						{`Workout ${workout.sequence} - ${getPrimaryLiftDisplayName(
							workout.primaryLift,
						)}`}
					</CardTitle>
					<StatusBadge status={workout.status} />
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-4 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>
							{workout.status === Status.Enum.completed && workout.completedAt
								? `Completed on ${formatDate({ date: workout.completedAt })}`
								: workout.status === Status.Enum.skipped
									? `Skipped on ${formatDate({ date: workout.completedAt ?? workout.createdAt })}`
									: `Scheduled for ${formatDate({ date: workout.createdAt })}`}
						</span>
					</div>
					<div className="mt-4">
						<ProgressBar value={completedSets} max={totalSets} />
					</div>
					{workout.status === Status.Enum.completed ? (
						<div className="mt-4 flex items-center space-x-4 text-sm text-green-500">
							<CheckCircle className="h-4 w-4" />
							<span className="font-medium">Workout Completed</span>
						</div>
					) : workout.status === Status.Enum.skipped ? (
						<div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
							<XCircle className="h-4 w-4" />
							<span className="font-medium">Workout Skipped</span>
						</div>
					) : (
						<div className="mt-4 flex items-center space-x-4 text-sm">
							<Dumbbell className="h-4 w-4 text-muted-foreground" />
							<span>
								{workout.status === Status.Enum.in_progress ? (
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
