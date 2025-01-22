"use server";

import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import {
	type SetsSelect,
	sets,
} from "@/drizzle/modules/strength-training/schemas/sets";
import { Status } from "@/drizzle/modules/strength-training/types";
import { eq } from "drizzle-orm";

interface CompleteSetParams {
	setId: Pick<SetsSelect, "id">;
}

type CompleteSetResponse = Promise<Response<void>>;

export async function completeSet({
	setId,
}: CompleteSetParams): CompleteSetResponse {
	try {
		await db.transaction(async (tx) => {
			await tx
				.update(sets)
				.set({ status: Status.Enum.completed })
				.where(eq(sets.id, setId.id));
		});

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error : new Error("Failed to complete set"),
		};
	}
}
