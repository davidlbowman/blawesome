import { db } from "@/drizzle/db";
import type { DrizzleTransaction } from "@/drizzle/db";

/**
 * Executes a callback within a transaction that always rolls back.
 * Perfect for testing database operations without persisting changes.
 */
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
