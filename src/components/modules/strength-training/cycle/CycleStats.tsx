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

interface CycleStatsProps {
	totalWorkouts: number;
	completedWorkouts: number;
	totalVolume: number;
	consistency: number;
}

export function CycleStats({
	totalWorkouts,
	completedWorkouts,
	totalVolume,
	consistency,
}: CycleStatsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Cycle Stats</CardTitle>
				<CardDescription>
					Track your progress through this training cycle
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="flex flex-col space-y-1.5">
					<span className="text-2xl font-semibold">{totalWorkouts}</span>
					<span className="text-sm text-muted-foreground">Total Workouts</span>
				</div>
				<div className="flex flex-col space-y-1.5">
					<span className="text-2xl font-semibold">{completedWorkouts}</span>
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
	);
}
