"use server";

import type { User } from "@/drizzle/core/schemas/users";
import { db } from "@/drizzle/db";
import {
	type CyclesSelect,
	cycles,
	cyclesSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/cycles";
import { desc, eq } from "drizzle-orm";

export async function getCycles(userId: User["id"]): Promise<CyclesSelect[]> {
	const userCycles = await db
		.select()
		.from(cycles)
		.where(eq(cycles.userId, userId))
		.orderBy(desc(cycles.createdAt));

	const parsedCycles = userCycles.map((cycle) =>
		cyclesSelectSchema.parse(cycle),
	);

	return parsedCycles;
}
