import { users } from "@/drizzle/core/schemas/users";
import { exerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { integer, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const oneRepMaxes = pgTable(
	"one_rep_maxes",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id").references(() => users.id),
		exerciseDefinitionId: uuid("exercise_definition_id")
			.references(() => exerciseDefinitions.id)
			.notNull(),
		weight: integer("weight").notNull(),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		userExerciseUnique: unique().on(table.userId, table.exerciseDefinitionId),
	}),
);

export const oneRepMaxesInsertSchema = createInsertSchema(oneRepMaxes);
export type OneRepMaxesInsert = z.infer<typeof oneRepMaxesInsertSchema>;
export const oneRepMaxesSelectSchema = createSelectSchema(oneRepMaxes);
export type OneRepMaxesSelect = z.infer<typeof oneRepMaxesSelectSchema>;
