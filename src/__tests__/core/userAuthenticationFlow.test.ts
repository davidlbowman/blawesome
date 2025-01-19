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

			const userResponse = await createUser({
				user: { email, password },
				tx,
			});

			expect(userResponse.success).toBe(true);
			if (!userResponse.success || !userResponse.data) {
				throw new Error("Failed to create user");
			}

			const user = userResponse.data;
			expect(user.email).toBe(email);

			// Test duplicate user
			const duplicateResult = await createUser({
				user: { email, password },
				tx,
			});
			expect(duplicateResult.success).toBe(false);
			if (duplicateResult.success) {
				throw new Error("Should not succeed with duplicate user");
			}
			expect(duplicateResult.error.message).toBe("User already exists");

			// 2. Verify User
			const verifyResult = await verifyUser({
				user: { email, password },
				tx,
			});

			expect(verifyResult.success).toBe(true);
			if (!verifyResult.success || !verifyResult.data) {
				throw new Error("Failed to verify user");
			}

			const verifiedUser = verifyResult.data;
			expect(verifiedUser.id).toBe(user.id);

			// Test invalid password
			const invalidPasswordResult = await verifyUser({
				user: { email, password: faker.internet.password() },
				tx,
			});
			expect(invalidPasswordResult.success).toBe(false);
			if (invalidPasswordResult.success) {
				throw new Error("Should not succeed with invalid password");
			}
			expect(invalidPasswordResult.error.message).toBe("Invalid password");

			// Test non-existent user
			const nonExistentResult = await verifyUser({
				user: { email: faker.internet.email(), password },
				tx,
			});
			expect(nonExistentResult.success).toBe(false);
			if (nonExistentResult.success) {
				throw new Error("Should not succeed with non-existent user");
			}
			expect(nonExistentResult.error.message).toBe("User not found");

			// 3. Create User Session
			const sessionResult = await createUserSession({
				user: { id: verifiedUser.id, email: user.email },
			});
			expect(sessionResult.success).toBe(true);
			expect(cookieStore.set).toHaveBeenCalled();

			// Mock session token for getUserId
			const sessionToken = `header.${Buffer.from(JSON.stringify({ id: user.id })).toString("base64")}.signature`;
			const getMock = cookieStore.get as Mock<typeof cookieStore.get>;
			getMock.mockImplementation((name: string): RequestCookie | undefined =>
				name === "session" ? { name, value: sessionToken } : undefined,
			);

			// 4. Get User ID from Session
			const userIdResult = await getUserId({ tx });
			expect(userIdResult.success).toBe(true);
			if (!userIdResult.success || !userIdResult.data) {
				throw new Error("Failed to get user ID");
			}
			expect(userIdResult.data.id).toBe(user.id);

			// 5. Logout User
			const logoutResult = await logoutUser();
			expect(logoutResult.success).toBe(true);
			expect(cookieStore.delete).toHaveBeenCalledWith("session");

			// Verify session is invalidated
			getMock.mockImplementation(() => undefined);
			const invalidatedResult = await getUserId({ tx });
			expect(invalidatedResult.success).toBe(false);
			if (invalidatedResult.success) {
				throw new Error("Should fail with invalid session");
			}
			expect(invalidatedResult.error.message).toBe("Not authenticated");
		});
	});
});
