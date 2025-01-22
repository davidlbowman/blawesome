"use server";

import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import { exercises } from "@/drizzle/modules/strength-training/schemas/exercises";
import { sets } from "@/drizzle/modules/strength-training/schemas/sets";
import {
	type WorkoutsSelect,
	workouts,
} from "@/drizzle/modules/strength-training/schemas/workouts";
import { Status } from "@/drizzle/modules/strength-training/types";
import { eq } from "drizzle-orm";

interface StartWorkoutProps {
	workoutId: Pick<WorkoutsSelect, "id">;
}

type StartWorkoutResponse = Promise<Response<void>>;

export async function startWorkout({
	workoutId,
}: StartWorkoutProps): StartWorkoutResponse {
	try {
		await db.transaction(async (tx) => {
			const [firstExerciseAndSet] = await tx
				.select({
					exerciseId: exercises.id,
					firstSetId: sets.id,
				})
				.from(exercises)
				.leftJoin(sets, eq(sets.exerciseId, exercises.id))
				.where(eq(exercises.workoutId, workoutId.id))
				.orderBy(exercises.order, sets.setNumber)
				.limit(1);

			if (!firstExerciseAndSet || !firstExerciseAndSet.firstSetId) {
				return {
					success: false,
					error: new Error("No exercise and set found"),
				};
			}

			const updateData = {
				status: Status.Enum.in_progress,
				updatedAt: new Date(),
			};

			await Promise.all([
				tx
					.update(workouts)
					.set(updateData)
					.where(eq(workouts.id, workoutId.id)),

				tx
					.update(exercises)
					.set(updateData)
					.where(eq(exercises.id, firstExerciseAndSet.exerciseId)),

				tx
					.update(sets)
					.set(updateData)
					.where(eq(sets.id, firstExerciseAndSet.firstSetId)),
			]);
		});

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error : new Error("Failed to start workout"),
		};
	}
}
