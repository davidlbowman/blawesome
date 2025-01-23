"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { AllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import {
	ExerciseType,
	Status,
} from "@/drizzle/modules/strength-training/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface RestTimerProps {
	show: boolean;
	set: AllSetsByWorkoutId[number];
	setShowRestTimer: (open: boolean) => void;
	onOpenChange: (open: boolean) => void;
	onHandleCurrentSet: (
		status: Status,
		weight: number,
		reps: number,
		rpe: number,
	) => void;
	onSkipRemainingExerciseSets: () => void;
}

const formSchema = z.object({
	weight: z.number().min(0),
	reps: z.number().min(0).optional(),
	rpe: z.number().min(5).max(10).optional(),
});

export function RestTimer({
	show,
	set,
	setShowRestTimer,
	onOpenChange,
	onHandleCurrentSet,
	onSkipRemainingExerciseSets,
}: RestTimerProps) {
	const exerciseName = set.exerciseDefinitions.name;
	const currentSetNumber = set.sets.setNumber;
	const totalSets = 6; // TODO: Get from database
	const isPrimary = set.exerciseDefinitions.type === ExerciseType.Enum.primary;
	const isLastSet = set.sets.setNumber === totalSets;

	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [time, setTime] = useState(0);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			weight: set.sets.weight,
			reps: set.sets.reps,
			rpe: set.sets.rpe ?? undefined,
		},
	});

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

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		onHandleCurrentSet(
			Status.Enum.completed,
			values.weight,
			values.reps ?? 0,
			values.rpe ?? 0,
		);
		setShowRestTimer(false);
	};

	const timerContent = (
		<div className="space-y-6 p-4">
			<div className="text-center space-y-3">
				<div className="text-6xl font-mono font-bold tracking-tight">
					{formatTime(time)}
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="weight"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Weight (lbs)</FormLabel>
								<FormControl>
									<Input
										type="number"
										{...field}
										onChange={(e) => field.onChange(Number(e.target.value))}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{isPrimary ? (
						<FormField
							control={form.control}
							name="reps"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Reps</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value === ""
														? undefined
														: Number(e.target.value),
												)
											}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					) : (
						<FormField
							control={form.control}
							name="rpe"
							render={({ field }) => (
								<FormItem>
									<FormLabel>RPE</FormLabel>
									<div className="grid grid-cols-6 gap-2">
										{[5, 6, 7, 8, 9, 10].map((rpe) => (
											<Button
												key={rpe}
												type="button"
												variant={field.value === rpe ? "default" : "outline"}
												onClick={() => field.onChange(rpe)}
											>
												{rpe}
											</Button>
										))}
									</div>
								</FormItem>
							)}
						/>
					)}

					<div className="flex flex-col gap-2 pt-4">
						<Button type="submit">
							{isLastSet ? "Complete Workout" : "Start Next Set"}
						</Button>

						<Button
							type="button"
							variant="ghost"
							className="text-destructive hover:text-destructive"
							onClick={() => {
								onSkipRemainingExerciseSets();
								setShowRestTimer(false);
							}}
						>
							Skip Remaining Exercise Sets
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);

	if (isDesktop) {
		return (
			<Dialog open={show} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-balance text-center text-2xl">
							{dialogTitle}
						</DialogTitle>
						<DialogDescription className="text-sm text-muted-foreground text-balance text-center">
							{isPrimary
								? "Enter your actual performance for this set. If you completed the set as prescribed, you can leave the values unchanged."
								: "Enter the weight used and select your RPE (Rate of Perceived Exertion) for this set."}
						</DialogDescription>
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
					<DrawerTitle className="text-balance text-center text-2xl">
						{dialogTitle}
					</DrawerTitle>
					<DrawerDescription className="text-sm text-muted-foreground text-balance text-center">
						{isPrimary
							? "Enter your actual performance for this set. If you completed the set as prescribed, you can leave the values unchanged."
							: "Enter the weight used and select your RPE (Rate of Perceived Exertion) for this set."}
					</DrawerDescription>
				</DrawerHeader>
				{timerContent}
			</DrawerContent>
		</Drawer>
	);
}
