"use server";

import { type User, users } from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import type { DrizzleTransaction } from "@/drizzle/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

interface VerifyUserParams {
	email: User["email"];
	password: User["password"];
	tx?: DrizzleTransaction;
}

export async function verifyUser(
	data: VerifyUserParams,
): Promise<Response<User>> {
	const queryRunner = data.tx || db;

	const [user] = await queryRunner
		.select()
		.from(users)
		.where(eq(users.email, data.email));

	if (!user) {
		return { success: false, error: new Error("User not found") };
	}

	const isPasswordMatched = await bcrypt.compare(data.password, user.password);

	if (!isPasswordMatched) {
		return { success: false, error: new Error("Invalid password") };
	}

	return { success: true, data: user };
}
