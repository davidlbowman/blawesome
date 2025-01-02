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
		console.log("Clearing existing data...");
		// Delete in order of dependencies
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
		// First clear all data to avoid foreign key constraints
		await clearAllData();
		console.log("Successfully cleared all data");

		// Then clear and seed exercise definitions
		console.log("Starting to seed exercise definitions...");
		await db.delete(exerciseDefinitions);
		console.log("Cleared existing exercise definitions");

		await db.insert(exerciseDefinitions).values(exercisesList);
		console.log("Successfully seeded exercise definitions");
	} catch (error) {
		console.error("Error seeding exercise definitions:", error);
		process.exit(1);
	}
	process.exit(0);
}

main();
