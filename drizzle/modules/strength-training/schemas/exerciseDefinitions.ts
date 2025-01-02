import { randomUUID } from "node:crypto";
import {
	ExerciseCategory,
	ExerciseType,
	PrimaryLift,
} from "@/drizzle/modules/strength-training/schemas/types";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const exerciseDefinitions = sqliteTable(
	"exercise_definitions",
	{
		id: text("id")
			.$defaultFn(() => randomUUID())
			.primaryKey(),
		name: text("name").notNull(),
		type: text("type")
			.$type<(typeof ExerciseType)[keyof typeof ExerciseType]>()
			.notNull(),
		category: text("category")
			.$type<(typeof ExerciseCategory)[keyof typeof ExerciseCategory]>()
			.notNull(),
		primaryLiftDay: text("primary_lift_day")
			.$type<(typeof PrimaryLift)[keyof typeof PrimaryLift]>()
			.notNull(),
		rpeMax: integer("rpe_max"),
		repMax: integer("rep_max"),
		createdAt: integer("created_at", { mode: "timestamp" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		updatedAt: integer("updated_at", { mode: "timestamp" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
	},
	(table) => ({
		nameTypeUnique: unique().on(table.name, table.type),
	}),
);

export const exerciseDefinitionsInsertSchema =
	createInsertSchema(exerciseDefinitions);
export type ExerciseDefinitionsInsert = z.infer<
	typeof exerciseDefinitionsInsertSchema
>;
export const exerciseDefinitionsSelectSchema =
	createSelectSchema(exerciseDefinitions);
export type ExerciseDefinitionsSelect = z.infer<
	typeof exerciseDefinitionsSelectSchema
>;

// Default exercise definitions for seeding
export const defaultExerciseDefinitions = [
	// Squat Day
	{
		name: "Squat",
		type: ExerciseType.Primary,
		category: ExerciseCategory.MainLift,
		primaryLiftDay: PrimaryLift.Squat,
		repMax: 5,
		rpeMax: 9,
	},
	{
		name: "Front Squat",
		type: ExerciseType.Variation,
		category: ExerciseCategory.MainLiftVariation,
		primaryLiftDay: PrimaryLift.Squat,
		repMax: 8,
		rpeMax: 8,
	},
	{
		name: "Bulgarian Split Squat",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.CompoundLeg,
		primaryLiftDay: PrimaryLift.Squat,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Leg Extension",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.QuadAccessory,
		primaryLiftDay: PrimaryLift.Squat,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Romanian Deadlift",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.HamstringGluteAccessory,
		primaryLiftDay: PrimaryLift.Squat,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Standing Calf Raise",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.CalfAccessory,
		primaryLiftDay: PrimaryLift.Squat,
		repMax: 15,
		rpeMax: 9,
	},

	// Bench Day
	{
		name: "Bench Press",
		type: ExerciseType.Primary,
		category: ExerciseCategory.MainLift,
		primaryLiftDay: PrimaryLift.Bench,
		repMax: 5,
		rpeMax: 9,
	},
	{
		name: "Close Grip Bench Press",
		type: ExerciseType.Variation,
		category: ExerciseCategory.MainLiftVariation,
		primaryLiftDay: PrimaryLift.Bench,
		repMax: 8,
		rpeMax: 8,
	},
	{
		name: "Incline Dumbbell Press",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.ChestAccessory,
		primaryLiftDay: PrimaryLift.Bench,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Dumbbell Flyes",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.ChestAccessory,
		primaryLiftDay: PrimaryLift.Bench,
		repMax: 15,
		rpeMax: 8,
	},
	{
		name: "Tricep Pushdown",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.TricepAccessory,
		primaryLiftDay: PrimaryLift.Bench,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Overhead Tricep Extension",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.TricepAccessory,
		primaryLiftDay: PrimaryLift.Bench,
		repMax: 15,
		rpeMax: 9,
	},

	// Deadlift Day
	{
		name: "Deadlift",
		type: ExerciseType.Primary,
		category: ExerciseCategory.MainLift,
		primaryLiftDay: PrimaryLift.Deadlift,
		repMax: 5,
		rpeMax: 9,
	},
	{
		name: "Deficit Deadlift",
		type: ExerciseType.Variation,
		category: ExerciseCategory.MainLiftVariation,
		primaryLiftDay: PrimaryLift.Deadlift,
		repMax: 8,
		rpeMax: 8,
	},
	{
		name: "Pull-ups",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.VerticalPullAccessory,
		primaryLiftDay: PrimaryLift.Deadlift,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Barbell Row",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.LateralPullAccessory,
		primaryLiftDay: PrimaryLift.Deadlift,
		repMax: 12,
		rpeMax: 8,
	},
	{
		name: "Barbell Curl",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.BicepAccessory,
		primaryLiftDay: PrimaryLift.Deadlift,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Hammer Curl",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.BicepAccessory,
		primaryLiftDay: PrimaryLift.Deadlift,
		repMax: 15,
		rpeMax: 9,
	},

	// Overhead Press Day
	{
		name: "Overhead Press",
		type: ExerciseType.Primary,
		category: ExerciseCategory.MainLift,
		primaryLiftDay: PrimaryLift.Overhead,
		repMax: 5,
		rpeMax: 9,
	},
	{
		name: "Lateral Raise",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.DeltAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Front Raise",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.DeltAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Rear Delt Flyes",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.DeltAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Incline Dumbbell Curl",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.BicepAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		repMax: 15,
		rpeMax: 9,
	},
	{
		name: "Close Grip Bench Press",
		type: ExerciseType.Accessory,
		category: ExerciseCategory.TricepAccessory,
		primaryLiftDay: PrimaryLift.Overhead,
		repMax: 15,
		rpeMax: 9,
	},
] as const;
