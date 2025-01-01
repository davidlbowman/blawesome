import { db } from "@/lib/drizzle/db";
import { exerciseDefinitions } from "./strength-training";
import {
	ExerciseCategory,
	ExerciseType,
	PrimaryLift,
} from "./strength-training";

const exercises = [
	// Squat Day
	{
		name: "Squat",
		type: ExerciseType.Primary,
		category: ExerciseCategory.MainLift,
		primaryLiftDay: PrimaryLift.Squat,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 1,
		repMax: 5,
	},
	{
		name: "Front Squat",
		type: ExerciseType.Variation,
		category: ExerciseCategory.MainLiftVariation,
		primaryLiftDay: PrimaryLift.Squat,
		rpeMin: 7,
		rpeMax: 8,
		repMin: 3,
		repMax: 8,
	},
	{
		name: "Bulgarian Split Squat",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.CompoundLeg,
		primaryLiftDay: PrimaryLift.Squat,
		rpeMin: 7,
		rpeMax: 8,
		repMin: 8,
		repMax: 12,
	},
	{
		name: "Leg Extension",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.QuadAccessory,
		primaryLiftDay: PrimaryLift.Squat,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 10,
		repMax: 15,
	},
	{
		name: "Romanian Deadlift",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.HamstringGluteAccessory,
		primaryLiftDay: PrimaryLift.Squat,
		rpeMin: 7,
		rpeMax: 8,
		repMin: 8,
		repMax: 12,
	},
	{
		name: "Standing Calf Raise",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.CalfAccessory,
		primaryLiftDay: PrimaryLift.Squat,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 12,
		repMax: 15,
	},

	// Bench Day
	{
		name: "Bench Press",
		type: ExerciseType.Primary,
		category: ExerciseCategory.MainLift,
		primaryLiftDay: PrimaryLift.Bench,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 1,
		repMax: 5,
	},
	{
		name: "Close Grip Bench Press",
		type: ExerciseType.Variation,
		category: ExerciseCategory.MainLiftVariation,
		primaryLiftDay: PrimaryLift.Bench,
		rpeMin: 7,
		rpeMax: 8,
		repMin: 3,
		repMax: 8,
	},
	{
		name: "Incline Dumbbell Press",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.ChestAccessory,
		primaryLiftDay: PrimaryLift.Bench,
		rpeMin: 7,
		rpeMax: 8,
		repMin: 8,
		repMax: 12,
	},
	{
		name: "Dumbbell Flyes",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.ChestAccessory,
		primaryLiftDay: PrimaryLift.Bench,
		rpeMin: 7,
		rpeMax: 8,
		repMin: 10,
		repMax: 15,
	},
	{
		name: "Tricep Pushdown",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.TricepAccessory,
		primaryLiftDay: PrimaryLift.Bench,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 10,
		repMax: 15,
	},
	{
		name: "Overhead Tricep Extension",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.TricepAccessory,
		primaryLiftDay: PrimaryLift.Bench,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 10,
		repMax: 15,
	},

	// Deadlift Day
	{
		name: "Deadlift",
		type: ExerciseType.Primary,
		category: ExerciseCategory.MainLift,
		primaryLiftDay: PrimaryLift.Deadlift,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 1,
		repMax: 5,
	},
	{
		name: "Deficit Deadlift",
		type: ExerciseType.Variation,
		category: ExerciseCategory.MainLiftVariation,
		primaryLiftDay: PrimaryLift.Deadlift,
		rpeMin: 7,
		rpeMax: 8,
		repMin: 3,
		repMax: 8,
	},
	{
		name: "Pull-ups",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.VerticalPullAccessory,
		primaryLiftDay: PrimaryLift.Deadlift,
		rpeMin: 7,
		rpeMax: 8,
		repMin: 8,
		repMax: 12,
	},
	{
		name: "Barbell Row",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.LateralPullAccessory,
		primaryLiftDay: PrimaryLift.Deadlift,
		rpeMin: 7,
		rpeMax: 8,
		repMin: 8,
		repMax: 12,
	},
	{
		name: "Barbell Curl",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.BicepAccessory,
		primaryLiftDay: PrimaryLift.Deadlift,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 10,
		repMax: 15,
	},
	{
		name: "Hammer Curl",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.BicepAccessory,
		primaryLiftDay: PrimaryLift.Deadlift,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 10,
		repMax: 15,
	},

	// Overhead Press Day
	{
		name: "Overhead Press",
		type: ExerciseType.Primary,
		category: ExerciseCategory.MainLift,
		primaryLiftDay: PrimaryLift.Overhead,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 1,
		repMax: 5,
	},
	{
		name: "Lateral Raise",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.DeltAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 12,
		repMax: 15,
	},
	{
		name: "Front Raise",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.DeltAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 12,
		repMax: 15,
	},
	{
		name: "Rear Delt Flyes",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.DeltAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 12,
		repMax: 15,
	},
	{
		name: "Incline Dumbbell Curl",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.BicepAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 10,
		repMax: 15,
	},
	{
		name: "Skull Crushers",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.TricepAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		rpeMin: 7,
		rpeMax: 9,
		repMin: 10,
		repMax: 15,
	},
];

async function main() {
	try {
		console.log("Starting to seed exercise definitions...");

		// Clear existing exercise definitions
		await db.delete(exerciseDefinitions);
		console.log("Cleared existing exercise definitions");

		// Insert new exercise definitions
		await db.insert(exerciseDefinitions).values(exercises);
		console.log("Successfully seeded exercise definitions");
	} catch (error) {
		console.error("Error seeding exercise definitions:", error);
		process.exit(1);
	}
	process.exit(0);
}

main();
