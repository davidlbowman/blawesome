import { describe, expect, test } from "bun:test";
import bcrypt from "bcrypt";
import { verifyUser } from "../functions/users/verifyUser";
import { users } from "../schemas/users";
import { createTestUser, withTestTransaction } from "./utils";

describe("User Authentication", () => {
	test("should verify user with correct credentials", async () => {
		await withTestTransaction(async (tx) => {
			const password = "test-password";
			const hashedPassword = await bcrypt.hash(password, 10);

			const testUser = createTestUser();
			testUser.password = hashedPassword;

			// Insert test user
			const [createdUser] = await tx.insert(users).values(testUser).returning();

			// Verify with correct password
			const verifiedUser = await verifyUser({
				email: testUser.email,
				password: password,
				tx,
			});

			expect(verifiedUser).toBeDefined();
			expect(verifiedUser.id).toBe(createdUser.id);
			expect(verifiedUser.email).toBe(createdUser.email);
		});
	});

	test("should throw error for non-existent user", async () => {
		await withTestTransaction(async (tx) => {
			await expect(
				verifyUser({
					email: "nonexistent@example.com",
					password: "any-password",
					tx,
				}),
			).rejects.toThrow("User not found");
		});
	});

	test("should throw error for incorrect password", async () => {
		await withTestTransaction(async (tx) => {
			const password = "correct-password";
			const hashedPassword = await bcrypt.hash(password, 10);

			const testUser = createTestUser();
			testUser.password = hashedPassword;

			// Insert test user
			await tx.insert(users).values(testUser).returning();

			// Verify with wrong password
			await expect(
				verifyUser({
					email: testUser.email,
					password: "wrong-password",
					tx,
				}),
			).rejects.toThrow("Invalid password");
		});
	});
});
