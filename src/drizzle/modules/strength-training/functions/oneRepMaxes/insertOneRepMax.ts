"use server";

import type { Response } from "@/drizzle/core/types";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import {
	type OneRepMaxesInsert,
	oneRepMaxes,
} from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import { sql } from "drizzle-orm";

interface InsertOneRepMaxParams {
	oneRepMax: Pick<
		OneRepMaxesInsert,
		"userId" | "exerciseDefinitionId" | "weight"
	>;
	tx?: DrizzleTransaction;
}

type InsertOneRepMaxResponse = Promise<Response<void>>;

export async function insertOneRepMax({
	oneRepMax,
	tx,
}: InsertOneRepMaxParams): InsertOneRepMaxResponse {
	const queryRunner = tx || db;

	try {
		await queryRunner
			.insert(oneRepMaxes)
			.values(oneRepMax)
			.onConflictDoUpdate({
				target: [oneRepMaxes.userId, oneRepMaxes.exerciseDefinitionId],
				set: {
					weight: oneRepMax.weight,
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
