"use client";

import { WorkoutCard } from "./WorkoutCard";

interface WorkoutListProps {
	currentWorkout?: WorkoutData;
	nextWorkouts: WorkoutData[];
	previousWorkouts: WorkoutData[];
	cycleId: string;
}

interface WorkoutData {
	id: string;
	status: string;
	date: Date;
	completedAt?: Date | null;
	primaryLift: string;
	sequence: number;
	completedSets: number;
	totalSets: number;
}

export function WorkoutList({
	currentWorkout,
	nextWorkouts,
	previousWorkouts,
	cycleId,
}: WorkoutListProps) {
	return (
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
	);
}
