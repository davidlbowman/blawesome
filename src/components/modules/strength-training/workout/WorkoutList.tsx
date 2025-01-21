"use client";

import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { WorkoutCard } from "./WorkoutCard";

interface WorkoutData
	extends Pick<
		WorkoutsSelect,
		| "id"
		| "cycleId"
		| "status"
		| "createdAt"
		| "completedAt"
		| "primaryLift"
		| "sequence"
	> {}

interface WorkoutListProps {
	nextWorkouts: WorkoutData[];
	previousWorkouts: WorkoutData[];
	currentWorkout?: WorkoutData;
}

export function WorkoutList({
	currentWorkout,
	nextWorkouts,
	previousWorkouts,
}: WorkoutListProps) {
	const TOTAL_SETS = 25;

	return (
		<div className="space-y-8">
			<div>
				<h2 className="text-xl font-semibold mb-4">Workouts</h2>
				<div className="space-y-6">
					{currentWorkout && (
						<div>
							<h3 className="text-lg font-medium mb-4">Current Workout</h3>
							<WorkoutCard
								workout={{
									id: currentWorkout.id,
									cycleId: currentWorkout.cycleId,
									status: currentWorkout.status,
									createdAt: currentWorkout.createdAt,
									completedAt: currentWorkout.completedAt,
									primaryLift: currentWorkout.primaryLift,
									sequence: currentWorkout.sequence,
								}}
								completedSets={0}
								totalSets={TOTAL_SETS}
							/>
						</div>
					)}

					{nextWorkouts.length > 0 && (
						<div>
							<h3 className="text-lg font-medium mb-4">Next Workout</h3>
							<WorkoutCard
								workout={{
									id: nextWorkouts[0].id,
									cycleId: nextWorkouts[0].cycleId,
									status: nextWorkouts[0].status,
									createdAt: nextWorkouts[0].createdAt,
									completedAt: nextWorkouts[0].completedAt,
									primaryLift: nextWorkouts[0].primaryLift,
									sequence: nextWorkouts[0].sequence,
								}}
								completedSets={0}
								totalSets={TOTAL_SETS}
							/>
						</div>
					)}

					{nextWorkouts.length > 1 && (
						<div>
							<h3 className="text-lg font-medium mb-4">Upcoming Workouts</h3>
							<div className="grid gap-4 md:grid-cols-2">
								{nextWorkouts.slice(1).map((upcomingWorkout) => (
									<WorkoutCard
										key={upcomingWorkout.id}
										workout={{
											id: upcomingWorkout.id,
											cycleId: upcomingWorkout.cycleId,
											status: upcomingWorkout.status,
											createdAt: upcomingWorkout.createdAt,
											completedAt: upcomingWorkout.completedAt,
											primaryLift: upcomingWorkout.primaryLift,
											sequence: upcomingWorkout.sequence,
										}}
										completedSets={0}
										totalSets={TOTAL_SETS}
									/>
								))}
							</div>
						</div>
					)}

					{previousWorkouts.length > 0 && (
						<div>
							<h3 className="text-lg font-medium mb-4">Previous Workouts</h3>
							<div className="grid gap-4 md:grid-cols-2">
								{previousWorkouts.map((previousWorkout) => (
									<WorkoutCard
										key={previousWorkout.id}
										workout={{
											id: previousWorkout.id,
											cycleId: previousWorkout.cycleId,
											status: previousWorkout.status,
											createdAt: previousWorkout.createdAt,
											completedAt: previousWorkout.completedAt,
											primaryLift: previousWorkout.primaryLift,
											sequence: previousWorkout.sequence,
										}}
										completedSets={TOTAL_SETS}
										totalSets={TOTAL_SETS}
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
