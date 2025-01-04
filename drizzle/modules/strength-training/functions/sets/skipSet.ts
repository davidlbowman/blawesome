"use server";

import { db } from "@/drizzle/db";
import { exercises, sets } from "@/drizzle/modules/strength-training/schemas";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { and, eq, notInArray } from "drizzle-orm";

export async function skipSet(setId: string) {
	const now = new Date();

	// Update the set and get its exercise ID
	const [skippedSet] = await db
		.update(sets)
		.set({
			status: Status.Skipped,
			completedAt: now,
			updatedAt: now,
		})
		.where(eq(sets.id, setId))
		.returning({
			exerciseId: sets.exerciseId,
		});

	if (!skippedSet) return;

	// Check if any sets are still not completed/skipped
	const incompleteSets = await db
		.select()
		.from(sets)
		.where(
			and(
				eq(sets.exerciseId, skippedSet.exerciseId),
				notInArray(sets.status, [Status.Completed, Status.Skipped]),
			),
		)
		.limit(1);

	// If all sets are completed/skipped, update the exercise
	if (incompleteSets.length === 0) {
		await db
			.update(exercises)
			.set({
				status: Status.Completed,
				completedAt: now,
				updatedAt: now,
			})
			.where(eq(exercises.id, skippedSet.exerciseId));
	}
}
