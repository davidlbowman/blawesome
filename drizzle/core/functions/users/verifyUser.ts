"use server";

import { type User, users } from "@/drizzle/core/schemas/users";
import { db } from "@/drizzle/db";
import type { ResultSet } from "@libsql/client";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";

interface VerifyUserParams {
	email: User["email"];
	password: User["password"];
	tx?: SQLiteTransaction<
		"async",
		ResultSet,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>;
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
