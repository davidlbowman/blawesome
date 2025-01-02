import { db } from "@/drizzle/db";
import {
	cycles,
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";

export async function clearWorkoutData() {
	try {
		await db.transaction(async (tx) => {
			console.log("Starting data cleanup...");

			// Delete in proper order for referential integrity
			// 1. First delete all sets as they reference exercises
			await tx.delete(sets);
			console.log("✓ Cleared sets");

			// 2. Then delete exercises as they reference workouts
			await tx.delete(exercises);
			console.log("✓ Cleared exercises");

			// 3. Then delete workouts as they reference cycles
			await tx.delete(workouts);
			console.log("✓ Cleared workouts");

			// 4. Finally delete cycles
			await tx.delete(cycles);
			console.log("✓ Cleared cycles");

			console.log(
				"Successfully cleared all workout data while preserving users, exercise definitions, and 1RMs",
			);
		});

		return { success: true };
	} catch (error) {
		console.error("Error clearing data:", error);
		return {
			success: false,
			error: "Failed to clear workout data",
			details: error,
		};
	}
}

// Only run this if you need to clear workout data
if (require.main === module) {
	clearWorkoutData()
		.then((result) => {
			console.log("Workout data cleared:", result);
			process.exit(result.success ? 0 : 1);
		})
		.catch((error) => {
			console.error("Error:", error);
			process.exit(1);
		});
}
