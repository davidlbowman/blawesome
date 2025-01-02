import "@/drizzle/envConfig";
import { sql } from "@vercel/postgres";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";

class CustomLogger implements Logger {
	private transactionDepth = 0;
	private queryStartTime: number | null = null;
	private transactionStartTime: number | null = null;
	private lastQueryEndTime: number | null = null;

	private getTimestamp() {
		return new Date().toISOString();
	}

	private formatDuration(startTime: number) {
		const duration = performance.now() - startTime;
		return `${duration.toFixed(2)}ms`;
	}

	private formatGap(start: number, end: number) {
		const gap = end - start;
		return gap > 1 ? `+${gap.toFixed(2)}ms gap` : undefined;
	}

	logQuery(query: string, params: unknown[]) {
		const currentTime = performance.now();

		// Calculate gap from last query if within transaction
		const gap =
			this.lastQueryEndTime && this.transactionDepth > 0
				? this.formatGap(this.lastQueryEndTime, currentTime)
				: undefined;

		// Start timing this query
		this.queryStartTime = currentTime;

		// Check if this is a transaction query
		if (query.toLowerCase().includes("begin")) {
			this.transactionDepth++;
			this.transactionStartTime = currentTime;
			console.log(
				"\n\x1b[34m%s\x1b[0m",
				`🔄 Transaction #${this.transactionDepth} Started`,
			);
			console.log("\x1b[34m%s\x1b[0m", `┌${"─".repeat(48)}`);
		}

		// Add indentation for transaction queries
		const indent = this.transactionDepth > 0 ? "│ " : "";

		// Log the timestamp and query
		console.log(
			"\x1b[36m%s\x1b[0m",
			`${indent}[${this.getTimestamp()}] 🔍 Query:${gap ? ` (${gap})` : ""}`,
		);
		console.log("\x1b[33m%s\x1b[0m", `${indent}${query}`);

		if (params.length) {
			console.log("\x1b[35m%s\x1b[0m", `${indent}Parameters:`);
			console.log(indent, params);
		}

		// Calculate query complexity
		const joins = (query.match(/join/gi) || []).length;
		const conditions = (query.match(/where|and|or/gi) || []).length;
		const orderBy = (query.match(/order\s+by/gi) || []).length;
		const isSelect = query.toLowerCase().includes("select");

		// Log analysis with timing
		const duration = this.queryStartTime
			? this.formatDuration(this.queryStartTime)
			: "N/A";
		console.log("\x1b[32m%s\x1b[0m", `${indent}Query Analysis:`, {
			type: isSelect ? "SELECT" : query.split(" ")[0].toUpperCase(),
			joins,
			conditions,
			orderBy,
			paramCount: params.length,
			duration,
		});

		// Check if this is the end of a transaction
		if (
			query.toLowerCase().includes("commit") ||
			query.toLowerCase().includes("rollback")
		) {
			const totalDuration = this.transactionStartTime
				? this.formatDuration(this.transactionStartTime)
				: "N/A";

			console.log("\x1b[34m%s\x1b[0m", `└${"─".repeat(48)}`);
			console.log(
				"\x1b[34m%s\x1b[0m",
				`✅ Transaction #${this.transactionDepth} Completed (Total: ${totalDuration})\n`,
			);
			this.transactionDepth--;
			this.transactionStartTime = null;
			this.lastQueryEndTime = null;
		} else {
			console.log(`${indent}${"─".repeat(48)}`);
		}

		// Update last query time
		this.lastQueryEndTime = performance.now();
		this.queryStartTime = null;
	}
}

export const db = drizzle(sql, {
	logger:
		process.env.NODE_ENV === "production" ? undefined : new CustomLogger(),
});
