import { users } from "@/lib/drizzle/schemas/users";
import {
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const PrimaryLift = {
	Squat: "squat",
	Bench: "bench",
	Deadlift: "deadlift",
	Overhead: "overhead",
};

export const ExerciseType = {
	Primary: "primary",
	Variation: "variation",
	Accessory: "accessory",
};

export const Status = {
	Pending: "pending",
	InProgress: "in_progress",
	Completed: "completed",
};

export const exerciseDefinitions = pgTable(
	"exercise_definitions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		type: text("type")
			.$type<(typeof ExerciseType)[keyof typeof ExerciseType]>()
			.notNull(),
		primaryLiftDay: text("primary_lift_day")
			.$type<(typeof PrimaryLift)[keyof typeof PrimaryLift]>()
			.notNull(),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		nameTypeUnique: unique().on(table.name, table.type),
	}),
);

export const exerciseDefinitionsInsertSchema =
	createInsertSchema(exerciseDefinitions);
export type ExerciseDefinitionsInsert = z.infer<
	typeof exerciseDefinitionsInsertSchema
>;
export const exerciseDefinitionsSelectSchema =
	createSelectSchema(exerciseDefinitions);
export type ExerciseDefinitionsSelect = z.infer<
	typeof exerciseDefinitionsSelectSchema
>;

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

export const cycles = pgTable("cycles", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => users.id),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date"),
	weekNumber: integer("week_number").notNull(),
	status: text("status")
		.$type<(typeof Status)[keyof typeof Status]>()
		.notNull()
		.default("pending"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	completedAt: timestamp("completed_at"),
});

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
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	completedAt: timestamp("completed_at"),
});

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
