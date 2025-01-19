import { db } from "@/drizzle/db";

import { cycles } from "@/drizzle/modules/strength-training/schemas/cycles";
import { exerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { exercises } from "@/drizzle/modules/strength-training/schemas/exercises";
import { oneRepMaxes } from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import { sets } from "@/drizzle/modules/strength-training/schemas/sets";
import { workouts } from "@/drizzle/modules/strength-training/schemas/workouts";
import { DefaultExerciseDefinitions } from "@/drizzle/modules/strength-training/types";

async function clearAllData() {
	await db.transaction(async (tx) => {
		await tx.delete(sets);
		await tx.delete(exercises);
		await tx.delete(workouts);
		await tx.delete(cycles);
		await tx.delete(oneRepMaxes);
	});
}

export const exercisesList = Array.from(
	DefaultExerciseDefinitions.entries(),
).flatMap(([primaryLift, exercises]) =>
	exercises.map((exercise) => ({
		...exercise,
		primaryLiftDay: primaryLift,
		createdAt: new Date(),
		updatedAt: new Date(),
	})),
);

async function main() {
	try {
		await clearAllData();
		await db.delete(exerciseDefinitions);
		await db.insert(exerciseDefinitions).values(exercisesList);
	} catch (error) {
		console.error("Error seeding exercise definitions:", error);
		process.exit(1);
	}
	process.exit(0);
}

main();
