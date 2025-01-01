"use server";

import { db } from "@/lib/drizzle/db";
import {
	ExerciseType,
	PrimaryLift,
	exerciseDefinitions,
} from "@/lib/drizzle/schemas/strength-training";

export async function seedExerciseDefinitions() {
	// Check if exercises already exist
	const existingExercises = await db
		.select({
			id: exerciseDefinitions.id,
			name: exerciseDefinitions.name,
			type: exerciseDefinitions.type,
		})
		.from(exerciseDefinitions);

	console.log(`Found ${existingExercises.length} existing exercises`);
	if (existingExercises.length > 0) {
		console.log("Existing exercises:", existingExercises);
	}

	const exercises = [
		// Primary Lifts
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

		// Squat Variations
		{
			name: "Pause Squat",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Front Squat",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Box Squats",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Squat,
		},

		// Bench Press Variations
		{
			name: "Incline Barbell Bench Press",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Decline Barbell Bench Press",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Flat Dumbbell Press",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Bench,
		},

		// Deadlift Variations
		{
			name: "Romanian Deadlift",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Straight Leg Deadlift",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Deficit Deadlift",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Rack Pull",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Sumo Deadlift",
			type: ExerciseType.Variation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},

		// Compound Leg Exercises
		{
			name: "Bulgarian Split Squats",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Lunges",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Leg Press",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Hack Squats",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Squat,
		},

		// Isolation Exercises
		{
			name: "Leg Extensions",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Leg Curls",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Calf Raises (Seated)",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Calf Raises (Standing)",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Squat,
		},

		// Chest Accessories
		{
			name: "Incline Dumbbell Press",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Decline Dumbbell Press",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Machine Chest Press",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Chest Flies",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Bench,
		},

		// Tricep Accessories
		{
			name: "Overhead Extension (French Press)",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Skullcrushers",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Tricep Pushdown",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Bench,
		},

		// Pull Accessories
		{
			name: "Pull-Ups",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Lat Pulldowns",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Face Pulls (Back)",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Bent-over Rows",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Cable Rows",
			type: ExerciseType.Compound,
			primaryLiftDay: PrimaryLift.Deadlift,
		},

		// Bicep Accessories
		{
			name: "Barbell Curls",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Hammer Curls",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Preacher Curls",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Concentration Curls",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},

		// Shoulder Accessories
		{
			name: "Front Delt Raise",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Overhead,
		},
		{
			name: "Side Delt Raise",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Overhead,
		},
		{
			name: "Rear Delt Raise",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Overhead,
		},
		{
			name: "Face Pulls (Shoulders)",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Overhead,
		},
		{
			name: "Shrugs",
			type: ExerciseType.Isolation,
			primaryLiftDay: PrimaryLift.Overhead,
		},
	] as const;

	console.log(`Attempting to seed ${exercises.length} exercises`);

	try {
		const result = await db.transaction(async (tx) => {
			return await tx
				.insert(exerciseDefinitions)
				.values([...exercises])
				.onConflictDoNothing()
				.returning({
					id: exerciseDefinitions.id,
					name: exerciseDefinitions.name,
					type: exerciseDefinitions.type,
				});
		});

		console.log(`Successfully inserted ${result.length} new exercises:`);
		console.log(JSON.stringify(result, null, 2));

		return {
			success: true,
			inserted: result.length,
			exercises: result,
		};
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
// seedExerciseDefinitions()
// 	.then((result) => {
// 		console.log("Exercise definitions seeded:", result);
// 	})
// 	.catch(console.error);
