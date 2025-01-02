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
			// We can batch deletes that don't depend on each other
			await tx.delete(sets);
			await Promise.all([tx.delete(exercises), tx.delete(workouts)]);
			await tx.delete(cycles);

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
