"use server";

import { db } from "@/drizzle/db";
import { getPrimaryExerciseDefinitions } from "@/drizzle/modules/strength-training/functions/exerciseDefinitions/getPrimaryExerciseDefinitions";
import { oneRepMaxes } from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import { PrimaryLift } from "@/drizzle/modules/strength-training/types";
import { eq } from "drizzle-orm";

export async function hasAllMain1RepMaxes(userId: string): Promise<boolean> {
	const allExerciseDefinitions = await getPrimaryExerciseDefinitions();

	const mainLifts = allExerciseDefinitions.filter((def) =>
		Object.values(PrimaryLift).includes(def.primaryLiftDay),
	);

	const lifts = await db
		.select()
		.from(oneRepMaxes)
		.where(eq(oneRepMaxes.userId, userId));

	return mainLifts.every((def) =>
		lifts.some((lift) => lift.exerciseDefinitionId === def.id),
	);
}
