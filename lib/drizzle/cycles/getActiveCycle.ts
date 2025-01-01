"use server";

import { db } from "@/lib/drizzle/db";
import {
	type CyclesSelect,
	cycles,
} from "@/lib/drizzle/schemas/strength-training";
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
