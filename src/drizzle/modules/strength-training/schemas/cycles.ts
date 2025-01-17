import { users } from "@/drizzle/core/schemas/users";
import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { generateId } from "@/drizzle/utils/uuid";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const cycles = sqliteTable("cycles", {
	id: text("id")
		.$defaultFn(() => generateId())
		.primaryKey(),
	userId: text("user_id")
		.references(() => users.id)
		.notNull(),
	startDate: integer("start_date", { mode: "timestamp" }).notNull(),
	endDate: integer("end_date", { mode: "timestamp" }),
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

export const cyclesInsertSchema = createInsertSchema(cycles);
export type CyclesInsert = z.infer<typeof cyclesInsertSchema>;
export const cyclesSelectSchema = createSelectSchema(cycles);
export type CyclesSelect = z.infer<typeof cyclesSelectSchema>;
