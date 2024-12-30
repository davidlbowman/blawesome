"use server";

import { db } from "@/lib/drizzle/db";
import { users } from "@/lib/drizzle/schemas/users";

export async function createRootUser() {
	try {
		const email = process.env.ROOT_USER;
		const password = process.env.ROOT_PASSWORD;

		if (!email || !password) {
			throw new Error(
				"ROOT_USER and ROOT_PASSWORD must be set in environment variables",
			);
		}

		const hash = await Bun.password.hash(password, {
			algorithm: "bcrypt",
		});

		const user = await db.insert(users).values({
			email,
			password: hash,
		});

		return { success: true, data: user };
	} catch (error) {
		console.error("Error creating root user:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to create root user",
		};
	}
}

// createRootUser()
// 	.then((user) => {
// 		console.log("Root user created successfully:", user);
// 		process.exit(0);
// 	})
// 	.catch((error) => {
// 		console.error("Failed to create root user:", error);
// 		process.exit(1);
// 	});
