"use server";

import { db } from "@/lib/drizzle/db";
import {
	cycles,
	exercises,
	sets,
	workouts,
} from "@/lib/drizzle/schemas/strength-training";

export async function clearWorkoutData() {
	await db.transaction(async (tx) => {
		// Delete in order of dependencies
		// 1. First delete sets as they depend on exercises
		await tx.delete(sets);

		// 2. Delete exercises as they depend on workouts
		await tx.delete(exercises);

		// 3. Delete workouts as they depend on cycles
		await tx.delete(workouts);

		// 4. Finally delete cycles
		await tx.delete(cycles);
	});

	console.log(
		"Successfully cleared all workout data while preserving users, exercise definitions, and 1RMs",
	);
}

// Example usage in a route handler:
// import { clearWorkoutData } from "@/lib/drizzle/scripts/clearWorkoutData";
// await clearWorkoutData();
