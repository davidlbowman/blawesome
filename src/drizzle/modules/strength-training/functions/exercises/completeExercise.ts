"use server";

import type { Response } from "@/drizzle/core/types";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import {
	type ExercisesSelect,
	exercises,
} from "@/drizzle/modules/strength-training/schemas/exercises";
import { eq } from "drizzle-orm";
import { Status } from "../../types";

interface CompleteExerciseProps {
	exerciseId: Pick<ExercisesSelect, "id">;
	tx?: DrizzleTransaction;
}

type CompleteExerciseResponse = Promise<Response<void>>;

export async function completeExercise({
	exerciseId,
	tx,
}: CompleteExerciseProps): CompleteExerciseResponse {
	try {
		const queryRunner = tx || db;

		await queryRunner
			.update(exercises)
			.set({ status: Status.Enum.completed })
			.where(eq(exercises.id, exerciseId.id));

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error
					: new Error("Failed to complete exercise"),
		};
	}
}
