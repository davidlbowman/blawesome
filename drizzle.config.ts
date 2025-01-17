import "@/drizzle/envConfig";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) {
	throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
	out: "./src/drizzle/migrations",
	schema: "./src/drizzle/**/schemas/*.ts",
	dialect: "sqlite",
	dbCredentials: {
		url,
	},
});
