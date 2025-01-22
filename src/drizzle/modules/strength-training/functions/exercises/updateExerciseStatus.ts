import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { type ExercisesSelect, exercises } from "../../schemas/exercises";

interface UpdateExerciseStatusParams {
	exercise: Pick<ExercisesSelect, "id" | "status">;
}

type UpdateExerciseStatusResponse = Promise<Response<void>>;

export async function updateExerciseStatus({
	exercise,
}: UpdateExerciseStatusParams): UpdateExerciseStatusResponse {
	try {
		await db
			.update(exercises)
			.set({ status: exercise.status })
			.where(eq(exercises.id, exercise.id));

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error
					: new Error("Failed to update exercise status"),
		};
	}
}
