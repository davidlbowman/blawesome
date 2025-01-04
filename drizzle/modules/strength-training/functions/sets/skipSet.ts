"use server";

import { db } from "@/drizzle/db";
import { sets } from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export async function skipSet(setId: string) {
	await db
		.update(sets)
		.set({
			status: "completed",
			completedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(sets.id, setId));
}
