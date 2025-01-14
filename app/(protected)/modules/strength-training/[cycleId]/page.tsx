import { StatusBadge } from "@/components/strength-training/shared/StatusBadge";
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
import { skipRemainingWorkouts } from "@/drizzle/modules/strength-training/functions/cycles/skipRemainingWorkouts";
import { getActiveWorkouts } from "@/drizzle/modules/strength-training/functions/workouts/getActiveWorkouts";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { formatDate } from "@/lib/formatDate";
import {
	Calendar,
	CheckCircle,
	Dumbbell,
	LineChart,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface WorkoutCardProps {
	id: string;
	status: string;
	date: Date;
	completedAt?: Date | null;
	primaryLift: string;
	sequence: number;
	completedSets: number;
	totalSets: number;
}

const getPrimaryLiftDisplayName = (lift: string) => {
	return lift
		.split("_")
		.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

function WorkoutCard({
	id,
	status,
	date,
	completedAt,
	primaryLift,
	sequence,
	cycleId,
	completedSets,
	totalSets,
}: WorkoutCardProps & { cycleId: string }) {
	const progressPercentage = (completedSets / totalSets) * 100;

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
								: status === "skipped"
									? `Skipped on ${formatDate({ date: completedAt ?? date })}`
									: `Scheduled for ${formatDate({ date: date })}`}
						</span>
					</div>
					<div className="mt-4 space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span>Sets Progress</span>
							<span className="font-medium">
								{completedSets} / {totalSets}
							</span>
						</div>
						<Progress value={progressPercentage} className="h-2" />
					</div>
					{status === Status.Completed ? (
						<div className="mt-4 flex items-center space-x-4 text-sm text-green-500">
							<CheckCircle className="h-4 w-4" />
							<span className="font-medium">Workout Completed</span>
						</div>
					) : status === "skipped" ? (
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

interface PageProps {
	params: Promise<{
		cycleId: CyclesSelect["id"];
	}>;
}

export default async function CyclePage({ params }: PageProps) {
	const { cycleId } = await params;
	const { workouts } = await getActiveWorkouts(cycleId);

	if (!workouts.length) {
		return (
			<div className="container mx-auto p-6">
				<h1 className="text-2xl font-bold mb-6">No workouts found</h1>
			</div>
		);
	}

	const cycleStatus =
		workouts[0]?.status === "completed" || workouts[0]?.status === "skipped"
			? "completed"
			: "in_progress";

	// For completed cycles, we know it's always 16/16
	const cycleWorkoutStats =
		cycleStatus === "completed"
			? { totalWorkouts: 16, completedWorkouts: 16 }
			: {
					totalWorkouts: 16,
					completedWorkouts: workouts.filter((w) => w.status === "completed")
						.length,
				};

	// Calculate sets for each workout
	const workoutsWithSets = workouts.map((workout) => {
		const totalSets = 25; // This should come from the actual workout data
		const completedSets =
			workout.status === Status.Completed
				? totalSets
				: workout.status === Status.InProgress
					? Math.floor(totalSets * 0.5)
					: 0;
		return {
			...workout,
			completedSets,
			totalSets,
		};
	});

	// Find current, next, and previous workouts
	const currentWorkout = workoutsWithSets.find(
		(w) => w.status === Status.InProgress,
	);
	const nextWorkouts = workoutsWithSets.filter(
		(w) => w.status === Status.Pending,
	);
	const previousWorkouts = workoutsWithSets.filter(
		(w) => w.status === Status.Completed || w.status === "skipped",
	);

	// Static data for now - we'll implement these calculations later
	const totalVolume = 45600; // lbs
	const consistency = 92; // percentage

	async function handleSkipRemainingWorkouts() {
		"use server";
		await skipRemainingWorkouts(cycleId);
		redirect("/modules/strength-training");
	}

	return (
		<div className="container mx-auto p-6 space-y-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Cycle Stats</CardTitle>
					<CardDescription>
						Track your progress through this training cycle
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<div className="flex flex-col space-y-1.5">
						<span className="text-2xl font-semibold">
							{cycleWorkoutStats.totalWorkouts}
						</span>
						<span className="text-sm text-muted-foreground">
							Total Workouts
						</span>
					</div>
					<div className="flex flex-col space-y-1.5">
						<span className="text-2xl font-semibold">
							{cycleWorkoutStats.completedWorkouts}
						</span>
						<span className="text-sm text-muted-foreground">Workouts Done</span>
					</div>
					<div className="flex flex-col space-y-1.5">
						<span className="text-2xl font-semibold">
							{totalVolume.toLocaleString()}lb
						</span>
						<span className="text-sm text-muted-foreground">Total Volume</span>
					</div>
					<div className="flex flex-col space-y-1.5">
						<span className="text-2xl font-semibold">{consistency}%</span>
						<span className="text-sm text-muted-foreground">Consistency</span>
					</div>
				</CardContent>
				<CardFooter>
					<Button variant="outline" className="w-full" disabled>
						<LineChart className="mr-2 h-4 w-4" /> View Detailed Stats
					</Button>
				</CardFooter>
			</Card>

			<div className="space-y-8">
				<div>
					<h2 className="text-xl font-semibold mb-4">Workouts</h2>
					<div className="space-y-6">
						{currentWorkout && (
							<div>
								<h3 className="text-lg font-medium mb-4">Current Workout</h3>
								<WorkoutCard {...currentWorkout} cycleId={cycleId} />
							</div>
						)}

						{nextWorkouts.length > 0 && (
							<div>
								<h3 className="text-lg font-medium mb-4">Next Workout</h3>
								<WorkoutCard {...nextWorkouts[0]} cycleId={cycleId} />
							</div>
						)}

						{nextWorkouts.length > 1 && (
							<div>
								<h3 className="text-lg font-medium mb-4">Upcoming Workouts</h3>
								<div className="grid gap-4 md:grid-cols-2">
									{nextWorkouts.slice(1).map((workout) => (
										<WorkoutCard
											key={workout.id}
											{...workout}
											cycleId={cycleId}
										/>
									))}
								</div>
							</div>
						)}

						{previousWorkouts.length > 0 && (
							<div>
								<h3 className="text-lg font-medium mb-4">Previous Workouts</h3>
								<div className="grid gap-4 md:grid-cols-2">
									{previousWorkouts.map((workout) => (
										<WorkoutCard
											key={workout.id}
											{...workout}
											cycleId={cycleId}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{nextWorkouts.length > 0 && (
				<form action={handleSkipRemainingWorkouts}>
					<Button type="submit" variant="destructive" className="w-full">
						Skip Remaining Workouts & End Cycle
					</Button>
				</form>
			)}
		</div>
	);
}
