"use server";

import { db } from "@/lib/drizzle/db";
import {
	type CyclesSelect,
	cycles,
} from "@/lib/drizzle/schemas/strength-training";
import { desc, eq } from "drizzle-orm";

export async function getCycles(userId: string): Promise<CyclesSelect[]> {
	const userCycles = await db
		.select()
		.from(cycles)
		.where(eq(cycles.userId, userId))
		.orderBy(desc(cycles.createdAt));

	return userCycles;
}
