"use server";

import { db } from "@/drizzle/db";
import { exercises, sets } from "@/drizzle/modules/strength-training/schemas";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { eq } from "drizzle-orm";

export async function skipSet(setId: string) {
	await db.transaction(async (tx) => {
		// Get the set and its exercise
		const [set] = await tx
			.select({
				set: sets,
				exerciseId: sets.exerciseId,
			})
			.from(sets)
			.where(eq(sets.id, setId));

		// Mark the set as skipped
		await tx
			.update(sets)
			.set({
				status: Status.Skipped,
				completedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(sets.id, setId));

		// Check if all sets in the exercise are completed or skipped
		const exerciseSets = await tx
			.select()
			.from(sets)
			.where(eq(sets.exerciseId, set.exerciseId));

		const allSetsCompleted = exerciseSets.every(
			(s) => s.status === Status.Completed || s.status === Status.Skipped,
		);

		if (allSetsCompleted) {
			// Mark the exercise as completed
			await tx
				.update(exercises)
				.set({
					status: Status.Completed,
					completedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(exercises.id, set.exerciseId));
		}
	});
}
