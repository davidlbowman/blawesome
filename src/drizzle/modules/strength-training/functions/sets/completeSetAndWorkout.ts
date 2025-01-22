"use server";

import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { type ExercisesSelect, exercises } from "../../schemas/exercises";
import { sets } from "../../schemas/sets";
import type { SetsSelect } from "../../schemas/sets";
import { Status } from "../../types";

interface CompleteSetAndWorkoutProps {
	setId: Pick<SetsSelect, "id">;
	exerciseId: Pick<ExercisesSelect, "id">;
}

type CompleteSetAndWorkoutResponse = Promise<Response<void>>;

export async function completeSetAndWorkout({
	setId,
	exerciseId,
}: CompleteSetAndWorkoutProps): CompleteSetAndWorkoutResponse {
	try {
		await db.transaction(async (tx) => {
			await tx
				.update(sets)
				.set({ status: Status.Enum.completed })
				.where(eq(sets.id, setId.id));

			await tx
				.update(exercises)
				.set({ status: Status.Enum.completed })
				.where(eq(exercises.id, exerciseId.id));
		});

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error
					: new Error("Failed to complete set and workout"),
		};
	}
}
