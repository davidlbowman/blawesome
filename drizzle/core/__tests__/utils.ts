import { db, type DrizzleTransaction } from "@/drizzle/db";
import { faker } from "@faker-js/faker";
import type { User } from "../schemas/users";

export async function withTestTransaction<T>(
	callback: (tx: DrizzleTransaction) => Promise<T>,
): Promise<T> {
	return await db
		.transaction(async (tx) => {
			const result = await callback(tx);
			// Always rollback in test environment
			throw { message: "ROLLBACK_TEST_TRANSACTION", result } as const;
		})
		.catch((e: { message: string; result: T }) => {
			if (e.message === "ROLLBACK_TEST_TRANSACTION") {
				return e.result;
			}
			throw e;
		});
}

export function createTestUser({
	id = faker.string.uuid(),
}: {
	id?: string;
} = {}): User {
	return {
		id,
		email: faker.internet.email(),
		password: faker.internet.password(),
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}
