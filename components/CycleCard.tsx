import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Dumbbell } from "lucide-react";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";

interface CycleCardProps {
	id: string;
	status: string;
	startDate: Date;
	completedAt?: Date | null;
	completedWorkouts: number;
	totalWorkouts: number;
	nextWorkout?: {
		primaryLift: string;
		status: string;
	} | null;
}

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
};

const getStatusColor = (status: string) => {
	switch (status) {
		case Status.Pending:
			return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
		case Status.InProgress:
			return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
		case Status.Completed:
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

export function CycleCard({
	id,
	status,
	startDate,
	completedAt,
	completedWorkouts,
	totalWorkouts,
	nextWorkout,
}: CycleCardProps) {
	const progressPercentage = (completedWorkouts / totalWorkouts) * 100;

	return (
		<Link href={`/modules/strength-training/${id}`} className="block">
			<Card className="w-full transition-colors hover:bg-muted/50">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Workout Cycle {id.slice(0, 8)}
					</CardTitle>
					<Badge className={getStatusColor(status)}>
						{status
							.split("_")
							.map(
								(word: string) => word.charAt(0).toUpperCase() + word.slice(1),
							)
							.join(" ")}
					</Badge>
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-4 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>
							{status === Status.Completed && completedAt
								? `Completed on ${formatDate(completedAt)}`
								: `Started on ${formatDate(startDate)}`}
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
					{status !== Status.Completed && nextWorkout && (
						<div className="mt-4 flex items-center space-x-4 text-sm">
							{nextWorkout.status === Status.Completed ? (
								<CheckCircle className="h-4 w-4 text-green-500" />
							) : (
								<Dumbbell className="h-4 w-4 text-muted-foreground" />
							)}
							<span>
								{nextWorkout.status === Status.InProgress
									? "Current Workout: "
									: nextWorkout.status === Status.Completed
										? "Last Completed: "
										: "Next Workout: "}
								<span className="font-medium">
									{getPrimaryLiftDisplayName(nextWorkout.primaryLift)}
								</span>
							</span>
						</div>
					)}
					{status === Status.Completed && (
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
