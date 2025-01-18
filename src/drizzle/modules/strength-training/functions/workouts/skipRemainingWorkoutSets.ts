"use server";

import { db } from "@/drizzle/db";
import { exercises } from "@/drizzle/modules/strength-training/schemas/exercises";
import { sets } from "@/drizzle/modules/strength-training/schemas/sets";
import { workouts } from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
import { and, eq } from "drizzle-orm";

export async function skipRemainingWorkoutSets(workoutId: string) {
	const now = new Date();

	return await db.transaction(async (tx) => {
		// Get all exercises for this workout
		const workoutExercises = await tx
			.select()
			.from(exercises)
			.where(eq(exercises.workoutId, workoutId));

		// Skip all exercises and their sets
		for (const exercise of workoutExercises) {
			if (
				exercise.status === Status.Enum.pending ||
				exercise.status === Status.Enum.in_progress
			) {
				// Skip only pending sets for this exercise
				await tx
					.update(sets)
					.set({
						status: Status.Enum.skipped,
						updatedAt: now,
					})
					.where(
						and(
							eq(sets.exerciseId, exercise.id),
							eq(sets.status, Status.Enum.pending),
						),
					);

				// Skip the exercise
				await tx
					.update(exercises)
					.set({
						status: Status.Enum.skipped,
						updatedAt: now,
					})
					.where(eq(exercises.id, exercise.id));
			}
		}

		// Mark the workout as completed
		await tx
			.update(workouts)
			.set({
				status: Status.Enum.completed,
				completedAt: now,
				updatedAt: now,
			})
			.where(eq(workouts.id, workoutId));
	});
}
