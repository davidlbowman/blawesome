"use server";

import { db } from "@/drizzle/db";
import {
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export async function startRest(workoutId: string) {
	return await db.transaction(async (tx) => {
		// Get the current exercise and set
		const [currentExercise] = await tx
			.select({
				exerciseId: exercises.id,
				currentSetId: sets.id,
			})
			.from(exercises)
			.leftJoin(sets, eq(sets.exerciseId, exercises.id))
			.where(eq(exercises.workoutId, workoutId))
			.orderBy(exercises.order, sets.setNumber)
			.limit(1);

		if (!currentExercise) return;

		// Update the workout status to in_progress if it's not already
		await tx
			.update(workouts)
			.set({
				status: "in_progress",
				updatedAt: new Date(),
			})
			.where(eq(workouts.id, workoutId));

		// Update the exercise status to in_progress if it's not already
		await tx
			.update(exercises)
			.set({
				status: "in_progress",
				updatedAt: new Date(),
			})
			.where(eq(exercises.id, currentExercise.exerciseId));

		// Update the set status to in_progress if it's not already
		if (currentExercise.currentSetId) {
			await tx
				.update(sets)
				.set({
					status: "in_progress",
					updatedAt: new Date(),
				})
				.where(eq(sets.id, currentExercise.currentSetId));
		}
	});
}
