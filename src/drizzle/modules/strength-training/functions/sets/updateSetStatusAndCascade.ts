"use server";

import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { type ExercisesSelect, exercises } from "../../schemas/exercises";
import { sets } from "../../schemas/sets";
import type { SetsSelect } from "../../schemas/sets";
import { type WorkoutsSelect, workouts } from "../../schemas/workouts";

interface UpdateSetStatusAndCascadeParams {
	setId: Pick<SetsSelect, "id" | "status">;
	exerciseId: Pick<ExercisesSelect, "id" | "status">;
	workoutId: Pick<WorkoutsSelect, "id" | "status">;
	isLastSetInExercise: boolean;
	isLastSetInWorkout: boolean;
}

type UpdateSetStatusAndCascadeResponse = Promise<Response<void>>;

export async function updateSetStatusAndCascade({
	setId,
	exerciseId,
	workoutId,
	isLastSetInExercise,
	isLastSetInWorkout,
}: UpdateSetStatusAndCascadeParams): UpdateSetStatusAndCascadeResponse {
	const now = new Date();

	try {
		await db.transaction(async (tx) => {
			await tx
				.update(sets)
				.set({
					status: setId.status,
					updatedAt: now,
					completedAt: now,
				})
				.where(eq(sets.id, setId.id));

			if (isLastSetInExercise) {
				await tx
					.update(exercises)
					.set({
						status: exerciseId.status,
						updatedAt: now,
						completedAt: now,
					})
					.where(eq(exercises.id, exerciseId.id));
			}

			if (isLastSetInWorkout) {
				await tx
					.update(workouts)
					.set({
						status: workoutId.status,
						updatedAt: now,
						completedAt: now,
					})
					.where(eq(workouts.id, workoutId.id));
			}
		});

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error : new Error("Failed to handle next set"),
		};
	}
}
