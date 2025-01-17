import { type Mock, describe, expect, mock, test } from "bun:test";
import { withTestTransaction } from "@/__tests__/utils";
import { createUser } from "@/drizzle/core/functions/users/createUser";
import { createUserSession } from "@/drizzle/core/functions/users/createUserSession";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { logoutUser } from "@/drizzle/core/functions/users/logoutUser";
import { verifyUser } from "@/drizzle/core/functions/users/verifyUser";
import { faker } from "@faker-js/faker";
import type { RequestCookies } from "next/dist/server/web/spec-extension/cookies";

type RequestCookie = {
	name: string;
	value: string;
};

// Mock Next.js cookies
const cookieStore = {
	get: mock((name: string): RequestCookie | undefined => ({
		name,
		value: "",
	})),
	getAll: mock((): RequestCookie[] => []),
	set: mock((_name: string, _value: string): RequestCookies => cookieStore),
	delete: mock((_name: string): boolean => true),
	has: mock((_name: string): boolean => false),
	clear: mock((): RequestCookies => cookieStore),
	size: 0,
	[Symbol.iterator]: function* () {
		yield* [];
	},
} as unknown as RequestCookies;

// Mock Next.js headers cookies() function
mock.module("next/headers", () => ({
	cookies: () => cookieStore,
}));

describe("User Authentication Flow", () => {
	test("should handle complete user journey from registration through logout", async () => {
		await withTestTransaction(async (tx) => {
			// 1. Create User
			const email = faker.internet.email();
			const password = faker.internet.password();

			const user = await createUser({
				email,
				password,
				tx,
			});

			expect(user.email).toBe(email);
			expect(user.password).not.toBe(password); // Should be hashed

			// Test duplicate user
			await expect(
				createUser({
					email,
					password,
					tx,
				}),
			).rejects.toThrow("User already exists");

			// 2. Verify User
			const verifiedUser = await verifyUser({
				email,
				password,
				tx,
			});

			expect(verifiedUser.id).toBe(user.id);

			// Test invalid password
			await expect(
				verifyUser({
					email,
					password: faker.internet.password(),
					tx,
				}),
			).rejects.toThrow("Invalid password");

			// Test non-existent user
			await expect(
				verifyUser({
					email: faker.internet.email(),
					password,
					tx,
				}),
			).rejects.toThrow("User not found");

			// 3. Create User Session
			const sessionResult = await createUserSession(verifiedUser);
			expect(sessionResult.success).toBe(true);
			expect(cookieStore.set).toHaveBeenCalled();

			// Mock session token for getUserId
			const sessionToken = `header.${Buffer.from(JSON.stringify({ id: user.id })).toString("base64")}.signature`;
			const getMock = cookieStore.get as Mock<typeof cookieStore.get>;
			getMock.mockImplementation((name: string): RequestCookie | undefined =>
				name === "session" ? { name, value: sessionToken } : undefined,
			);

			// 4. Get User ID from Session
			const userId = await getUserId({ tx });
			expect(userId).toBe(user.id);

			// 5. Logout User
			const logoutResult = await logoutUser();
			expect(logoutResult.success).toBe(true);
			expect(cookieStore.delete).toHaveBeenCalledWith("session");

			// Verify session is invalidated
			getMock.mockImplementation(() => undefined);
			await expect(getUserId({ tx })).rejects.toThrow("Not authenticated");
		});
	});
});
