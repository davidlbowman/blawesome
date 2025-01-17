"use server";

import { db } from "@/drizzle/db";
import { exercises, sets } from "@/drizzle/modules/strength-training/schemas";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { and, eq } from "drizzle-orm";

export async function skipRemainingExerciseSets(exerciseId: string) {
	const now = new Date();

	return await db.transaction(async (tx) => {
		// Skip all pending sets in this exercise
		await tx
			.update(sets)
			.set({
				status: Status.Skipped,
				updatedAt: now,
			})
			.where(
				and(eq(sets.exerciseId, exerciseId), eq(sets.status, Status.Pending)),
			);

		// Mark the exercise as completed
		await tx
			.update(exercises)
			.set({
				status: Status.Completed,
				completedAt: now,
				updatedAt: now,
			})
			.where(eq(exercises.id, exerciseId));
	});
}
