import { users } from "@/drizzle/core/schemas/users";
import { exercises } from "@/drizzle/modules/strength-training/schemas/exercises";
import { Status } from "@/drizzle/modules/strength-training/types";
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
	status: text("status").notNull().default(Status.Enum.pending),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const setsInsertSchema = createInsertSchema(sets).extend({
	status: Status,
});
export type SetsInsert = z.infer<typeof setsInsertSchema>;

export const setsSelectSchema = createSelectSchema(sets).extend({
	status: Status,
});
export type SetsSelect = z.infer<typeof setsSelectSchema>;
