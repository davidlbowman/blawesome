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
			repMin: null,
			repMax: null,
			rpeMin: null,
			rpeMax: null,
		},
		{
			name: "Bench Press",
			type: ExerciseType.Primary,
			category: ExerciseCategory.MainLift,
			primaryLiftDay: PrimaryLift.Bench,
			repMin: null,
			repMax: null,
			rpeMin: null,
			rpeMax: null,
		},
		{
			name: "Deadlift",
			type: ExerciseType.Primary,
			category: ExerciseCategory.MainLift,
			primaryLiftDay: PrimaryLift.Deadlift,
			repMin: null,
			repMax: null,
			rpeMin: null,
			rpeMax: null,
		},
		{
			name: "Overhead Press",
			type: ExerciseType.Primary,
			category: ExerciseCategory.MainLift,
			primaryLiftDay: PrimaryLift.Overhead,
			repMin: null,
			repMax: null,
			rpeMin: null,
			rpeMax: null,
		},

		// Squat Variations
		{
			name: "Pause Squat",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 7,
			repMin: 6,
			repMax: 10,
		},
		{
			name: "Front Squat",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Box Squats",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},

		// Bench Press Variations
		{
			name: "Incline Bench Press",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Decline Bench Press",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Dumbbell Press",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},

		// Deadlift Variations
		{
			name: "Romanian Deadlift",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Straight Leg Deadlift",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Deficit Deadlift",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Rack Pull",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Sumo Deadlift",
			type: ExerciseType.Variation,
			category: ExerciseCategory.MainLiftVariation,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},

		// Compound Leg Accessories
		{
			name: "Front Squats",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CompoundLeg,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Lunges",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CompoundLeg,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Leg Press",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CompoundLeg,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Hack Squats",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CompoundLeg,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},

		// Leg Isolation Accessories
		{
			name: "Leg Extensions",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.QuadAccessory,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Leg Curls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.HamstringGluteAccessory,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Romanian Deadlifts",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.HamstringGluteAccessory,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Calf Raises (Seated)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CalfAccessory,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Calf Raises (Straight Leg)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.CalfAccessory,
			primaryLiftDay: PrimaryLift.Squat,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},

		// Chest Accessories
		{
			name: "Incline Press (DB/BB/M)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.ChestAccessory,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Decline Press (DB/BB/M)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.ChestAccessory,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Flat Press (DB/M)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.ChestAccessory,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Chest Flies",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.ChestAccessory,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},

		// Tricep Accessories
		{
			name: "Overhead Extension (French)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.TricepAccessory,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Frontal Extension (Skullcrusher)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.TricepAccessory,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Downward Extension (Pushdown)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.TricepAccessory,
			primaryLiftDay: PrimaryLift.Bench,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},

		// Pull Accessories
		{
			name: "Pull-Ups",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.VerticalPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Pulldowns (M/C)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.VerticalPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Face Pulls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.VerticalPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Bent-over Rows (BB/DB)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.LateralPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Rows (C/M)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.LateralPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Face Pulls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.LateralPullAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},

		// Bicep Accessories
		{
			name: "Curls (DB/EZ/C)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Hammer Curls (DB/C)",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Preacher Curls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Concentrated Curls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "High Side Cable Curls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.BicepAccessory,
			primaryLiftDay: PrimaryLift.Deadlift,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},

		// Delt Accessories
		{
			name: "Front Delt Raise",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
			primaryLiftDay: PrimaryLift.Overhead,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Side Delt Raise",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
			primaryLiftDay: PrimaryLift.Overhead,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Rear Delt Raise",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
			primaryLiftDay: PrimaryLift.Overhead,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Trap Shrugs",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
			primaryLiftDay: PrimaryLift.Overhead,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
		},
		{
			name: "Face Pulls",
			type: ExerciseType.Accessory,
			category: ExerciseCategory.DeltAccessory,
			primaryLiftDay: PrimaryLift.Overhead,
			rpeMin: 5,
			rpeMax: 8,
			repMin: 8,
			repMax: 15,
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
seedExerciseDefinitions()
	.then((result) => {
		console.log("Exercise definitions seeded:", result);
	})
	.catch(console.error);
