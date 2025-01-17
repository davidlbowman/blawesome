"use server";

import { db } from "@/drizzle/db";
import {
	type OneRepMaxesInsert,
	oneRepMaxes,
} from "@/drizzle/modules/strength-training/schemas";
import { sql } from "drizzle-orm";

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
	console.log("Inserting one rep max with params:", {
		userId,
		exerciseDefinitionId,
		weight,
	});

	try {
		await db
			.insert(oneRepMaxes)
			.values({
				userId,
				exerciseDefinitionId,
				weight,
			})
			.onConflictDoUpdate({
				target: [oneRepMaxes.userId, oneRepMaxes.exerciseDefinitionId],
				set: {
					weight,
					updatedAt: sql`CURRENT_TIMESTAMP`,
				},
			});
		console.log("Successfully inserted/updated one rep max");
	} catch (error) {
		console.error("Failed to insert/update one rep max:", error);
		throw error;
	}
}
