"use server";

import { db } from "@/lib/drizzle/db";
import {
	type ExerciseDefinitionsInsert,
	ExerciseType,
	PrimaryLift,
	exerciseDefinitions,
} from "@/lib/drizzle/schemas/strength-training";

export async function seedExerciseDefinitions() {
	const primaryLifts: ExerciseDefinitionsInsert[] = [
		{
			name: "Squat",
			type: ExerciseType.Primary,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Bench Press",
			type: ExerciseType.Primary,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Deadlift",
			type: ExerciseType.Primary,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Overhead Press",
			type: ExerciseType.Primary,
			primaryLiftDay: PrimaryLift.Overhead,
		},
	];

	try {
		const result = await db.insert(exerciseDefinitions).values(primaryLifts);
		return result;
	} catch (error) {
		console.error("Failed to seed exercise definitions:", error);

		return {
			success: false,
			error: "Failed to seed exercise definitions",
		};
	}
}

seedExerciseDefinitions()
	.then((result) => {
		console.log("Exercise definitions seeded:", result);
	})
	.catch(console.error);
