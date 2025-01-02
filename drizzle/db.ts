import "@/drizzle/envConfig";
import { sql } from "@vercel/postgres";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";

class CustomLogger implements Logger {
	private transactionDepth = 0;
	private queryStartTime: number | null = null;
	private transactionStartTime: number | null = null;
	private lastQueryEndTime: number | null = null;
	private queryCount = 0;
	private totalParams = 0;
	private totalJoins = 0;
	private totalConditions = 0;
	private queryTypes: Record<string, number> = {};
	private recordCounts: Record<string, number> = {};

	private formatDuration(startTime: number) {
		const duration = performance.now() - startTime;
		return `${duration.toFixed(2)}ms`;
	}

	logQuery(query: string, params: unknown[]) {
		const currentTime = performance.now();
		this.queryCount++;
		this.totalParams += params.length;

		// Start timing this query
		this.queryStartTime = currentTime;

		// Check if this is a transaction query
		if (query.toLowerCase().includes("begin")) {
			this.transactionDepth++;
			this.transactionStartTime = currentTime;
			this.queryCount = 0;
			this.totalParams = 0;
			this.totalJoins = 0;
			this.totalConditions = 0;
			this.queryTypes = {};
			this.recordCounts = {};
			console.log(`\n🔄 Transaction #${this.transactionDepth} Started`);
			return;
		}

		// Calculate query complexity
		const joins = (query.match(/join/gi) || []).length;
		const conditions = (query.match(/where|and|or/gi) || []).length;
		this.totalJoins += joins;
		this.totalConditions += conditions;

		// Track query types
		const queryType = query.split(" ")[0].toUpperCase();
		this.queryTypes[queryType] = (this.queryTypes[queryType] || 0) + 1;

		const duration = this.queryStartTime
			? this.formatDuration(this.queryStartTime)
			: "N/A";

		// Only log stats for non-transaction-control queries
		if (
			!query.toLowerCase().includes("commit") &&
			!query.toLowerCase().includes("rollback")
		) {
			console.log(`
📊 Query #${this.queryCount}:
SQL: ${query}
Params: ${JSON.stringify(params)}
Type: ${queryType}
Joins: ${joins}
Conditions: ${conditions}
Duration: ${duration}
`);
		}

		// Check if this is the end of a transaction
		if (
			query.toLowerCase().includes("commit") ||
			query.toLowerCase().includes("rollback")
		) {
			const totalDuration = this.transactionStartTime
				? this.formatDuration(this.transactionStartTime)
				: "N/A";

			const queryTypeSummary = Object.entries(this.queryTypes)
				.map(([type, count]: [string, number]) => `- ${type}: ${count}`)
				.join("\n");

			console.log(`
✨ Transaction Summary:
📈 Performance:
- Total Duration: ${totalDuration}
- Queries: ${this.queryCount}
- Parameters: ${this.totalParams}
- Joins: ${this.totalJoins}
- Conditions: ${this.totalConditions}

📊 Query Types:
${queryTypeSummary}
`);

			this.transactionDepth--;
			this.transactionStartTime = null;
			this.lastQueryEndTime = null;
			this.queryCount = 0;
			this.totalParams = 0;
			this.totalJoins = 0;
			this.totalConditions = 0;
			this.queryTypes = {};
			this.recordCounts = {};
		}

		this.lastQueryEndTime = performance.now();
		this.queryStartTime = null;
	}
}

export const db = drizzle(sql, {
	logger:
		process.env.NODE_ENV === "production" ? undefined : new CustomLogger(),
});
