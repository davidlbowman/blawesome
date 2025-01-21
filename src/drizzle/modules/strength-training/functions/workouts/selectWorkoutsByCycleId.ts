"use server";

import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import {
	type WorkoutsSelect,
	workouts,
	workoutsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/workouts";
import { eq } from "drizzle-orm";

interface SelectWorkoutsByCycleIdParams {
	cycleId: Pick<CyclesSelect, "id">;
}

type SelectWorkoutsByCycleIdResponse = Promise<
	Response<
		Pick<
			WorkoutsSelect,
			| "id"
			| "cycleId"
			| "status"
			| "createdAt"
			| "completedAt"
			| "primaryLift"
			| "sequence"
		>[]
	>
>;

export async function selectWorkoutsByCycleId({
	cycleId,
}: SelectWorkoutsByCycleIdParams): SelectWorkoutsByCycleIdResponse {
	const workoutsResponse = await db
		.select({
			id: workouts.id,
			cycleId: workouts.cycleId,
			status: workouts.status,
			createdAt: workouts.createdAt,
			completedAt: workouts.completedAt,
			primaryLift: workouts.primaryLift,
			sequence: workouts.sequence,
		})
		.from(workouts)
		.where(eq(workouts.cycleId, cycleId.id))
		.orderBy(workouts.sequence)
		.then((workouts) =>
			workoutsSelectSchema
				.pick({
					id: true,
					cycleId: true,
					status: true,
					createdAt: true,
					completedAt: true,
					primaryLift: true,
					sequence: true,
				})
				.array()
				.parse(workouts),
		);

	return {
		success: true,
		data: workoutsResponse,
	};
}
