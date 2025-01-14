"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/strength-training/shared/StatusBadge";
import { formatDate } from "@/lib/formatDate";
import {
	Calendar,
	CheckCircle,
	Download,
	Dumbbell,
	LineChart,
	Plus,
} from "lucide-react";
import Link from "next/link";

// Static data for the dashboard
const stats = {
	totalCycles: 12,
	workoutsDone: 192,
	totalVolume: 123456,
	consistency: 85,
};

const currentCycle = {
	id: "current123",
	status: "in_progress",
	startDate: new Date("2023-05-01"),
	completedWorkouts: 6,
	totalWorkouts: 16,
	nextWorkout: {
		status: "pending",
		primaryLift: "bench_press",
	},
};

const completedCycles = [
	{
		id: "prev1",
		status: "completed",
		startDate: new Date("2023-04-01"),
		completedAt: new Date("2023-04-28"),
		completedWorkouts: 16,
		totalWorkouts: 16,
	},
	{
		id: "prev2",
		status: "completed",
		startDate: new Date("2023-03-01"),
		completedAt: new Date("2023-03-28"),
		completedWorkouts: 15,
		totalWorkouts: 16,
	},
];

const getPrimaryLiftDisplayName = (lift: string) => {
	return lift
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

interface CycleCardProps {
	id: string;
	status: string;
	startDate: Date;
	completedAt?: Date;
	completedWorkouts: number;
	totalWorkouts: number;
	nextWorkout?: {
		status: string;
		primaryLift: string;
	};
}

export function CycleDashboard() {
	const motivationalTip = "Remember, consistency is key. Every workout counts!";

	const handleStartNewCycle = () => {
		console.log("Starting new cycle...");
	};

	const handleExportData = () => {
		console.log("Exporting data...");
	};

	return (
		<div className="container mx-auto p-6 space-y-8">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Cycle Dashboard</h1>
				<div className="space-x-4">
					<Button onClick={handleStartNewCycle}>
						<Plus className="mr-2 h-4 w-4" /> Start New Cycle
					</Button>
					<Button variant="outline" onClick={handleExportData}>
						<Download className="mr-2 h-4 w-4" /> Export Data
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Your Progress</CardTitle>
					<CardDescription>{motivationalTip}</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<div className="flex flex-col space-y-1.5">
						<span className="text-2xl font-semibold">{stats.totalCycles}</span>
						<span className="text-sm text-muted-foreground">Total Cycles</span>
					</div>
					<div className="flex flex-col space-y-1.5">
						<span className="text-2xl font-semibold">{stats.workoutsDone}</span>
						<span className="text-sm text-muted-foreground">Workouts Done</span>
					</div>
					<div className="flex flex-col space-y-1.5">
						<span className="text-2xl font-semibold">
							{stats.totalVolume.toLocaleString()}lb
						</span>
						<span className="text-sm text-muted-foreground">Total Volume</span>
					</div>
					<div className="flex flex-col space-y-1.5">
						<span className="text-2xl font-semibold">{stats.consistency}%</span>
						<span className="text-sm text-muted-foreground">Consistency</span>
					</div>
				</CardContent>
				<CardFooter>
					<Button variant="outline" className="w-full">
						<LineChart className="mr-2 h-4 w-4" /> View Detailed Stats
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Workout Cycles</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{currentCycle && (
						<div>
							<h3 className="text-lg font-semibold mb-4">Current Cycle</h3>
							<CycleCard {...currentCycle} />
						</div>
					)}

					{completedCycles.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-4">Previous Cycles</h3>
							<div className="grid gap-6 md:grid-cols-2">
								{completedCycles.map((cycle) => (
									<CycleCard key={cycle.id} {...cycle} />
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function CycleCard({
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
					<StatusBadge status={status} />
				</CardHeader>
				<CardContent>
					<div className="flex items-center space-x-4 text-sm text-muted-foreground">
						<Calendar className="h-4 w-4" />
						<span>
							{status === "completed" && completedAt
								? `Completed on ${formatDate({ date: completedAt })}`
								: `Started on ${formatDate({ date: startDate })}`}
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
					{status !== "completed" && nextWorkout && (
						<div className="mt-4 flex items-center space-x-4 text-sm">
							{nextWorkout.status === "completed" ? (
								<CheckCircle className="h-4 w-4 text-green-500" />
							) : (
								<Dumbbell className="h-4 w-4 text-muted-foreground" />
							)}
							<span>
								{nextWorkout.status === "in_progress"
									? "Current Workout: "
									: nextWorkout.status === "completed"
										? "Last Completed: "
										: "Next Workout: "}
								<span className="font-medium">
									{getPrimaryLiftDisplayName(nextWorkout.primaryLift)}
								</span>
							</span>
						</div>
					)}
					{status === "completed" && (
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
