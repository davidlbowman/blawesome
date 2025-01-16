import { describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { exerciseDefinitions } from "../schemas";
import { createTestExerciseDefinition, withTestTransaction } from "./utils";

describe("Exercise Definitions", () => {
	test("should create and retrieve an exercise definition", async () => {
		await withTestTransaction(async (tx) => {
			// Create test data
			const definition = createTestExerciseDefinition();

			// Insert
			await tx.insert(exerciseDefinitions).values(definition);

			// Retrieve
			if (!definition.id) throw new Error("Definition ID is required");
			const retrieved = await tx
				.select()
				.from(exerciseDefinitions)
				.where(eq(exerciseDefinitions.id, definition.id))
				.get();

			// Assertions
			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(definition.id);
			expect(retrieved?.name).toBe(definition.name);
			expect(retrieved?.type).toBe(definition.type);
			expect(retrieved?.category).toBe(definition.category);
			expect(retrieved?.primaryLiftDay).toBe(definition.primaryLiftDay);
			expect(retrieved?.rpeMax).toBe(definition.rpeMax);
			expect(retrieved?.repMax).toBe(definition.repMax);
		});
	});
});
