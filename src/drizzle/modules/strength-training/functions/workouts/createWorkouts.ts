"use server";

import type { User } from "@/drizzle/core/schemas/users";
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
	userId: User["id"];
	cycleId: CyclesSelect["id"];
	startDate: CyclesSelect["startDate"];
	tx?: DrizzleTransaction;
}

type CreateWorkoutsResponse = Promise<
	Response<Pick<WorkoutsSelect, "id" | "primaryLift">[]>
>;

export async function createWorkouts({
	userId,
	cycleId,
	startDate,
	tx,
}: CreateWorkoutsParams): CreateWorkoutsResponse {
	const queryRunner = tx || db;

	const workoutValues = Array.from({ length: 16 }).map((_, index) => {
		const workoutDate = new Date(startDate);
		workoutDate.setDate(startDate.getDate() + index * 2);

		return workoutsInsertSchema.parse({
			userId,
			cycleId,
			date: workoutDate,
			primaryLift: PrimaryLift.options[index % PrimaryLift.options.length],
			status: Status.Enum.pending,
			sequence: index + 1,
		});
	});

	const createdWorkouts = await queryRunner
		.insert(workouts)
		.values(workoutValues)
		.returning();

	return {
		success: true,
		data: createdWorkouts.map((workout) =>
			workoutsSelectSchema.pick({ id: true, primaryLift: true }).parse(workout),
		),
	};
}
