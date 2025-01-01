import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;
export const userInsertSchema = createInsertSchema(users);
export type UserInsert = z.infer<typeof userInsertSchema>;
