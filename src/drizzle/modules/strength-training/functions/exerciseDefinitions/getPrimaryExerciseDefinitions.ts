"use server";

import { db } from "@/drizzle/db";
import {
	type ExerciseDefinitionsSelect,
	ExerciseType,
	exerciseDefinitions,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

export async function getPrimaryExerciseDefinitions(): Promise<
	ExerciseDefinitionsSelect[]
> {
	return await db
		.select({
			id: exerciseDefinitions.id,
			name: exerciseDefinitions.name,
			type: exerciseDefinitions.type,
			category: exerciseDefinitions.category,
			primaryLiftDay: exerciseDefinitions.primaryLiftDay,
			repMax: exerciseDefinitions.repMax,
			rpeMax: exerciseDefinitions.rpeMax,
			createdAt: exerciseDefinitions.createdAt,
			updatedAt: exerciseDefinitions.updatedAt,
		})
		.from(exerciseDefinitions)
		.where(eq(exerciseDefinitions.type, ExerciseType.Primary));
}
