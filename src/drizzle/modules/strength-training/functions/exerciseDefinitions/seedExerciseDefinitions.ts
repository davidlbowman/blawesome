"use server";

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
import type { InferInsertModel } from "drizzle-orm";

export async function seedExerciseDefinitions() {
	try {
		// Prepare insert values outside transaction
		const insertValues: InferInsertModel<typeof exerciseDefinitions>[] = [
			...defaultExerciseDefinitions,
		];

		const result = await db.transaction(async (tx) => {
			// First level: delete sets
			await tx.delete(sets);

			// Second level: delete tables that depend on workouts
			await Promise.all([tx.delete(exercises), tx.delete(workouts)]);

			// Third level: delete independent tables
			await Promise.all([
				tx.delete(cycles),
				tx.delete(oneRepMaxes),
				tx.delete(exerciseDefinitions),
			]);

			// Insert new exercise definitions
			const inserted = await tx
				.insert(exerciseDefinitions)
				.values(insertValues)
				.returning({
					id: exerciseDefinitions.id,
					name: exerciseDefinitions.name,
					type: exerciseDefinitions.type,
					category: exerciseDefinitions.category,
					primaryLiftDay: exerciseDefinitions.primaryLiftDay,
					rpeMax: exerciseDefinitions.rpeMax,
					repMax: exerciseDefinitions.repMax,
					createdAt: exerciseDefinitions.createdAt,
					updatedAt: exerciseDefinitions.updatedAt,
				});

			return {
				success: true,
				inserted: inserted.length,
				exercises: inserted,
			};
		});

		return result;
	} catch (error) {
		console.error("Failed to seed exercise definitions:", error);
		return {
			success: false,
			error: "Failed to seed exercise definitions",
			details: error,
		};
	}
}

// Only run this if you need to seed the database
// if (require.main === module) {
// 	seedExerciseDefinitions()
// 		.then((result) => {
// 			console.log("Exercise definitions seeded:", result);
// 			process.exit(result.success ? 0 : 1);
// 		})
// 		.catch((error) => {
// 			console.error("Error:", error);
// 			process.exit(1);
// 		});
// }
