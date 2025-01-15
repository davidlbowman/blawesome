import "@/drizzle/envConfig";
import { createClient } from "@libsql/client";
import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

interface QueryMetrics {
	type: string;
	tables: number;
	joins: number;
	conditions: number;
	duration: number;
}

export class CustomLogger implements Logger {
	private queryCount = 0;
	private transactionDepth = 0;
	private transactionStart = 0;
	private batchOperations = new Map<
		string,
		{ count: number; totalParams: number }
	>();
	private slowQueryThreshold = 10; // ms

	private formatQuery(query: string): string {
		return query.replace(/\s+/g, " ").trim();
	}

	private analyzeQuery(query: string): QueryMetrics {
		const type = query.split(" ")[0].toUpperCase();
		return {
			type,
			tables: (query.match(/from|join|update|into/gi) || []).length,
			joins: (query.match(/join/gi) || []).length,
			conditions: (query.match(/where|having|on/gi) || []).length,
			duration: 0, // Will be set later
		};
	}

	private getOptimizationTips(query: string, metrics: QueryMetrics): string[] {
		const tips: string[] = [];

		if (metrics.joins > 2) {
			tips.push("Consider denormalizing or using subqueries for complex joins");
		}

		if (metrics.duration > this.slowQueryThreshold) {
			tips.push("Query exceeds performance threshold");
		}

		if (
			!query.toLowerCase().includes("where") &&
			["UPDATE", "DELETE"].includes(metrics.type)
		) {
			tips.push("Missing WHERE clause in modification query");
		}

		return tips;
	}

	private handleBatchOperation(type: string, paramsCount: number) {
		const current = this.batchOperations.get(type) || {
			count: 0,
			totalParams: 0,
		};
		this.batchOperations.set(type, {
			count: current.count + 1,
			totalParams: current.totalParams + paramsCount,
		});
	}

	private isBatchOperation(params: unknown[]): boolean {
		return params.length > 10;
	}

	logQuery(query: string, params: unknown[]): void {
		const start = performance.now();
		this.queryCount++;
		const formattedQuery = this.formatQuery(query);

		// Handle transaction boundaries
		if (formattedQuery.toLowerCase().includes("begin")) {
			this.transactionDepth++;
			this.transactionStart = start;
			console.log("\n📦 Transaction Started");
			return;
		}

		if (
			formattedQuery.toLowerCase().includes("commit") ||
			formattedQuery.toLowerCase().includes("rollback")
		) {
			const duration = performance.now() - this.transactionStart;
			const status = formattedQuery.toLowerCase().includes("commit")
				? "Committed"
				: "Rolled Back";

			console.log(
				`\n${status === "Committed" ? "✅" : "❌"} Transaction ${status}`,
			);
			console.log("📊 Stats:");
			console.log(`Queries: ${this.queryCount}`);
			console.log(`Duration: ${duration.toFixed(2)}ms`);
			console.log(`Avg Query: ${(duration / this.queryCount).toFixed(2)}ms`);
			console.log(
				`Batch Operations: ${JSON.stringify(Object.fromEntries(this.batchOperations))}\n`,
			);

			// Reset transaction state
			this.queryCount = 0;
			this.transactionDepth--;
			this.batchOperations.clear();
			return;
		}

		// Handle regular queries
		setTimeout(() => {
			const duration = performance.now() - start;
			const metrics = this.analyzeQuery(formattedQuery);
			metrics.duration = duration;

			if (this.isBatchOperation(params)) {
				this.handleBatchOperation(metrics.type, params.length);
				console.log(`🔄 Batch ${metrics.type}: ${params.length} parameters`);
				return;
			}

			const durationIndicator =
				duration < 5 ? "🟢" : duration < 10 ? "🟡" : "🔴";
			const tips = this.getOptimizationTips(formattedQuery, metrics);

			console.log(`\n${durationIndicator} Query #${this.queryCount}`);
			console.log(
				`Type: ${metrics.type} | Tables: ${metrics.tables} | Joins: ${metrics.joins} | Conditions: ${metrics.conditions}`,
			);
			console.log(`Duration: ${duration.toFixed(2)}ms`);
			console.log(`SQL: ${formattedQuery}`);
			console.log(`Params: ${JSON.stringify(params)}`);

			if (tips.length > 0) {
				console.log(`⚠️  ${tips.join(" | ")}\n`);
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
