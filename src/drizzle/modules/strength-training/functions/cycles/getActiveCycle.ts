"use server";

import type { User } from "@/drizzle/core/schemas/users";
import { db } from "@/drizzle/db";
import {
	type CyclesSelect,
	cycles,
	cyclesSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/cycles";
import { Status } from "@/drizzle/modules/strength-training/types";
import { and, eq } from "drizzle-orm";

export async function getActiveCycle(
	userId: User["id"],
): Promise<CyclesSelect | null> {
	const [activeCycle] = await db
		.select()
		.from(cycles)
		.where(
			and(eq(cycles.userId, userId), eq(cycles.status, Status.Enum.pending)),
		);

	if (!activeCycle) return null;
	const parsedCycle = cyclesSelectSchema.parse(activeCycle);
	return parsedCycle;
}
