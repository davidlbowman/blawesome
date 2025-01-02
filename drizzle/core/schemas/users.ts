import { generateId } from "@/drizzle/utils/uuid";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => generateId()),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => new Date(),
	),
});

export const userSelectSchema = createSelectSchema(users);
export type User = z.infer<typeof userSelectSchema>;
export const userInsertSchema = createInsertSchema(users);
export type UserInsert = z.infer<typeof userInsertSchema>;
