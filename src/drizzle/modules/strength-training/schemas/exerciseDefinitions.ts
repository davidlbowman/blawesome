import {
	AllExerciseCategories,
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
		category: AllExerciseCategories,
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
		category: AllExerciseCategories,
		primaryLiftDay: PrimaryLift,
	},
);
export type ExerciseDefinitionsSelect = z.infer<
	typeof exerciseDefinitionsSelectSchema
>;
