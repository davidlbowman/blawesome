import { users } from "@/drizzle/core/schemas/users";
import { exerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { generateId } from "@/drizzle/utils/uuid";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const oneRepMaxes = sqliteTable(
	"one_rep_maxes",
	{
		id: text("id")
			.$defaultFn(() => generateId())
			.primaryKey(),
		userId: text("user_id")
			.references(() => users.id)
			.notNull(),
		exerciseDefinitionId: text("exercise_definition_id")
			.references(() => exerciseDefinitions.id)
			.notNull(),
		weight: integer("weight").notNull(),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => ({
		userExerciseUnique: unique().on(table.userId, table.exerciseDefinitionId),
	}),
);

const oneRepMaxValidation = {
	weight: z.coerce.number().min(0, "Weight must be a positive number"),
};

export const oneRepMaxesInsertSchema = createInsertSchema(
	oneRepMaxes,
	oneRepMaxValidation,
);
export type OneRepMaxesInsert = z.infer<typeof oneRepMaxesInsertSchema>;

export const oneRepMaxesSelectSchema = createSelectSchema(
	oneRepMaxes,
	oneRepMaxValidation,
);
export type OneRepMaxesSelect = z.infer<typeof oneRepMaxesSelectSchema>;
