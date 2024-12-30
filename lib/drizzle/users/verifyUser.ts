"use server";

import { db } from "@/lib/drizzle/db";
import { type User, users } from "@/lib/drizzle/schemas/users";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

interface VerifyUserParams {
	email: User["email"];
	password: User["password"];
}

export async function verifyUser(data: VerifyUserParams) {
	const [user] = await db
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
