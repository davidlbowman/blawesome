import { users } from "@/drizzle/core/schemas/users";
import { exerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { workouts } from "@/drizzle/modules/strength-training/schemas/workouts";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const exercises = pgTable("exercises", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => users.id),
	workoutId: uuid("workout_id").references(() => workouts.id),
	exerciseDefinitionId: uuid("exercise_definition_id").references(
		() => exerciseDefinitions.id,
	),
	oneRepMax: integer("one_rep_max"),
	order: integer("order").notNull(),
	status: text("status")
		.$type<(typeof Status)[keyof typeof Status]>()
		.notNull()
		.default("pending"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	completedAt: timestamp("completed_at"),
});

export const exercisesInsertSchema = createInsertSchema(exercises);
export type ExercisesInsert = z.infer<typeof exercisesInsertSchema>;
export const exercisesSelectSchema = createSelectSchema(exercises);
export type ExercisesSelect = z.infer<typeof exercisesSelectSchema>;
