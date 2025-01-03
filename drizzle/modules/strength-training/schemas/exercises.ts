import { users } from "@/drizzle/core/schemas/users";
import { exerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { workouts } from "@/drizzle/modules/strength-training/schemas/workouts";
import { generateId } from "@/drizzle/utils/uuid";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const exercises = sqliteTable("exercises", {
	id: text("id")
		.$defaultFn(() => generateId())
		.primaryKey(),
	userId: text("user_id")
		.references(() => users.id)
		.notNull(),
	workoutId: text("workout_id")
		.references(() => workouts.id)
		.notNull(),
	exerciseDefinitionId: text("exercise_definition_id")
		.references(() => exerciseDefinitions.id)
		.notNull(),
	oneRepMax: integer("one_rep_max"),
	order: integer("order").notNull(),
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

export const exercisesInsertSchema = createInsertSchema(exercises);
export type ExercisesInsert = z.infer<typeof exercisesInsertSchema>;
export const exercisesSelectSchema = createSelectSchema(exercises);
export type ExercisesSelect = z.infer<typeof exercisesSelectSchema>;
