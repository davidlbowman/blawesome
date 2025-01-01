import { users } from "@/drizzle/core/schemas/users";
import { exercises } from "@/drizzle/modules/strength-training/schemas/exercises";
import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const sets = pgTable("sets", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => users.id),
	exerciseId: uuid("exercise_id").references(() => exercises.id),
	weight: integer("weight").notNull(),
	reps: integer("reps").notNull(),
	rpe: integer("rpe"),
	percentageOfMax: integer("percentage_of_max"),
	setNumber: integer("set_number").notNull(),
	status: text("status")
		.$type<(typeof Status)[keyof typeof Status]>()
		.notNull()
		.default("pending"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	completedAt: timestamp("completed_at"),
});

export const setsInsertSchema = createInsertSchema(sets);
export type SetsInsert = z.infer<typeof setsInsertSchema>;
export const setsSelectSchema = createSelectSchema(sets);
export type SetsSelect = z.infer<typeof setsSelectSchema>;
