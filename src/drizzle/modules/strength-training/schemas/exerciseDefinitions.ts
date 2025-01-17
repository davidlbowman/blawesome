import {
	ExerciseCategory,
	ExerciseType,
	PrimaryLift,
} from "@/drizzle/modules/strength-training/types";
import { generateId } from "@/drizzle/utils/uuid";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const exerciseDefinitions = sqliteTable(
	"exercise_definitions",
	{
		id: text("id")
			.$defaultFn(() => generateId())
			.primaryKey(),
		name: text("name").notNull(),
		type: text("type").notNull(),
		category: text("category").notNull(),
		primaryLiftDay: text("primary_lift_day").notNull(),
		rpeMax: integer("rpe_max"),
		repMax: integer("rep_max"),
		createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
		updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
			() => new Date(),
		),
	},
	(table) => ({
		nameTypeUnique: unique().on(table.name, table.type),
	}),
);

export const exerciseDefinitionsInsertSchema = createInsertSchema(
	exerciseDefinitions,
	{
		type: ExerciseType,
		category: ExerciseCategory,
		primaryLiftDay: PrimaryLift,
	},
);
export type ExerciseDefinitionsInsert = z.infer<
	typeof exerciseDefinitionsInsertSchema
>;

export const exerciseDefinitionsSelectSchema = createSelectSchema(
	exerciseDefinitions,
	{
		type: ExerciseType,
		category: ExerciseCategory,
		primaryLiftDay: PrimaryLift,
	},
);
export type ExerciseDefinitionsSelect = z.infer<
	typeof exerciseDefinitionsSelectSchema
>;

// Default exercise definitions for seeding
export const defaultExerciseDefinitions = [
	// Squat Day
	{
		name: "Squat",
		type: ExerciseType.Enum.primary,
		category: ExerciseCategory.Enum.main_lift,
		primaryLiftDay: PrimaryLift.Enum.squat,
		repMax: 5,
		rpeMax: 9,
	},
	{
		name: "Front Squat",
		type: ExerciseType.Enum.variation,
		category: ExerciseCategory.Enum.main_lift_variation,
		primaryLiftDay: PrimaryLift.Enum.squat,
		repMax: 8,
		rpeMax: 8,
	},
	{
		name: "Bulgarian Split Squat",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.compound_leg,
		primaryLiftDay: PrimaryLift.Enum.squat,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Leg Extension",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.quad_accessory,
		primaryLiftDay: PrimaryLift.Enum.squat,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Romanian Deadlift",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.hamstring_glute_accessory,
		primaryLiftDay: PrimaryLift.Enum.squat,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Standing Calf Raise",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.calf_accessory,
		primaryLiftDay: PrimaryLift.Enum.squat,
		repMax: 15,
		rpeMax: 9,
	},

	// Bench Day
	{
		name: "Bench Press",
		type: ExerciseType.Enum.primary,
		category: ExerciseCategory.Enum.main_lift,
		primaryLiftDay: PrimaryLift.Enum.bench,
		repMax: 5,
		rpeMax: 9,
	},
	{
		name: "Close Grip Bench Press",
		type: ExerciseType.Enum.variation,
		category: ExerciseCategory.Enum.main_lift_variation,
		primaryLiftDay: PrimaryLift.Enum.bench,
		repMax: 8,
		rpeMax: 8,
	},
	{
		name: "Incline Dumbbell Press",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.chest_accessory,
		primaryLiftDay: PrimaryLift.Enum.bench,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Dumbbell Flyes",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.chest_accessory,
		primaryLiftDay: PrimaryLift.Enum.bench,
		repMax: 15,
		rpeMax: 8,
	},
	{
		name: "Tricep Pushdown",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.tricep_accessory,
		primaryLiftDay: PrimaryLift.Enum.bench,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Overhead Tricep Extension",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.tricep_accessory,
		primaryLiftDay: PrimaryLift.Enum.bench,
		repMax: 15,
		rpeMax: 9,
	},

	// Deadlift Day
	{
		name: "Deadlift",
		type: ExerciseType.Enum.primary,
		category: ExerciseCategory.Enum.main_lift,
		primaryLiftDay: PrimaryLift.Enum.deadlift,
		repMax: 5,
		rpeMax: 9,
	},
	{
		name: "Deficit Deadlift",
		type: ExerciseType.Enum.variation,
		category: ExerciseCategory.Enum.main_lift_variation,
		primaryLiftDay: PrimaryLift.Enum.deadlift,
		repMax: 8,
		rpeMax: 8,
	},
	{
		name: "Pull-ups",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.vertical_pull_accessory,
		primaryLiftDay: PrimaryLift.Enum.deadlift,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Barbell Row",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.lateral_pull_accessory,
		primaryLiftDay: PrimaryLift.Enum.deadlift,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Barbell Curl",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.bicep_accessory,
		primaryLiftDay: PrimaryLift.Enum.deadlift,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Hammer Curl",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.bicep_accessory,
		primaryLiftDay: PrimaryLift.Enum.deadlift,
		repMax: 15,
		rpeMax: 9,
	},

	// Overhead Press Day
	{
		name: "Overhead Press",
		type: ExerciseType.Enum.primary,
		category: ExerciseCategory.Enum.main_lift,
		primaryLiftDay: PrimaryLift.Enum.press,
		repMax: 5,
		rpeMax: 9,
	},
	{
		name: "Lateral Raise",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.delt_accessory,
		primaryLiftDay: PrimaryLift.Enum.press,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Front Raise",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.delt_accessory,
		primaryLiftDay: PrimaryLift.Enum.press,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Rear Delt Flyes",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.delt_accessory,
		primaryLiftDay: PrimaryLift.Enum.press,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Incline Dumbbell Curl",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.bicep_accessory,
		primaryLiftDay: PrimaryLift.Enum.press,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Close Grip Bench Press",
		type: ExerciseType.Enum.accessory,
		category: ExerciseCategory.Enum.tricep_accessory,
		primaryLiftDay: PrimaryLift.Enum.press,
		repMax: 15,
		rpeMax: 9,
	},
] as const;
