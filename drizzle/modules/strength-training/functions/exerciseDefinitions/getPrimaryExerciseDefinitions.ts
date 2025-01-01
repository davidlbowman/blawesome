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
	const primaryExercises = await db
		.select()
		.from(exerciseDefinitions)
		.where(eq(exerciseDefinitions.type, ExerciseType.Primary));

	return primaryExercises;
}
