import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const DATA_DIR = join(process.cwd(), "data");
const MIGRATIONS_DIR = join(process.cwd(), "drizzle", "migrations");

// Run migrations
async function main() {
	try {
		// Ensure data directory exists
		await mkdir(DATA_DIR, { recursive: true });

		// Create SQLite database
		console.log("Creating database connection...");
		const client = createClient({
			url: `file:${join(DATA_DIR, "db.sqlite")}`,
		});
		const db = drizzle(client);

		console.log("Running migrations...");
		await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
		console.log("Migrations completed successfully!");

		// Close the database connection
		await client.close();
		process.exit(0);
	} catch (error) {
		console.error("Error running migrations:", error);
		process.exit(1);
	}
}

main();
