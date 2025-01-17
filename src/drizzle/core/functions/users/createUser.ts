"use server";

import { users } from "@/drizzle/core/schemas/users";
import type { User } from "@/drizzle/core/schemas/users";
import { db } from "@/drizzle/db";
import type { DrizzleTransaction } from "@/drizzle/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function createUser({
	email,
	password,
	tx,
}: {
	email: string;
	password: string;
	tx?: DrizzleTransaction;
}): Promise<User> {
	const queryRunner = tx || db;

	const existingUser = await queryRunner
		.select()
		.from(users)
		.where(eq(users.email, email));

	if (existingUser.length > 0) {
		throw new Error("User already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const [user] = await queryRunner
		.insert(users)
		.values({
			email,
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	return user;
}
