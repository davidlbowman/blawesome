import { users } from "@/drizzle/core/schemas/users";
import type { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const cycles = pgTable("cycles", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => users.id),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date"),
	status: text("status")
		.$type<(typeof Status)[keyof typeof Status]>()
		.notNull()
		.default("pending"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	completedAt: timestamp("completed_at"),
});

export const cyclesInsertSchema = createInsertSchema(cycles);
export type CyclesInsert = z.infer<typeof cyclesInsertSchema>;
export const cyclesSelectSchema = createSelectSchema(cycles);
export type CyclesSelect = z.infer<typeof cyclesSelectSchema>;
