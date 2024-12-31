"use server";

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
	return payload.id;
}
