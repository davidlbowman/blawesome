"use server";

import { db } from "@/lib/drizzle/db";
import {
	ExerciseCategory,
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
			category: exerciseDefinitions.category,
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
			category: ExerciseCategory.MainLift,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Bench Press",
			type: ExerciseType.Primary,
			category: ExerciseCategory.MainLift,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Deadlift",
			type: ExerciseType.Primary,
			category: ExerciseCategory.MainLift,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Overhead Press",
			type: ExerciseType.Primary,
			category: ExerciseCategory.MainLift,
			primaryLiftDay: PrimaryLift.Overhead,
		},

		// Squat Variations
		{
			name: "Pause Squat",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Front Squat",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Box Squats",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Squat,
		},

		// Bench Press Variations
		{
			name: "Incline Bench Press",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Decline Bench Press",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Dumbbell Press",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Bench,
		},

		// Deadlift Variations
		{
			name: "Romanian Deadlift",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Straight Leg Deadlift",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Deficit Deadlift",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Rack Pull",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Sumo Deadlift",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
		},

		// Compound Leg Accessories
		{
			name: "Front Squats",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CompoundLeg,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Lunges",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CompoundLeg,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Leg Press",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CompoundLeg,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Hack Squats",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CompoundLeg,
			primaryLiftDay: PrimaryLift.Squat,
		},

		// Leg Isolation Accessories
		{
			name: "Leg Extensions",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.QuadAccessory,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Leg Curls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.HamstringGluteAccessory,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Romanian Deadlifts",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.HamstringGluteAccessory,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Calf Raises (Seated)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CalfAccessory,
			primaryLiftDay: PrimaryLift.Squat,
		},
		{
			name: "Calf Raises (Straight Leg)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CalfAccessory,
			primaryLiftDay: PrimaryLift.Squat,
		},

		// Chest Accessories
		{
			name: "Incline Press (DB/BB/M)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.ChestAccessory,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Decline Press (DB/BB/M)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.ChestAccessory,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Flat Press (DB/M)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.ChestAccessory,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Chest Flies",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.ChestAccessory,
			primaryLiftDay: PrimaryLift.Bench,
		},

		// Tricep Accessories
		{
			name: "Overhead Extension (French)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.TricepAccessory,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Frontal Extension (Skullcrusher)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.TricepAccessory,
			primaryLiftDay: PrimaryLift.Bench,
		},
		{
			name: "Downward Extension (Pushdown)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.TricepAccessory,
			primaryLiftDay: PrimaryLift.Bench,
		},

		// Pull Accessories
		{
			name: "Pull-Ups",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.VerticalPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Pulldowns (M/C)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.VerticalPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Face Pulls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.VerticalPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Bent-over Rows (BB/DB)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.LateralPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Rows (C/M)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.LateralPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Face Pulls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.LateralPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},

		// Bicep Accessories
		{
			name: "Curls (DB/EZ/C)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Hammer Curls (DB/C)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Preacher Curls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "Concentrated Curls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},
		{
			name: "High Side Cable Curls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
		},

		// Delt Accessories
		{
			name: "Front Delt Raise",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
			primaryLiftDay: PrimaryLift.Overhead,
		},
		{
			name: "Side Delt Raise",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
			primaryLiftDay: PrimaryLift.Overhead,
		},
		{
			name: "Rear Delt Raise",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
			primaryLiftDay: PrimaryLift.Overhead,
		},
		{
			name: "Trap Shrugs",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
			primaryLiftDay: PrimaryLift.Overhead,
		},
		{
			name: "Face Pulls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
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
					category: exerciseDefinitions.category,
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
