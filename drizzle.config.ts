import "@/lib/drizzle/envConfig";
import { defineConfig } from "drizzle-kit";

const url = process.env.POSTGRES_URL;
if (!url) {
	throw new Error("POSTGRES_URL is not defined");
}

export default defineConfig({
	out: "./lib/drizzle/migrations",
	schema: "./lib/drizzle/schemas/*.ts",
	dialect: "postgresql",
	dbCredentials: {
		url,
	},
});
