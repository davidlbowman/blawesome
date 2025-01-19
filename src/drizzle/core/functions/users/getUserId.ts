"use server";

import { users } from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import type { DrizzleTransaction } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { UserSelect } from "@/drizzle/core/schemas/users";

function base64URLDecode(str: string): string {
	const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	return Buffer.from(base64, "base64").toString();
}

interface GetUserIDParams {
	tx?: DrizzleTransaction;
}

type GetUserIDResponse = Promise<Response<Pick<UserSelect, "id">>>;

export async function getUserId({
	tx,
}: GetUserIDParams = {}): GetUserIDResponse {
	const queryRunner = tx || db;

	const cookieStore = await cookies();

	const token = cookieStore.get("session")?.value;
	if (!token) return { success: false, error: new Error("Not authenticated") };

	const [_, payloadBase64] = token.split(".");
	const payload = JSON.parse(base64URLDecode(payloadBase64));
	const userId = payload.id;

	const user = await queryRunner
		.select({ id: users.id })
		.from(users)
		.where(eq(users.id, userId))
		.get();

	if (!user) {
		console.error("User not found in database:", userId);
		return { success: false, error: new Error("User not found") };
	}

	return { success: true, data: { id: user.id } };
}
