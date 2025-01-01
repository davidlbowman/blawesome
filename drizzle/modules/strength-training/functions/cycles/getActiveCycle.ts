"use server";

import { db } from "@/drizzle/db";
import {
	type CyclesSelect,
	cycles,
} from "@/drizzle/modules/strength-training/schemas";
import { and, eq } from "drizzle-orm";

export async function getActiveCycle(
	userId: string,
): Promise<CyclesSelect | null> {
	const [activeCycle] = await db
		.select()
		.from(cycles)
		.where(and(eq(cycles.userId, userId), eq(cycles.status, "pending")));

	return activeCycle || null;
}
