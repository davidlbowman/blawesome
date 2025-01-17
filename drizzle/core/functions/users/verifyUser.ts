"use server";

import { type User, users } from "@/drizzle/core/schemas/users";
import { db } from "@/drizzle/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { DrizzleTransaction } from "@/drizzle/db";

interface VerifyUserParams {
	email: User["email"];
	password: User["password"];
	tx?: DrizzleTransaction;
}

export async function verifyUser(data: VerifyUserParams) {
	const queryRunner = data.tx || db;

	const [user] = await queryRunner
		.select()
		.from(users)
		.where(eq(users.email, data.email));

	if (!user) {
		throw new Error("User not found");
	}

	const isPasswordMatched = await bcrypt.compare(data.password, user.password);

	if (!isPasswordMatched) {
		throw new Error("Invalid password");
	}

	return user;
}
