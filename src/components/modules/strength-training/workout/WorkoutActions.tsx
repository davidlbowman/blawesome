"use client";

import { Button } from "@/components/ui/button";
import { Status } from "@/drizzle/modules/strength-training/types";
import Link from "next/link";

interface WorkoutActionsProps {
	status: string;
	cycleId: string;
	onStartWorkout: () => void;
	onStartRest: () => void;
	onHandleCurrentSet: (
		status: Status,
		weight: number,
		reps: number,
		rpe: number,
	) => void;
	onCompleteWorkout: () => void;
	onSkipRemainingWorkoutSets: () => void;
}

export function WorkoutActions({
	status,
	cycleId,
	onStartWorkout,
	onStartRest,
	onHandleCurrentSet,
	onCompleteWorkout,
	onSkipRemainingWorkoutSets,
}: WorkoutActionsProps) {
	const isLastSet = false; // TODO: Implement

	if (status === "completed") {
		return (
			<Link
				href={`/modules/strength-training/${cycleId}`}
				className="block w-full"
			>
				<Button className="w-full" size="lg">
					Return to Cycle
				</Button>
			</Link>
		);
	}

	if (status === "pending") {
		return (
			<div className="space-y-2">
				<Button className="w-full" size="lg" onClick={onStartWorkout}>
					Start Workout
				</Button>
				<Button
					variant="destructive"
					size="lg"
					className="w-full"
					onClick={onSkipRemainingWorkoutSets}
				>
					Skip Remaining Sets & Complete Workout
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-2 gap-2">
				<Button className="w-full" size="lg" onClick={onStartRest}>
					Rest
				</Button>
				{isLastSet ? (
					<Button variant="outline" size="lg" onClick={onCompleteWorkout}>
						Skip and Complete Workout
					</Button>
				) : (
					<Button
						variant="outline"
						size="lg"
						onClick={() => onHandleCurrentSet(Status.Enum.skipped, 0, 0, 0)}
					>
						Skip Set
					</Button>
				)}
			</div>
			<Button
				variant="destructive"
				size="lg"
				className="w-full"
				onClick={onSkipRemainingWorkoutSets}
			>
				Skip Remaining Sets & Complete Workout
			</Button>
		</div>
	);
}
