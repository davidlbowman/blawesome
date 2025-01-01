"use server";

import { db } from "@/drizzle/db";
import {
	type OneRepMaxesInsert,
	oneRepMaxes,
} from "@/drizzle/modules/strength-training/schemas";

interface InsertOneRepMaxParams
	extends Pick<
		OneRepMaxesInsert,
		"userId" | "exerciseDefinitionId" | "weight"
	> {}

export async function insertOneRepMax({
	userId,
	exerciseDefinitionId,
	weight,
}: InsertOneRepMaxParams): Promise<void> {
	await db
		.insert(oneRepMaxes)
		.values({
			userId,
			exerciseDefinitionId,
			weight,
		})
		.onConflictDoUpdate({
			target: [oneRepMaxes.userId, oneRepMaxes.exerciseDefinitionId],
			set: { weight, updatedAt: new Date() },
		});
}
