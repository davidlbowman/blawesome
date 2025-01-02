import "@/drizzle/envConfig";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

export const db = drizzle(sql, {
	logger: {
		logQuery(query: string, params: unknown[]) {
			console.log("Query:", query);
			console.log("Params:", params);
			console.log("-------------------");
		},
	},
});
