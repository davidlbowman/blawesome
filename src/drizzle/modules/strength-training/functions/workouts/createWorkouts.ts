"use server";

import type { UserSelect } from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import {
	type WorkoutsSelect,
	workouts,
	workoutsInsertSchema,
	workoutsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/workouts";
import { PrimaryLift, Status } from "@/drizzle/modules/strength-training/types";

interface CreateWorkoutsParams {
	userId: UserSelect["id"];
	cycle: Pick<CyclesSelect, "id">;
	tx?: DrizzleTransaction;
}

type CreateWorkoutsResponse = Promise<
	Response<Pick<WorkoutsSelect, "id" | "primaryLift">[]>
>;

export async function createWorkouts({
	userId,
	cycle,
	tx,
}: CreateWorkoutsParams): CreateWorkoutsResponse {
	const queryRunner = tx || db;

	const workoutValues = Array.from({ length: 16 }).map((_, index) => {
		return workoutsInsertSchema.parse({
			userId,
			cycleId: cycle.id,
			createdAt: new Date(),
			updatedAt: new Date(),
			primaryLift: PrimaryLift.options[index % PrimaryLift.options.length],
			status: Status.Enum.pending,
			sequence: index + 1,
		});
	});

	const createdWorkouts = await queryRunner
		.insert(workouts)
		.values(workoutValues)
		.returning()
		.then((workouts) =>
			workoutsSelectSchema
				.pick({ id: true, primaryLift: true })
				.array()
				.parse(workouts),
		);

	return {
		success: true,
		data: createdWorkouts,
	};
}
