"use server";

import { createHmac, randomBytes } from "node:crypto";
import type { User } from "@/drizzle/core/schemas/users";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable is not set");
}

function base64URLEncode(str: string): string {
	return Buffer.from(str)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
}

function createSignature(header: string, payload: string): string {
	return createHmac("sha256", JWT_SECRET)
		.update(`${header}.${payload}`)
		.digest("base64url");
}

export async function createUserSession(user: User) {
	try {
		const header = base64URLEncode(
			JSON.stringify({
				alg: "HS256",
				typ: "JWT",
			}),
		);

		const payload = base64URLEncode(
			JSON.stringify({
				id: user.id,
				email: user.email,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
				jti: randomBytes(16).toString("hex"),
			}),
		);

		const signature = createSignature(header, payload);
		const token = `${header}.${payload}.${signature}`;

		const cookieStore = await cookies();
		cookieStore.set("session", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24,
			path: "/",
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to create session:", error);
		return { success: false, error: "Failed to create session" };
	}
}
