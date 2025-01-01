import { db } from "@/lib/drizzle/db";
import { cycles, exercises, sets, workouts } from "./strength-training";

async function main() {
	try {
		await db.transaction(async (tx) => {
			console.log("Starting data cleanup...");

			console.log("Deleting sets...");
			await tx.delete(sets);

			console.log("Deleting exercises...");
			await tx.delete(exercises);

			console.log("Deleting workouts...");
			await tx.delete(workouts);

			console.log("Deleting cycles...");
			await tx.delete(cycles);
		});

		console.log(
			"Successfully cleared all workout data while preserving users, exercise definitions, and 1RMs",
		);
	} catch (error) {
		console.error("Error clearing data:", error);
		process.exit(1);
	}
	process.exit(0);
}

main();
