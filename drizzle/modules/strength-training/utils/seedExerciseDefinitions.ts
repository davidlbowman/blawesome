import { db } from "@/drizzle/db";
import {
	cycles,
	exerciseDefinitions,
	exercises,
	oneRepMaxes,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { defaultExerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";

async function clearAllData() {
	await db.transaction(async (tx) => {
		await tx.delete(sets);
		await tx.delete(exercises);
		await tx.delete(workouts);
		await tx.delete(cycles);
		await tx.delete(oneRepMaxes);
	});
}

// Use the imported exercise definitions instead of maintaining a duplicate list
export const exercisesList = [...defaultExerciseDefinitions];

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
