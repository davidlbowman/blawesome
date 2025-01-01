import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	type CyclesSelect,
	PrimaryLift,
	Status,
} from "@/lib/drizzle/schemas/strength-training";
import { Calendar, CheckCircle, Dumbbell } from "lucide-react";

interface WorkoutCycleCardProps
	extends Omit<CyclesSelect, "userId" | "createdAt" | "updatedAt"> {
	completedWorkouts: number;
	totalWorkouts: number;
	nextWorkout?: {
		primaryLift: keyof typeof PrimaryLift;
		status: keyof typeof Status;
	};
}

export function WorkoutCycleCard({
	id,
	status,
	startDate,
	completedAt,
	completedWorkouts,
	totalWorkouts,
	nextWorkout,
}: WorkoutCycleCardProps) {
	const progressPercentage = (completedWorkouts / totalWorkouts) * 100;

	const getStatusColor = (status: string) => {
		switch (status) {
			case Status.Completed:
				return "bg-green-500 text-white";
			case Status.InProgress:
				return "bg-blue-500 text-white";
			default:
				return "bg-secondary text-secondary-foreground";
		}
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		}).format(new Date(date));
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">
					Workout Cycle {id.slice(0, 8)}
				</CardTitle>
				<Badge className={getStatusColor(status)}>
					{status.charAt(0).toUpperCase() + status.slice(1)}
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
								{PrimaryLift[nextWorkout.primaryLift]}
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
	);
}
