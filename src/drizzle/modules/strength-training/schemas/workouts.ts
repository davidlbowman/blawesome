import { users } from "@/drizzle/core/schemas/users";
import { cycles } from "@/drizzle/modules/strength-training/schemas/cycles";
import { PrimaryLift, Status } from "@/drizzle/modules/strength-training/types";
import { generateId } from "@/drizzle/utils/uuid";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const workouts = sqliteTable("workouts", {
	id: text("id")
		.$defaultFn(() => generateId())
		.primaryKey(),
	userId: text("user_id")
		.references(() => users.id)
		.notNull(),
	cycleId: text("cycle_id")
		.references(() => cycles.id)
		.notNull(),
	date: integer("date", { mode: "timestamp" }).notNull(),
	primaryLift: text("primary_lift").notNull(),
	status: text("status").notNull().default(Status.Enum.pending),
	sequence: integer("sequence").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const workoutsInsertSchema = createInsertSchema(workouts).extend({
	primaryLift: PrimaryLift,
	status: Status,
});
export type WorkoutsInsert = z.infer<typeof workoutsInsertSchema>;

export const workoutsSelectSchema = createSelectSchema(workouts).extend({
	primaryLift: PrimaryLift,
	status: Status,
});
export type WorkoutsSelect = z.infer<typeof workoutsSelectSchema>;
