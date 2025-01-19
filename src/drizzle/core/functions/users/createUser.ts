"use server";

import { users } from "@/drizzle/core/schemas/users";
import type { User } from "@/drizzle/core/schemas/users";
import {
	userInsertSchema,
	userSelectSchema,
} from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import type { DrizzleTransaction } from "@/drizzle/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function createUser({
	email,
	password,
	tx,
}: {
	email: User["email"];
	password: User["password"];
	tx?: DrizzleTransaction;
}): Promise<Response<Pick<User, "id" | "email">>> {
	const queryRunner = tx || db;

	const existingUser = await queryRunner
		.select()
		.from(users)
		.where(eq(users.email, email));

	if (existingUser.length > 0) {
		return { success: false, error: new Error("User already exists") };
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		const validatedCredentials = userSelectSchema
			.pick({ email: true, password: true })
			.parse({ email, password });

		const validatedInput = userInsertSchema.parse({
			...validatedCredentials,
			password: hashedPassword,
		});

		const [user] = await queryRunner
			.insert(users)
			.values(validatedInput)
			.returning({
				id: users.id,
				email: users.email,
			});

		const validatedUser = userSelectSchema
			.pick({ id: true, email: true })
			.parse(user);

		return { success: true, data: validatedUser };
	} catch (error) {
		if (error instanceof Error) {
			return { success: false, error };
		}
		return {
			success: false,
			error: new Error("An unexpected error occurred while creating user"),
		};
	}
}
