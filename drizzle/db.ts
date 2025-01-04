import "@/drizzle/envConfig";
import { createClient } from "@libsql/client";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

export class CustomLogger implements Logger {
	logQuery(query: string, params: unknown[]) {
		const start = performance.now();

		// Use setTimeout to ensure we measure after the query executes
		setTimeout(() => {
			const duration = performance.now() - start;
			const queryType = query.split(" ")[0].toUpperCase();
			const joinCount = (query.match(/join/gi) || []).length;
			const conditionCount = (query.match(/where|having|on/gi) || []).length;

			console.log(`\n📊 Query:
				SQL: ${query}
				Params: ${JSON.stringify(params)}
				Type: ${queryType}
				Joins: ${joinCount}
				Conditions: ${conditionCount}
				Duration: ${duration.toFixed(2)}ms`);
		}, 0);
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
