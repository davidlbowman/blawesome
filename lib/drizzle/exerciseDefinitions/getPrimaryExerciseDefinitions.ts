"use server";

import { db } from "@/lib/drizzle/db";
import {
	type ExerciseDefinitionsSelect,
	ExerciseType,
	exerciseDefinitions,
} from "@/lib/drizzle/schemas/strength-training";
import { eq } from "drizzle-orm";

export async function getPrimaryExerciseDefinitions(): Promise<
	ExerciseDefinitionsSelect[]
> {
	const primaryExercises = await db
		.select()
		.from(exerciseDefinitions)
		.where(eq(exerciseDefinitions.type, ExerciseType.Primary));

	const json = JSON.parse(JSON.stringify(primaryExercises));

	return primaryExercises;
}
