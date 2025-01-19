"use server";

import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import {
	type OneRepMaxesInsert,
	oneRepMaxes,
} from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import { sql } from "drizzle-orm";

type InsertOneRepMaxParams = Pick<
	OneRepMaxesInsert,
	"userId" | "exerciseDefinitionId" | "weight"
>;

export async function insertOneRepMax({
	userId,
	exerciseDefinitionId,
	weight,
}: InsertOneRepMaxParams): Promise<Response<void>> {
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
		return { success: true, data: undefined };
	} catch (error) {
		console.error("Failed to insert/update one rep max:", error);
		return {
			success: false,
			error: new Error("Failed to insert/update one rep max"),
		};
	}
}
