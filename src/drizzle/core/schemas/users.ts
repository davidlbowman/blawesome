import { generateId } from "@/drizzle/utils/uuid";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => generateId()),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

const userValidation = {
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
};

export const userSelectSchema = createSelectSchema(users, userValidation);
export type User = z.infer<typeof userSelectSchema>;

export const userInsertSchema = createInsertSchema(users, userValidation);
export type UserInsert = z.infer<typeof userInsertSchema>;
