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
		await db.insert(exerciseDefinitions).values(primaryLifts);
		console.log("New exercises added");
	} catch (error) {
		console.log("Some exercises might already exist");
	}
}

seedExerciseDefinitions();
