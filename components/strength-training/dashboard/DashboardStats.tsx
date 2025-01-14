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
import { LineChart } from "lucide-react";

interface DashboardStatsProps {
	totalCycles: number;
	workoutsDone: number;
	totalVolume: number;
	consistency: number;
}

export function DashboardStats({
	totalCycles,
	workoutsDone,
	totalVolume,
	consistency,
}: DashboardStatsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Your Progress</CardTitle>
				<CardDescription>
					Remember, consistency is key. Every workout counts!
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="flex flex-col space-y-1.5">
					<span className="text-2xl font-semibold">{totalCycles}</span>
					<span className="text-sm text-muted-foreground">Total Cycles</span>
				</div>
				<div className="flex flex-col space-y-1.5">
					<span className="text-2xl font-semibold">{workoutsDone}</span>
					<span className="text-sm text-muted-foreground">Workouts Done</span>
				</div>
				<div className="flex flex-col space-y-1.5 line-through">
					<span className="text-2xl font-semibold">
						{totalVolume.toLocaleString()}lb
					</span>
					<span className="text-sm text-muted-foreground">Total Volume</span>
				</div>
				<div className="flex flex-col space-y-1.5 line-through">
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
	);
}
