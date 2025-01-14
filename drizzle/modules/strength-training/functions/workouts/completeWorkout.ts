"use server";

import { db } from "@/drizzle/db";
import {
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export async function completeWorkout(workoutId: string) {
	const now = new Date();

	return await db.transaction(async (tx) => {
		// Get all exercises for this workout
		const workoutExercises = await tx
			.select()
			.from(exercises)
			.where(eq(exercises.workoutId, workoutId));

		// Complete all exercises and their sets
		for (const exercise of workoutExercises) {
			if (exercise.status === "pending" || exercise.status === "in_progress") {
				// Complete all pending sets for this exercise
				await tx
					.update(sets)
					.set({
						status: "completed",
						updatedAt: now,
						completedAt: now,
					})
					.where(eq(sets.exerciseId, exercise.id));

				// Complete the exercise
				await tx
					.update(exercises)
					.set({
						status: "completed",
						updatedAt: now,
						completedAt: now,
					})
					.where(eq(exercises.id, exercise.id));
			}
		}

		// Mark the workout as completed
		await tx
			.update(workouts)
			.set({
				status: "completed",
				completedAt: now,
				updatedAt: now,
			})
			.where(eq(workouts.id, workoutId));
	});
}
