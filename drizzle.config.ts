import "@/drizzle/envConfig";
import { defineConfig } from "drizzle-kit";

const url = process.env.POSTGRES_URL;
if (!url) {
	throw new Error("POSTGRES_URL is not defined");
}

export default defineConfig({
	out: "./drizzle/migrations",
	schema: "./drizzle/**/schemas/*.ts",
	dialect: "postgresql",
	dbCredentials: {
		url,
	},
});
