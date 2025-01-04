"use server";

import { db } from "@/drizzle/db";
import { sets } from "@/drizzle/modules/strength-training/schemas";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { eq } from "drizzle-orm";

export async function skipSet(setId: string) {
	await db
		.update(sets)
		.set({
			status: Status.Skipped,
			completedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(sets.id, setId));
}
