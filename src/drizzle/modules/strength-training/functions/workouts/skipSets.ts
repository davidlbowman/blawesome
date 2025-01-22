"use server";

import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import {
	type SetsSelect,
	sets,
} from "@/drizzle/modules/strength-training/schemas/sets";
import { Status } from "@/drizzle/modules/strength-training/types";
import { inArray } from "drizzle-orm";

interface SkipSetsParams {
	setIds: Pick<SetsSelect, "id">[];
}

type SkipSetsResponse = Promise<Response<void>>;

export async function skipSets({ setIds }: SkipSetsParams): SkipSetsResponse {
	try {
		await db.transaction(async (tx) => {
			await tx
				.update(sets)
				.set({ status: Status.Enum.skipped })
				.where(
					inArray(
						sets.id,
						setIds.map((set) => set.id),
					),
				);
		});

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error("Failed to skip set"),
		};
	}
}
