"use server";

import { db } from "@/lib/drizzle/db";
import { getPrimaryExerciseDefinitions } from "@/lib/drizzle/exerciseDefinitions/getPrimaryExerciseDefinitions";
import {
	PrimaryLift,
	oneRepMaxes,
} from "@/lib/drizzle/schemas/strength-training";
import { eq } from "drizzle-orm";

export async function hasAllMainLifts(userId: string): Promise<boolean> {
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
