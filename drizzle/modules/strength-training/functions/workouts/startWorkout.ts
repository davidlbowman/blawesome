"use server";

import { db } from "@/drizzle/db";
import {
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export async function startWorkout(workoutId: string) {
	await db.transaction(async (tx) => {
		await tx
			.update(workouts)
			.set({
				status: "in_progress",
				updatedAt: new Date(),
			})
			.where(eq(workouts.id, workoutId));

		// Set first exercise to in_progress
		const workoutExercises = await tx
			.select()
			.from(exercises)
			.where(eq(exercises.workoutId, workoutId))
			.orderBy(exercises.order);

		if (workoutExercises.length > 0) {
			await tx
				.update(exercises)
				.set({
					status: "in_progress",
					updatedAt: new Date(),
				})
				.where(eq(exercises.id, workoutExercises[0].id));

			// Set first set of first exercise to in_progress
			const firstExerciseSets = await tx
				.select()
				.from(sets)
				.where(eq(sets.exerciseId, workoutExercises[0].id))
				.orderBy(sets.setNumber);

			if (firstExerciseSets.length > 0) {
				await tx
					.update(sets)
					.set({
						status: "in_progress",
						updatedAt: new Date(),
					})
					.where(eq(sets.id, firstExerciseSets[0].id));
			}
		}
	});
}
