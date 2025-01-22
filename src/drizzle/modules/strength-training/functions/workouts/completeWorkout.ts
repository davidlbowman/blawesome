"use server";

import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import { workouts } from "@/drizzle/modules/strength-training/schemas/workouts";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { eq } from "drizzle-orm";
import { Status } from "../../types";

interface CompleteWorkoutProps {
	workoutId: Pick<WorkoutsSelect, "id">;
}

type CompleteWorkoutResponse = Promise<Response<void>>;

export async function completeWorkout({
	workoutId,
}: CompleteWorkoutProps): CompleteWorkoutResponse {
	const now = new Date();

	try {
		await db.transaction(async (tx) => {
			await tx
				.update(workouts)
				.set({ status: Status.Enum.completed, updatedAt: now })
				.where(eq(workouts.id, workoutId.id));
		});

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error
					: new Error("Failed to complete workout"),
		};
	}
}
