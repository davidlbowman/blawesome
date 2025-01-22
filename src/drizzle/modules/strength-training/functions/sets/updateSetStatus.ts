"use server";

import type { Response } from "@/drizzle/core/types";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import {
	type SetsSelect,
	sets,
} from "@/drizzle/modules/strength-training/schemas/sets";
import { eq } from "drizzle-orm";

interface UpdateSetStatusParams {
	set: Pick<SetsSelect, "id" | "status">;
	tx?: DrizzleTransaction;
}

type UpdateSetStatusResponse = Promise<Response<void>>;

export async function updateSetStatus({
	set,
	tx,
}: UpdateSetStatusParams): UpdateSetStatusResponse {
	try {
		const queryRunner = tx || db;

		await queryRunner
			.update(sets)
			.set({ status: set.status })
			.where(eq(sets.id, set.id));

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error : new Error("Failed to complete set"),
		};
	}
}
