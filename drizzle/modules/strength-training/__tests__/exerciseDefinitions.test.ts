import { describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { exerciseDefinitions } from "../schemas";
import { ExerciseType, ExerciseCategory, PrimaryLift } from "../schemas/types";
import { createTestExerciseDefinition, withTestTransaction } from "./utils";

describe("Exercise Definitions", () => {
	test("should create and retrieve an exercise definition", async () => {
		await withTestTransaction(async (tx) => {
			// Create test data with explicit types
			const definition = createTestExerciseDefinition({
				type: ExerciseType.Primary,
				category: ExerciseCategory.MainLift,
				primaryLiftDay: "squat",
				rpeMax: 8,
				repMax: 5,
			});

			// Insert
			await tx.insert(exerciseDefinitions).values({
				...definition,
				type: ExerciseType.Primary,
				category: ExerciseCategory.MainLift,
				primaryLiftDay: PrimaryLift.Squat,
			});

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
			expect(retrieved?.type).toBe(ExerciseType.Primary);
			expect(retrieved?.category).toBe(ExerciseCategory.MainLift);
			expect(retrieved?.primaryLiftDay).toBe(PrimaryLift.Squat);
			expect(retrieved?.rpeMax).toBe(8);
			expect(retrieved?.repMax).toBe(5);
		});
	});
});
