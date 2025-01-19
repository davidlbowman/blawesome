"use server";

import { type UserSelect, users } from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import type { DrizzleTransaction } from "@/drizzle/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

interface VerifyUserParams {
	user: NonNullable<Pick<UserSelect, "email" | "password">>;
	tx?: DrizzleTransaction;
}

type VerifyUserResponse = Promise<Response<UserSelect>>;

export async function verifyUser({
	user,
	tx,
}: VerifyUserParams): VerifyUserResponse {
	const { email, password } = user;

	const queryRunner = tx || db;

	const [verifiedUser] = await queryRunner
		.select()
		.from(users)
		.where(eq(users.email, email));

	if (!verifiedUser) {
		return { success: false, error: new Error("User not found") };
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		verifiedUser.password,
	);

	if (!isPasswordMatched) {
		return { success: false, error: new Error("Invalid password") };
	}

	return { success: true, data: verifiedUser };
}
