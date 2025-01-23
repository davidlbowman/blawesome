"use server";

import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import { eq, inArray } from "drizzle-orm";
import { type ExercisesSelect, exercises } from "../../schemas/exercises";
import { type SetsSelect, sets } from "../../schemas/sets";
import { type WorkoutsSelect, workouts } from "../../schemas/workouts";
import { Status } from "../../types";

interface UpdateSetsAndCascadeParams {
	setIds: Pick<SetsSelect, "id">[];
	exerciseId: Pick<ExercisesSelect, "id">[];
	workoutId?: Pick<WorkoutsSelect, "id">;
}

type UpdateSetsAndCascadeResponse = Promise<Response<void>>;

export async function updateSetsAndCascade({
	setIds,
	exerciseId,
	workoutId,
}: UpdateSetsAndCascadeParams): UpdateSetsAndCascadeResponse {
	const now = new Date();

	try {
		await db.transaction(async (tx) => {
			await tx
				.update(sets)
				.set({
					status: Status.Enum.skipped,
					updatedAt: now,
					completedAt: now,
				})
				.where(
					inArray(
						sets.id,
						setIds.map((set) => set.id),
					),
				);

			await tx
				.update(exercises)
				.set({
					status: Status.Enum.completed,
					updatedAt: now,
					completedAt: now,
				})
				.where(
					inArray(
						exercises.id,
						exerciseId.map((exercise) => exercise.id),
					),
				);

			workoutId &&
				(await tx
					.update(workouts)
					.set({
						status: Status.Enum.completed,
						updatedAt: now,
						completedAt: now,
					})
					.where(eq(workouts.id, workoutId.id)));
		});

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error
					: new Error("Failed to update sets and cascade"),
		};
	}
}
