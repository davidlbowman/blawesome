"use server";

import { users } from "@/drizzle/core/schemas/users";
import {
	type UserInsert,
	type UserSelect,
	userInsertSchema,
	userSelectSchema,
} from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import type { DrizzleTransaction } from "@/drizzle/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

interface CreateUserParams {
	user: Pick<UserInsert, "email" | "password">;
	tx?: DrizzleTransaction;
}

type CreateUserResponse = Promise<Response<Pick<UserSelect, "id" | "email">>>;

export async function createUser({
	user,
	tx,
}: CreateUserParams): CreateUserResponse {
	const queryRunner = tx || db;

	const existingUser = await queryRunner
		.select()
		.from(users)
		.where(eq(users.email, user.email));

	if (existingUser.length > 0) {
		return { success: false, error: new Error("User already exists") };
	}

	try {
		const hashedPassword = await bcrypt.hash(user.password, 10);

		const validatedCredentials = userSelectSchema
			.pick({ email: true, password: true })
			.parse({ email: user.email, password: user.password });

		const validatedInput = userInsertSchema.parse({
			...validatedCredentials,
			password: hashedPassword,
		});

		const [validatedUserResponse] = await queryRunner
			.insert(users)
			.values(validatedInput)
			.returning({
				id: users.id,
				email: users.email,
			});

		const validatedUser = userSelectSchema
			.pick({ id: true, email: true })
			.parse(validatedUserResponse);

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
