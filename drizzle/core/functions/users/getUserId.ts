"use server";

import { users } from "@/drizzle/core/schemas/users";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

function base64URLDecode(str: string): string {
	const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	return Buffer.from(base64, "base64").toString();
}

export async function getUserId() {
	const cookieStore = await cookies();
	const token = cookieStore.get("session")?.value;
	if (!token) throw new Error("Not authenticated");

	const [_, payloadBase64] = token.split(".");
	const payload = JSON.parse(base64URLDecode(payloadBase64));
	const userId = payload.id;

	const user = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.id, userId))
		.get();

	if (!user) {
		console.error("User not found in database:", userId);
		throw new Error("User not found");
	}

	return userId;
}
