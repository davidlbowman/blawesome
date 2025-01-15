"use server";

import { db } from "@/drizzle/db";
import {
	exercises,
	sets,
	workouts,
	Status,
} from "@/drizzle/modules/strength-training/schemas";
import { and, eq } from "drizzle-orm";

export async function skipRemainingExerciseSets(workoutId: string) {
	const now = new Date();

	return await db.transaction(async (tx) => {
		// Get current exercise
		const [currentExercise] = await tx
			.select({
				id: exercises.id,
				order: exercises.order,
			})
			.from(exercises)
			.where(
				and(
					eq(exercises.workoutId, workoutId),
					eq(exercises.status, Status.InProgress),
				),
			);

		if (!currentExercise) return;

		// Skip all pending sets for this exercise
		await tx
			.update(sets)
			.set({
				status: Status.Skipped,
				updatedAt: now,
			})
			.where(
				and(
					eq(sets.exerciseId, currentExercise.id),
					eq(sets.status, Status.Pending),
				),
			);

		// Mark the exercise as completed
		await tx
			.update(exercises)
			.set({
				status: Status.Completed,
				completedAt: now,
				updatedAt: now,
			})
			.where(eq(exercises.id, currentExercise.id));

		// Get next exercise if any
		const [nextExercise] = await tx
			.select({
				id: exercises.id,
				firstSetId: sets.id,
			})
			.from(exercises)
			.leftJoin(sets, eq(sets.exerciseId, exercises.id))
			.where(
				and(
					eq(exercises.workoutId, workoutId),
					eq(exercises.status, Status.Pending),
				),
			)
			.orderBy(exercises.order, sets.setNumber)
			.limit(1);

		if (nextExercise?.id) {
			// Start next exercise
			await tx
				.update(exercises)
				.set({
					status: Status.InProgress,
					updatedAt: now,
				})
				.where(eq(exercises.id, nextExercise.id));

			if (nextExercise.firstSetId) {
				await tx
					.update(sets)
					.set({
						status: Status.InProgress,
						updatedAt: now,
					})
					.where(eq(sets.id, nextExercise.firstSetId));
			}
		} else {
			// No more exercises, complete workout
			await tx
				.update(workouts)
				.set({
					status: Status.Completed,
					completedAt: now,
					updatedAt: now,
				})
				.where(eq(workouts.id, workoutId));
		}
	});
}
