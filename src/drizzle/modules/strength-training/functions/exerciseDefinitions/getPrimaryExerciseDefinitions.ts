"use server";

import { db } from "@/drizzle/db";
import {
	type ExerciseDefinitionsSelect,
	exerciseDefinitions,
	exerciseDefinitionsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { ExerciseType } from "@/drizzle/modules/strength-training/types";
import { eq } from "drizzle-orm";

export async function getPrimaryExerciseDefinitions(): Promise<
	ExerciseDefinitionsSelect[]
> {
	const results = await db
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
		.where(eq(exerciseDefinitions.type, ExerciseType.Enum.primary));

	return results.map((result) => exerciseDefinitionsSelectSchema.parse(result));
}
