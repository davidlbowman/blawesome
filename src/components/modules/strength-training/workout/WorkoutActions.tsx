"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface WorkoutActionsProps {
	status: string;
	cycleId: string;
	onStartWorkout: () => void;
	// onStartRest: () => boolean;
	onSkipSet: () => void;
	onCompleteWorkout: () => void;
	onSkipRemainingWorkoutSets: () => void;
}

export function WorkoutActions({
	status,
	cycleId,
	onStartWorkout,
	// onStartRest,
	onSkipSet,
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
				{/* <Button className="w-full" size="lg" onClick={onStartRest}>
					Rest
				</Button> */}
				<Button className="w-full" size="lg">
					Rest
				</Button>
				{isLastSet ? (
					<Button variant="outline" size="lg" onClick={onCompleteWorkout}>
						Skip and Complete Workout
					</Button>
				) : (
					<Button variant="outline" size="lg" onClick={onSkipSet}>
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
