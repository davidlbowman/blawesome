import { createRootUser } from "@/drizzle/core/functions/users/createRootUser";
import { users } from "@/drizzle/core/schemas/users";
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

async function truncateAllTables() {
	await db.transaction(async (tx) => {
		// Delete in order of dependencies
		await tx.delete(sets);
		await tx.delete(exercises);
		await tx.delete(workouts);
		await tx.delete(cycles);
		await tx.delete(oneRepMaxes);
		await tx.delete(exerciseDefinitions);
		await tx.delete(users);
	});
}

async function seedExerciseDefinitions() {
	await db.insert(exerciseDefinitions).values([...defaultExerciseDefinitions]);
}

async function main() {
	try {
		await truncateAllTables();
		const rootUserResult = await createRootUser();

		if (!rootUserResult.success) {
			throw new Error(`❌ Failed to create root user: ${rootUserResult.error}`);
		}

		await seedExerciseDefinitions();

		process.exit(0);
	} catch (error) {
		console.error("❌ Setup failed:", error);
		process.exit(1);
	}
}

main();
