"use server";

import type { UserSelect } from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import {
	type CyclesSelect,
	cycles,
	cyclesSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/cycles";
import { Status } from "@/drizzle/modules/strength-training/types";
import { and, eq } from "drizzle-orm";

interface GetActiveCycleParams {
	userId: UserSelect["id"];
}

type GetActiveCycleResponse = Promise<Response<CyclesSelect | null>>;

export async function getActiveCycle({
	userId,
}: GetActiveCycleParams): GetActiveCycleResponse {
	const [activeCycle] = await db
		.select()
		.from(cycles)
		.where(
			and(eq(cycles.userId, userId), eq(cycles.status, Status.Enum.pending)),
		);

	if (!activeCycle) {
		return {
			success: false,
			error: new Error("No active cycle found"),
		};
	}

	const parsedCycle = cyclesSelectSchema.parse(activeCycle);

	return { success: true, data: parsedCycle };
}
