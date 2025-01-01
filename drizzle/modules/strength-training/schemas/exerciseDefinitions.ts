import type {
	ExerciseCategory,
	ExerciseType,
	PrimaryLift,
} from "@/drizzle/modules/strength-training/schemas/types";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import {
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

export const exerciseDefinitions = pgTable(
	"exercise_definitions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
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
		rpeMin: integer("rpe_min"),
		rpeMax: integer("rpe_max"),
		repMin: integer("rep_min"),
		repMax: integer("rep_max"),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
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
