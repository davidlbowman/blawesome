import type { ExerciseDefinitionsInsert } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { z } from "zod";

export const Status = z.enum([
	"pending",
	"in_progress",
	"completed",
	"skipped",
]);
export type Status = z.infer<typeof Status>;

export const PrimaryLift = z.enum(["squat", "bench", "deadlift", "overhead"]);
export type PrimaryLift = z.infer<typeof PrimaryLift>;

export const ExerciseType = z.enum(["primary", "variation", "accessory"]);
export type ExerciseType = z.infer<typeof ExerciseType>;

export const ExerciseCategory = z.object({
	squat: z.enum([
		"main_lift",
		"main_lift_variation",
		"compound_leg",
		"quad_accessory",
		"hamstring_glute_accessory",
		"calf_accessory",
	]),
	bench: z.enum([
		"main_lift",
		"main_lift_variation",
		"chest_accessory",
		"tricep_accessory",
	]),
	deadlift: z.enum([
		"main_lift",
		"main_lift_variation",
		"vertical_pull_accessory",
		"lateral_pull_accessory",
		"bicep_accessory",
	]),
	overhead: z.enum([
		"main_lift",
		"delt_accessory",
		"tricep_accessory",
		"bicep_accessory",
	]),
});
export type ExerciseCategory = z.infer<typeof ExerciseCategory>;

export const SquatExercises = ExerciseCategory.shape.squat;
export type SquatExercises = z.infer<typeof SquatExercises>;

export const BenchExercises = ExerciseCategory.shape.bench;
export type BenchExercises = z.infer<typeof BenchExercises>;

export const DeadliftExercises = ExerciseCategory.shape.deadlift;
export type DeadliftExercises = z.infer<typeof DeadliftExercises>;

export const OverheadExercises = ExerciseCategory.shape.overhead;
export type OverheadExercises = z.infer<typeof OverheadExercises>;

export const AllExerciseCategories = z.union([
	SquatExercises,
	BenchExercises,
	DeadliftExercises,
	OverheadExercises,
]);
export type AllExerciseCategories = z.infer<typeof AllExerciseCategories>;

export interface SetPerformance {
	weight: number;
	reps: number | null | undefined;
	rpe: number | null | undefined;
}

export type DefaultExerciseDefinition = Pick<
	ExerciseDefinitionsInsert,
	"name" | "type" | "category" | "repMax" | "rpeMax"
>;

export const DefaultExerciseDefinitions = new Map<
	PrimaryLift,
	Array<DefaultExerciseDefinition>
>([
	[
		PrimaryLift.Enum.squat,
		[
			{
				name: "Squat",
				type: ExerciseType.Enum.primary,
				category: ExerciseCategory.shape.squat.enum.main_lift,
				repMax: 5,
				rpeMax: 9,
			},
			{
				name: "Front Squat",
				type: ExerciseType.Enum.variation,
				category: ExerciseCategory.shape.squat.enum.main_lift_variation,
				repMax: 8,
				rpeMax: 8,
			},
			{
				name: "Bulgarian Split Squat",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.squat.enum.compound_leg,
				repMax: 12,
				rpeMax: 8,
			},
			{
				name: "Leg Extension",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.squat.enum.quad_accessory,
				repMax: 15,
				rpeMax: 9,
			},
			{
				name: "Romanian Deadlift",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.squat.enum.hamstring_glute_accessory,
				repMax: 12,
				rpeMax: 8,
			},
			{
				name: "Standing Calf Raise",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.squat.enum.calf_accessory,
				repMax: 15,
				rpeMax: 9,
			},
		],
	],
	[
		PrimaryLift.Enum.bench,
		[
			{
				name: "Bench Press",
				type: ExerciseType.Enum.primary,
				category: ExerciseCategory.shape.bench.enum.main_lift,
				repMax: 5,
				rpeMax: 9,
			},
			{
				name: "Close Grip Bench Press",
				type: ExerciseType.Enum.variation,
				category: ExerciseCategory.shape.bench.enum.main_lift_variation,
				repMax: 8,
				rpeMax: 8,
			},
			{
				name: "Incline Dumbbell Press",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.bench.enum.chest_accessory,
				repMax: 12,
				rpeMax: 8,
			},
			{
				name: "Dumbbell Flyes",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.bench.enum.chest_accessory,
				repMax: 15,
				rpeMax: 8,
			},
			{
				name: "Tricep Pushdown",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.bench.enum.tricep_accessory,
				repMax: 15,
				rpeMax: 9,
			},
			{
				name: "Overhead Tricep Extension",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.bench.enum.tricep_accessory,
				repMax: 15,
				rpeMax: 9,
			},
		],
	],
	[
		PrimaryLift.Enum.deadlift,
		[
			{
				name: "Deadlift",
				type: ExerciseType.Enum.primary,
				category: ExerciseCategory.shape.deadlift.enum.main_lift,
				repMax: 5,
				rpeMax: 9,
			},
			{
				name: "Deficit Deadlift",
				type: ExerciseType.Enum.variation,
				category: ExerciseCategory.shape.deadlift.enum.main_lift_variation,
				repMax: 8,
				rpeMax: 8,
			},
			{
				name: "Pull-ups",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.deadlift.enum.vertical_pull_accessory,
				repMax: 12,
				rpeMax: 8,
			},
			{
				name: "Barbell Row",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.deadlift.enum.lateral_pull_accessory,
				repMax: 12,
				rpeMax: 8,
			},
			{
				name: "Barbell Curl",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.deadlift.enum.bicep_accessory,
				repMax: 15,
				rpeMax: 9,
			},
			{
				name: "Hammer Curl",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.deadlift.enum.bicep_accessory,
				repMax: 15,
				rpeMax: 9,
			},
		],
	],
	[
		PrimaryLift.Enum.overhead,
		[
			{
				name: "Overhead Press",
				type: ExerciseType.Enum.primary,
				category: ExerciseCategory.shape.overhead.enum.main_lift,
				repMax: 5,
				rpeMax: 9,
			},
			{
				name: "Lateral Raise",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.overhead.enum.delt_accessory,
				repMax: 15,
				rpeMax: 9,
			},
			{
				name: "Front Raise",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.overhead.enum.delt_accessory,
				repMax: 15,
				rpeMax: 9,
			},
			{
				name: "Rear Delt Flyes",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.overhead.enum.delt_accessory,
				repMax: 15,
				rpeMax: 9,
			},
			{
				name: "Incline Dumbbell Curl",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.overhead.enum.bicep_accessory,
				repMax: 15,
				rpeMax: 9,
			},
			{
				name: "Close Grip Bench Press",
				type: ExerciseType.Enum.accessory,
				category: ExerciseCategory.shape.overhead.enum.tricep_accessory,
				repMax: 15,
				rpeMax: 9,
			},
		],
	],
]);
