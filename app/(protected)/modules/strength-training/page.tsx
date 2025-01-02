// import { OneRMForm } from "@/components/1RMForm";
// import { CycleCard } from "@/components/CycleCard";
// import { Button } from "@/components/ui/button";
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from "@/components/ui/card";
// import { getUserId } from "@/drizzle/core/functions/users/getUserId";
// import { createCycle } from "@/drizzle/modules/strength-training/functions/cycles/createCycle";
// import { getTrainingData } from "@/drizzle/modules/strength-training/functions/cycles/getTrainingData";
// import { getWorkoutStats } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutStats";
// import type {
// 	CyclesSelect,
// 	PrimaryLift,
// 	WorkoutsSelect,
// } from "@/drizzle/modules/strength-training/schemas";
// import { Status } from "@/drizzle/modules/strength-training/schemas";
// import { Download, LineChart, Plus } from "lucide-react";
// import { revalidatePath } from "next/cache";

// type WorkoutStats = {
// 	totalWorkouts: number;
// 	completedWorkouts: number;
// 	nextWorkout: WorkoutsSelect | undefined;
// };

// function getCompletedWorkouts(cycle: CyclesSelect, stats: WorkoutStats) {
// 	return cycle.status === Status.Completed
// 		? stats.totalWorkouts
// 		: stats.completedWorkouts;
// }

// function getNextWorkout(
// 	cycle: CyclesSelect,
// 	nextWorkout: WorkoutsSelect | undefined,
// ) {
// 	if (cycle.status === Status.Completed || !nextWorkout) {
// 		return undefined;
// 	}

// 	return {
// 		primaryLift:
// 			nextWorkout.primaryLift as (typeof PrimaryLift)[keyof typeof PrimaryLift],
// 		status: nextWorkout.status as (typeof Status)[keyof typeof Status],
// 	};
// }

// async function startNewCycle() {
// 	"use server";
// 	const userId = await getUserId();
// 	await createCycle(userId);
// 	revalidatePath("/modules/strength-training");
// }

// function CycleList({
// 	cycles,
// 	workoutData,
// }: {
// 	cycles: CyclesSelect[];
// 	workoutData: WorkoutsSelect[];
// }) {
// 	const stats = getWorkoutStats(workoutData);

// 	// Calculate overall stats
// 	const totalCycles = cycles.length;
// 	const workoutsDone = workoutData.filter(
// 		(w) => w.status === Status.Completed,
// 	).length;
// 	const totalVolume = 123456; // Eventually this will be calculated
// 	const consistency = 85; // Eventually this will be calculated

// 	// Separate current and completed cycles
// 	const currentCycle = cycles.find(
// 		(cycle) => cycle.status !== Status.Completed,
// 	);
// 	const completedCycles = cycles
// 		.filter((cycle) => cycle.status === Status.Completed)
// 		.sort(
// 			(a, b) =>
// 				(b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
// 		)
// 		.slice(0, 3);

// 	return (
// 		<div className="space-y-8">
// 			<Card>
// 				<CardHeader>
// 					<CardTitle className="text-2xl">Your Progress</CardTitle>
// 					<CardDescription>
// 						Remember, consistency is key. Every workout counts!
// 					</CardDescription>
// 				</CardHeader>
// 				<CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
// 					<div className="flex flex-col space-y-1.5">
// 						<span className="text-2xl font-semibold">{totalCycles}</span>
// 						<span className="text-sm text-muted-foreground">Total Cycles</span>
// 					</div>
// 					<div className="flex flex-col space-y-1.5">
// 						<span className="text-2xl font-semibold">{workoutsDone}</span>
// 						<span className="text-sm text-muted-foreground">Workouts Done</span>
// 					</div>
// 					<div className="flex flex-col space-y-1.5 line-through">
// 						<span className="text-2xl font-semibold">
// 							{totalVolume.toLocaleString()}lb
// 						</span>
// 						<span className="text-sm text-muted-foreground">Total Volume</span>
// 					</div>
// 					<div className="flex flex-col space-y-1.5 line-through">
// 						<span className="text-2xl font-semibold">{consistency}%</span>
// 						<span className="text-sm text-muted-foreground">Consistency</span>
// 					</div>
// 				</CardContent>
// 				<CardFooter>
// 					<Button variant="outline" className="w-full" disabled>
// 						<LineChart className="mr-2 h-4 w-4" /> View Detailed Stats
// 					</Button>
// 				</CardFooter>
// 			</Card>

// 			<Card>
// 				<CardHeader>
// 					<CardTitle className="text-2xl">Workout Cycles</CardTitle>
// 				</CardHeader>
// 				<CardContent className="space-y-6">
// 					{currentCycle && (
// 						<div>
// 							<h3 className="text-lg font-semibold mb-4">Current Cycle</h3>
// 							<CycleCard
// 								key={currentCycle.id}
// 								{...currentCycle}
// 								completedWorkouts={getCompletedWorkouts(currentCycle, stats)}
// 								totalWorkouts={stats.totalWorkouts}
// 								nextWorkout={getNextWorkout(currentCycle, stats.nextWorkout)}
// 							/>
// 						</div>
// 					)}

// 					{completedCycles.length > 0 && (
// 						<div className="mt-8">
// 							<h3 className="text-lg font-semibold mb-4">Previous Cycles</h3>
// 							<div className="grid gap-6 md:grid-cols-2">
// 								{completedCycles.map((cycle) => (
// 									<CycleCard
// 										key={cycle.id}
// 										{...cycle}
// 										completedWorkouts={getCompletedWorkouts(cycle, stats)}
// 										totalWorkouts={stats.totalWorkouts}
// 										nextWorkout={getNextWorkout(cycle, stats.nextWorkout)}
// 									/>
// 								))}
// 							</div>
// 						</div>
// 					)}
// 				</CardContent>
// 			</Card>
// 		</div>
// 	);
// }

// export default async function StrengthTrainingPage() {
// 	const userId = await getUserId();
// 	const { hasAllMaxes, cycles, workoutData } = await getTrainingData(userId);

// 	if (!hasAllMaxes) {
// 		return <OneRMForm />;
// 	}

// 	return (
// 		<div className="container mx-auto p-6 space-y-8">
// 			<div className="flex justify-between items-center">
// 				<h1 className="text-4xl font-bold">Cycle Dashboard</h1>
// 				<form className="flex space-x-4">
// 					<Button type="submit" formAction={startNewCycle}>
// 						<Plus className="mr-2 h-4 w-4" /> Start New Cycle
// 					</Button>
// 					<Button variant="outline" type="button" disabled>
// 						<Download className="mr-2 h-4 w-4" /> Export Data
// 					</Button>
// 				</form>
// 			</div>
// 			<CycleList cycles={cycles} workoutData={workoutData} />
// 		</div>
// 	);
// }

export default function StrengthTrainingPage() {
	return <div>StrengthTrainingPage</div>;
}
