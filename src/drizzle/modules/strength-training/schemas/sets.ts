import { users } from "@/drizzle/core/schemas/users";
import { exercises } from "@/drizzle/modules/strength-training/schemas/exercises";
import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { generateId } from "@/drizzle/utils/uuid";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const sets = sqliteTable("sets", {
	id: text("id")
		.$defaultFn(() => generateId())
		.primaryKey(),
	userId: text("user_id")
		.references(() => users.id)
		.notNull(),
	exerciseId: text("exercise_id")
		.references(() => exercises.id)
		.notNull(),
	weight: integer("weight").notNull(),
	reps: integer("reps").notNull(),
	rpe: integer("rpe"),
	percentageOfMax: integer("percentage_of_max"),
	setNumber: integer("set_number").notNull(),
	status: text("status")
		.$type<(typeof Status)[keyof typeof Status]>()
		.notNull()
		.default("pending"),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const setsInsertSchema = createInsertSchema(sets);
export type SetsInsert = z.infer<typeof setsInsertSchema>;
export const setsSelectSchema = createSelectSchema(sets);
export type SetsSelect = z.infer<typeof setsSelectSchema>;
