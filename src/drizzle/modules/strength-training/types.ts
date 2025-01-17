import { z } from "zod";

export const Status = z.enum([
	"pending",
	"in_progress",
	"completed",
	"skipped",
]);
export type Status = z.infer<typeof Status>;

export const PrimaryLift = z.enum(["squat", "bench", "deadlift", "press"]);
export type PrimaryLift = z.infer<typeof PrimaryLift>;

export const ExerciseType = z.enum(["primary", "variation", "accessory"]);
export type ExerciseType = z.infer<typeof ExerciseType>;

export const ExerciseCategory = z.enum([
	// Primary Categories
	"main_lift",
	"main_lift_variation",
	"compound_leg",

	// Leg Day Categories
	"quad_accessory",
	"hamstring_glute_accessory",
	"calf_accessory",

	// Push Day Categories
	"chest_accessory",
	"tricep_accessory",

	// Pull Day Categories
	"vertical_pull_accessory",
	"lateral_pull_accessory",
	"bicep_accessory",

	// Shoulder Day Categories
	"delt_accessory",
]);
export type ExerciseCategory = z.infer<typeof ExerciseCategory>;

export interface SetPerformance {
	weight: number;
	reps: number | null | undefined;
	rpe: number | null | undefined;
}
