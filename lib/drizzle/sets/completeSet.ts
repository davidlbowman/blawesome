"use server";

import { db } from "@/lib/drizzle/db";
import {
	exercises,
	sets,
	workouts,
} from "@/lib/drizzle/schemas/strength-training";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function completeSet(
	setId: string,
	exerciseId: string,
	workoutId: string,
) {
	await db.transaction(async (tx) => {
		// Complete current set
		await tx
			.update(sets)
			.set({
				status: "completed",
				completedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(sets.id, setId));

		// Get all sets for this exercise
		const exerciseSets = await tx
			.select()
			.from(sets)
			.where(eq(sets.exerciseId, exerciseId))
			.orderBy(sets.setNumber);

		const currentSetIndex = exerciseSets.findIndex((s) => s.id === setId);
		const nextSet = exerciseSets[currentSetIndex + 1];

		if (nextSet) {
			// If there's another set, mark it as in_progress
			await tx
				.update(sets)
				.set({
					status: "in_progress",
					updatedAt: new Date(),
				})
				.where(eq(sets.id, nextSet.id));
		} else {
			// If no more sets, complete the exercise
			await tx
				.update(exercises)
				.set({
					status: "completed",
					completedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(exercises.id, exerciseId));

			// Get all exercises for this workout
			const workoutExercises = await tx
				.select()
				.from(exercises)
				.where(eq(exercises.workoutId, workoutId))
				.orderBy(exercises.order);

			const currentExerciseIndex = workoutExercises.findIndex(
				(e) => e.id === exerciseId,
			);
			const nextExercise = workoutExercises[currentExerciseIndex + 1];

			if (nextExercise) {
				// If there's another exercise, mark it and its first set as in_progress
				await tx
					.update(exercises)
					.set({
						status: "in_progress",
						updatedAt: new Date(),
					})
					.where(eq(exercises.id, nextExercise.id));

				const nextExerciseSets = await tx
					.select()
					.from(sets)
					.where(eq(sets.exerciseId, nextExercise.id))
					.orderBy(sets.setNumber);

				if (nextExerciseSets.length > 0) {
					await tx
						.update(sets)
						.set({
							status: "in_progress",
							updatedAt: new Date(),
						})
						.where(eq(sets.id, nextExerciseSets[0].id));
				}
			} else {
				// If no more exercises, complete the workout
				await tx
					.update(workouts)
					.set({
						status: "completed",
						completedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(workouts.id, workoutId));
			}
		}
	});

	revalidatePath("/modules/strength-training/[cycleId]", "page");
}
