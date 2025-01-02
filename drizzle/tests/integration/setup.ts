import { createRootUser } from "@/drizzle/core/functions/users/createRootUser";
import { users } from "@/drizzle/core/schemas/users";
import { db } from "@/drizzle/db";
import { createCycle } from "@/drizzle/modules/strength-training/functions/cycles/createCycle";
import {
	cycles,
	exerciseDefinitions,
	exercises,
	oneRepMaxes,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { defaultExerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { eq } from "drizzle-orm";

async function truncateAllTables() {
	console.log("🗑️  Truncating all tables...");
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
	console.log("✅ All tables truncated");
}

async function seedExerciseDefinitions() {
	console.log("🌱 Seeding exercise definitions...");
	await db.insert(exerciseDefinitions).values([...defaultExerciseDefinitions]);
	console.log("✅ Exercise definitions seeded");
}

async function getRootUserId() {
	const rootEmail = process.env.ROOT_USER;
	if (!rootEmail) {
		throw new Error("ROOT_USER environment variable is not set");
	}

	const rootUser = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, rootEmail))
		.get();

	if (!rootUser) {
		throw new Error("Root user not found");
	}

	return rootUser.id;
}

async function main() {
	try {
		await truncateAllTables();

		console.log("👤 Creating root user...");
		const rootUserResult = await createRootUser();
		if (!rootUserResult.success) {
			throw new Error(`Failed to create root user: ${rootUserResult.error}`);
		}
		console.log("✅ Root user created");

		await seedExerciseDefinitions();

		console.log("🏋️ Creating initial training cycle...");
		const rootUserId = await getRootUserId();
		const cycle = await createCycle(rootUserId);
		console.log("✅ Training cycle created:", cycle.id);

		console.log("🎉 Setup completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Setup failed:", error);
		process.exit(1);
	}
}

main();
