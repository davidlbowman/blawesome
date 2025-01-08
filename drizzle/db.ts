import "@/drizzle/envConfig";
import { createClient } from "@libsql/client";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

export class CustomLogger implements Logger {
	private queryCount = 0;
	private transactionDepth = 0;
	private transactionStart = 0;

	logQuery(query: string, params: unknown[]) {
		const start = performance.now();
		this.queryCount++;

		if (query.toLowerCase().includes("begin")) {
			this.transactionDepth++;
			this.transactionStart = start;
			console.log("\n🔄 Transaction Started\n");
			return;
		}

		if (
			query.toLowerCase().includes("commit") ||
			query.toLowerCase().includes("rollback")
		) {
			const transactionDuration = performance.now() - this.transactionStart;
			console.log(
				`\n✅ Transaction ${query.toLowerCase().includes("commit") ? "Committed" : "Rolled Back"}`,
			);
			console.log(
				`📊 Transaction Stats:
				Queries: ${this.queryCount}
				Duration: ${transactionDuration.toFixed(2)}ms
				Avg Query: ${(transactionDuration / this.queryCount).toFixed(2)}ms\n`,
			);
			this.queryCount = 0;
			this.transactionDepth--;
			return;
		}

		setTimeout(() => {
			const duration = performance.now() - start;
			const queryType = query.split(" ")[0].toUpperCase();
			const joinCount = (query.match(/join/gi) || []).length;
			const conditionCount = (query.match(/where|having|on/gi) || []).length;
			const tableCount = (query.match(/from|join|update|into/gi) || []).length;

			const durationColor = duration < 5 ? "🟢" : duration < 10 ? "🟡" : "🔴";
			const stats = `Type: ${queryType} | Tables: ${tableCount} | Joins: ${joinCount} | Conditions: ${conditionCount}`;

			const output = [
				`\n${durationColor} Query #${this.queryCount}:`,
				stats,
				`Duration: ${duration.toFixed(2)}ms`,
				`SQL: ${query.replace(/\s+/g, " ")}`,
				`Params: ${JSON.stringify(params)}`,
			].join("\n");

			console.log(output);

			const warnings = [];
			if (joinCount > 2) warnings.push("High joins");
			if (duration > 10) warnings.push("Slow query");
			if (
				!query.toLowerCase().includes("where") &&
				["update", "delete"].includes(queryType.toLowerCase())
			) {
				warnings.push("No WHERE clause");
			}
			if (warnings.length > 0) {
				console.log(`⚠️  ${warnings.join(" | ")}\n`);
			} else {
				console.log("");
			}
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
