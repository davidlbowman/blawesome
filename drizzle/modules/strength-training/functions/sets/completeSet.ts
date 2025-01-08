"use server";

import { db } from "@/drizzle/db";
import {
	exerciseDefinitions,
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { and, eq, gt } from "drizzle-orm";

interface SetPerformance {
	weight: number;
	reps?: number;
	rpe?: number;
}

export async function completeSet(
	setId: string,
	exerciseId: string,
	workoutId: string,
	performance: SetPerformance,
) {
	return await db.transaction(async (tx) => {
		// Get current exercise, current set, and next set in one query
		const [result] = await tx
			.select({
				exercise: {
					id: exercises.id,
					status: exercises.status,
					workoutId: exercises.workoutId,
					order: exercises.order,
				},
				definition: {
					id: exerciseDefinitions.id,
					type: exerciseDefinitions.type,
				},
				currentSet: {
					setNumber: sets.setNumber,
				},
			})
			.from(exercises)
			.innerJoin(
				exerciseDefinitions,
				eq(exercises.exerciseDefinitionId, exerciseDefinitions.id),
			)
			.innerJoin(sets, eq(sets.id, setId))
			.where(eq(exercises.id, exerciseId));

		if (!result) return;

		// Get next set in a separate query to avoid complexity
		const [nextSet] = await tx
			.select({
				id: sets.id,
				setNumber: sets.setNumber,
			})
			.from(sets)
			.where(
				and(
					eq(sets.exerciseId, exerciseId),
					gt(sets.setNumber, result.currentSet.setNumber),
				),
			)
			.orderBy(sets.setNumber)
			.limit(1);

		// Update current set
		await tx
			.update(sets)
			.set({
				weight: performance.weight,
				reps: performance.reps,
				status: "completed",
				updatedAt: new Date(),
				completedAt: new Date(),
			})
			.where(eq(sets.id, setId));

		// If there's a next set, mark it as in progress
		if (nextSet?.id) {
			await tx
				.update(sets)
				.set({
					status: "in_progress",
					updatedAt: new Date(),
				})
				.where(eq(sets.id, nextSet.id));
			return;
		}

		// No more sets, complete the exercise
		await tx
			.update(exercises)
			.set({
				status: "completed",
				completedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(exercises.id, exerciseId));

		// Get next exercise if any
		const [nextExercise] = await tx
			.select({
				id: exercises.id,
				firstSetId: sets.id,
			})
			.from(exercises)
			.leftJoin(sets, eq(sets.exerciseId, exercises.id))
			.where(
				and(
					eq(exercises.workoutId, result.exercise.workoutId),
					gt(exercises.order, result.exercise.order),
				),
			)
			.orderBy(exercises.order, sets.setNumber)
			.limit(1);

		if (nextExercise?.id) {
			await tx
				.update(exercises)
				.set({
					status: "in_progress",
					updatedAt: new Date(),
				})
				.where(eq(exercises.id, nextExercise.id));

			if (nextExercise.firstSetId) {
				await tx
					.update(sets)
					.set({
						status: "in_progress",
						updatedAt: new Date(),
					})
					.where(eq(sets.id, nextExercise.firstSetId));
			}
			return;
		}

		// No more exercises, complete workout
		await tx
			.update(workouts)
			.set({
				status: "completed",
				completedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(workouts.id, workoutId));
	});
}
