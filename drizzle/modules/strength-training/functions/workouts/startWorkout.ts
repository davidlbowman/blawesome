"use server";

import { db } from "@/drizzle/db";
import {
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export async function startWorkout(workoutId: string) {
	return await db.transaction(async (tx) => {
		const [firstExercise] = await tx
			.select({
				exerciseId: exercises.id,
				firstSetId: sets.id,
			})
			.from(exercises)
			.leftJoin(sets, eq(sets.exerciseId, exercises.id))
			.where(eq(exercises.workoutId, workoutId))
			.orderBy(exercises.order, sets.setNumber)
			.limit(1);

		if (!firstExercise) return;

		await tx
			.update(workouts)
			.set({
				status: "in_progress",
				updatedAt: new Date(),
			})
			.where(eq(workouts.id, workoutId));

		await tx
			.update(exercises)
			.set({
				status: "in_progress",
				updatedAt: new Date(),
			})
			.where(eq(exercises.id, firstExercise.exerciseId));

		if (firstExercise.firstSetId) {
			await tx
				.update(sets)
				.set({
					status: "in_progress",
					updatedAt: new Date(),
				})
				.where(eq(sets.id, firstExercise.firstSetId));
		}
	});
}
