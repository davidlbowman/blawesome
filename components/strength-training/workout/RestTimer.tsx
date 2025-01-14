"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useState } from "react";

interface SetPerformance {
	weight: number;
	reps: number | null;
	rpe: number | null;
}

interface RestTimerProps {
	show: boolean;
	onOpenChange: (open: boolean) => void;
	exerciseName: string;
	currentSetNumber: number;
	totalSets: number;
	isPrimary: boolean;
	isLastSet: boolean;
	performance: SetPerformance;
	onPerformanceChange: (performance: SetPerformance) => void;
	onCompleteSet: () => void;
	onSkipRemainingExerciseSets: () => void;
}

export function RestTimer({
	show,
	onOpenChange,
	exerciseName,
	currentSetNumber,
	totalSets,
	isPrimary,
	isLastSet,
	performance,
	onPerformanceChange,
	onCompleteSet,
	onSkipRemainingExerciseSets,
}: RestTimerProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [time, setTime] = useState(0);

	useEffect(() => {
		let interval: NodeJS.Timer;
		if (show) {
			interval = setInterval(() => {
				setTime((t) => t + 1);
			}, 1000);
		}
		return () => {
			clearInterval(interval);
			setTime(0);
		};
	}, [show]);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const dialogTitle = `${exerciseName} - Set ${currentSetNumber}/${totalSets}`;

	const timerContent = (
		<div className="space-y-6 p-4">
			<div className="text-center space-y-3">
				<div className="text-6xl font-mono font-bold tracking-tight">
					{formatTime(time)}
				</div>
				<p className="text-sm text-muted-foreground">
					{isPrimary
						? "Enter your actual performance for this set. If you completed the set as prescribed, you can leave the values unchanged."
						: "Enter the weight used and select your RPE (Rate of Perceived Exertion) for this set."}
				</p>
			</div>

			{isPrimary ? (
				<div className="space-y-4">
					<div>
						<Label htmlFor="weight">Weight (lbs)</Label>
						<Input
							id="weight"
							type="number"
							value={performance.weight}
							onChange={(e) =>
								onPerformanceChange({
									...performance,
									weight: Number(e.target.value),
								})
							}
						/>
					</div>

					<div>
						<Label htmlFor="reps">Reps</Label>
						<Input
							id="reps"
							type="number"
							value={performance.reps ?? ""}
							onChange={(e) =>
								onPerformanceChange({
									...performance,
									reps: e.target.value === "" ? null : Number(e.target.value),
								})
							}
						/>
					</div>
				</div>
			) : (
				<>
					<div>
						<Label htmlFor="weight">Weight (lbs)</Label>
						<Input
							id="weight"
							type="number"
							value={performance.weight}
							onChange={(e) =>
								onPerformanceChange({
									...performance,
									weight: Number(e.target.value),
								})
							}
						/>
					</div>

					<div>
						<Label>RPE</Label>
						<div className="grid grid-cols-6 gap-2">
							{[5, 6, 7, 8, 9, 10].map((rpe) => (
								<Button
									key={rpe}
									variant={performance.rpe === rpe ? "default" : "outline"}
									onClick={() => onPerformanceChange({ ...performance, rpe })}
								>
									{rpe}
								</Button>
							))}
						</div>
					</div>
				</>
			)}

			<div className="flex flex-col gap-2 pt-4">
				<Button onClick={onCompleteSet}>
					{isLastSet ? "Complete Workout" : "Start Next Set"}
				</Button>
				<Button
					variant="ghost"
					className="text-destructive hover:text-destructive"
					onClick={onSkipRemainingExerciseSets}
				>
					Skip Remaining Exercise Sets
				</Button>
			</div>
		</div>
	);

	if (isDesktop) {
		return (
			<Dialog open={show} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{dialogTitle}</DialogTitle>
					</DialogHeader>
					{timerContent}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={show} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>{dialogTitle}</DrawerTitle>
				</DrawerHeader>
				{timerContent}
			</DrawerContent>
		</Drawer>
	);
}
