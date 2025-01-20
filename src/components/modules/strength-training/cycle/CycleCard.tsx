"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
import { formatDate } from "@/lib/formatDate";
import { Calendar, CheckCircle, Dumbbell } from "lucide-react";
import Link from "next/link";

interface CycleCardProps {
	cycle: Pick<CyclesSelect, "id" | "status" | "startDate" | "completedAt">;
	completedWorkouts: number;
	totalWorkouts: number;
	nextWorkout?: Pick<WorkoutsSelect, "primaryLift" | "status">;
}

const getStatusColor = (status: string) => {
	switch (status) {
		case Status.Enum.pending:
			return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
		case Status.Enum.in_progress:
			return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
		case Status.Enum.completed:
			return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
		default:
			return "";
	}
};

const getPrimaryLiftDisplayName = (lift: string) => {
	return lift
		.split("_")
		.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

const formatStatus = (status: Status) => {
	return status
		.split("_")
		.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export function CycleCard({
	cycle,
	completedWorkouts,
	totalWorkouts,
	nextWorkout,
}: CycleCardProps) {
	const progressPercentage = (completedWorkouts / totalWorkouts) * 100;

	return (
		<Link href={`/modules/strength-training/${cycle.id}`} className="block">
			<Card className="w-full transition-colors hover:bg-muted/50">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Workout Cycle {cycle.id.slice(0, 8)}
					</CardTitle>
					<Badge className={getStatusColor(cycle.status)}>
						{formatStatus(cycle.status)}
					</Badge>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-4 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>
							{cycle.status === Status.Enum.completed && cycle.completedAt
								? `Completed on ${formatDate({ date: cycle.completedAt })}`
								: `Started on ${formatDate({ date: cycle.startDate })}`}
						</span>
					</div>
					<div className="mt-4 space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span>Progress</span>
							<span className="font-medium">
								{completedWorkouts} / {totalWorkouts}
							</span>
						</div>
						<Progress value={progressPercentage} className="h-2" />
					</div>
					{cycle.status !== Status.Enum.completed && nextWorkout && (
						<div className="mt-4 flex items-center space-x-4 text-sm">
							{nextWorkout.status === Status.Enum.completed ? (
								<CheckCircle className="h-4 w-4 text-green-500" />
							) : (
								<Dumbbell className="h-4 w-4 text-muted-foreground" />
							)}
							<span>
								{nextWorkout.status === Status.Enum.in_progress
									? "Current Workout: "
									: nextWorkout.status === Status.Enum.completed
										? "Last Completed: "
										: "Next Workout: "}
								<span className="font-medium">
									{getPrimaryLiftDisplayName(nextWorkout.primaryLift)}
								</span>
							</span>
						</div>
					)}
					{cycle.status === Status.Enum.completed && (
						<div className="mt-4 flex items-center space-x-4 text-sm text-green-500">
							<CheckCircle className="h-4 w-4" />
							<span className="font-medium">Cycle Completed</span>
						</div>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}
