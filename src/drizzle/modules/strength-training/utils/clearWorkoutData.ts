import { db } from "@/drizzle/db";
import { cycles } from "@/drizzle/modules/strength-training/schemas/cycles";
import { exercises } from "@/drizzle/modules/strength-training/schemas/exercises";
import { sets } from "@/drizzle/modules/strength-training/schemas/sets";
import { workouts } from "@/drizzle/modules/strength-training/schemas/workouts";

export async function clearWorkoutData() {
	try {
		await db.transaction(async (tx) => {
			await tx.delete(sets);
			await tx.delete(exercises);
			await tx.delete(workouts);
			await tx.delete(cycles);
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
