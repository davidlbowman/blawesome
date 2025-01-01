import { users } from "@/drizzle/core/schemas/users";
import { cycles } from "@/drizzle/modules/strength-training/schemas/cycles";
import type { PrimaryLift } from "@/drizzle/modules/strength-training/schemas/types";
import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const workouts = pgTable("workouts", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => users.id),
	cycleId: uuid("cycle_id").references(() => cycles.id),
	date: timestamp("date").notNull(),
	primaryLift: text("primary_lift")
		.$type<(typeof PrimaryLift)[keyof typeof PrimaryLift]>()
		.notNull(),
	status: text("status")
		.$type<(typeof Status)[keyof typeof Status]>()
		.notNull()
		.default("pending"),
	sequence: integer("sequence").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	completedAt: timestamp("completed_at"),
});

export const workoutsInsertSchema = createInsertSchema(workouts);
export type WorkoutsInsert = z.infer<typeof workoutsInsertSchema>;
export const workoutsSelectSchema = createSelectSchema(workouts);
export type WorkoutsSelect = z.infer<typeof workoutsSelectSchema>;
