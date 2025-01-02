import "@/drizzle/envConfig";
import { createClient } from "@libsql/client";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

export class CustomLogger implements Logger {
	private queryStartTime: number | null = null;

	logQuery(query: string, _params: unknown[]) {
		if (!this.queryStartTime) {
			this.queryStartTime = performance.now();
			return;
		}

		const duration = performance.now() - this.queryStartTime;
		this.queryStartTime = null;

		const queryType = query.split(" ")[0].toUpperCase();
		const joinCount = (query.match(/join/gi) || []).length;
		const conditionCount = (query.match(/where|having|on/gi) || []).length;

		console.log(`\n📊 Query:
                    SQL: ${query.split("(")[0].trim()}...
                    Type: ${queryType}
                    Joins: ${joinCount}
                    Conditions: ${conditionCount}
                    Duration: ${duration.toFixed(2)}ms`);
	}
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
	throw new Error("DATABASE_URL is not defined");
}

const client = createClient({
	url: dbUrl,
	authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, {
	logger:
		process.env.NODE_ENV === "production" ? undefined : new CustomLogger(),
});
