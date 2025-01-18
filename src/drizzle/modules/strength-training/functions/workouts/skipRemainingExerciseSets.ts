"use server";

import { db } from "@/drizzle/db";
import { exercises } from "@/drizzle/modules/strength-training/schemas/exercises";
import { sets } from "@/drizzle/modules/strength-training/schemas/sets";
import { Status } from "@/drizzle/modules/strength-training/types";
import { and, eq } from "drizzle-orm";

export async function skipRemainingExerciseSets(exerciseId: string) {
	const now = new Date();

	return await db.transaction(async (tx) => {
		// Skip all pending sets in this exercise
		await tx
			.update(sets)
			.set({
				status: Status.Enum.skipped,
				updatedAt: now,
			})
			.where(
				and(
					eq(sets.exerciseId, exerciseId),
					eq(sets.status, Status.Enum.pending),
				),
			);

		// Mark the exercise as completed
		await tx
			.update(exercises)
			.set({
				status: Status.Enum.completed,
				completedAt: now,
				updatedAt: now,
			})
			.where(eq(exercises.id, exerciseId));
	});
}
