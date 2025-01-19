"use server";

import type { UserSelect } from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import {
	type CyclesSelect,
	cycles,
	cyclesSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/cycles";
import { desc, eq } from "drizzle-orm";

interface GetCyclesParams {
	userId: UserSelect["id"];
}

type GetCyclesResponse = Promise<Response<CyclesSelect[]>>;

export async function getCycles({
	userId,
}: GetCyclesParams): GetCyclesResponse {
	const userCycles = await db
		.select()
		.from(cycles)
		.where(eq(cycles.userId, userId))
		.orderBy(desc(cycles.createdAt));

	if (!userCycles) {
		return { success: false, error: new Error("No cycles found") };
	}

	const parsedCycles = userCycles.map((cycle) =>
		cyclesSelectSchema.parse(cycle),
	);

	return { success: true, data: parsedCycles };
}
