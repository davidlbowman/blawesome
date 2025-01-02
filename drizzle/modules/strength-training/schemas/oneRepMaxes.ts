import { randomUUID } from "node:crypto";
import { users } from "@/drizzle/core/schemas/users";
import { exerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const oneRepMaxes = sqliteTable(
	"one_rep_maxes",
	{
		id: text("id")
			.$defaultFn(() => randomUUID())
			.primaryKey(),
		userId: text("user_id")
			.references(() => users.id)
			.notNull(),
		exerciseDefinitionId: text("exercise_definition_id")
			.references(() => exerciseDefinitions.id)
			.notNull(),
		weight: integer("weight").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
		updatedAt: integer("updated_at", { mode: "timestamp" }).default(
			sql`CURRENT_TIMESTAMP`,
		),
	},
	(table) => ({
		userExerciseUnique: unique().on(table.userId, table.exerciseDefinitionId),
	}),
);

export const oneRepMaxesInsertSchema = createInsertSchema(oneRepMaxes);
export type OneRepMaxesInsert = z.infer<typeof oneRepMaxesInsertSchema>;
export const oneRepMaxesSelectSchema = createSelectSchema(oneRepMaxes);
export type OneRepMaxesSelect = z.infer<typeof oneRepMaxesSelectSchema>;
