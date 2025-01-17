"use server";

import { db } from "@/drizzle/db";
import {
	cycles,
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export async function skipRemainingWorkouts(cycleId: string) {
	const now = new Date();

	return await db.transaction(async (tx) => {
		// Get all pending workouts for this cycle
		const pendingWorkouts = await tx
			.select()
			.from(workouts)
			.where(eq(workouts.cycleId, cycleId))
			.orderBy(workouts.sequence);

		// Skip all pending workouts and their exercises/sets
		for (const workout of pendingWorkouts) {
			if (workout.status === "pending") {
				// Get all exercises for this workout
				const workoutExercises = await tx
					.select()
					.from(exercises)
					.where(eq(exercises.workoutId, workout.id));

				// Skip all exercises and their sets
				for (const exercise of workoutExercises) {
					// Skip all sets for this exercise
					await tx
						.update(sets)
						.set({
							status: "skipped",
							updatedAt: now,
						})
						.where(eq(sets.exerciseId, exercise.id));

					// Skip the exercise
					await tx
						.update(exercises)
						.set({
							status: "skipped",
							updatedAt: now,
						})
						.where(eq(exercises.id, exercise.id));
				}

				// Skip the workout
				await tx
					.update(workouts)
					.set({
						status: "skipped",
						updatedAt: now,
					})
					.where(eq(workouts.id, workout.id));
			}
		}

		// Mark the cycle as completed
		await tx
			.update(cycles)
			.set({
				status: "completed",
				endDate: now,
				completedAt: now,
				updatedAt: now,
			})
			.where(eq(cycles.id, cycleId));
	});
}
