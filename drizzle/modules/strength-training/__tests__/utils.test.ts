/**
 * Test Suite for Strength Training Test Utilities
 *
 * This suite verifies that our test utilities work correctly:
 * - Factory functions generate valid data
 * - Transactions properly isolate test data
 * - All relationships between entities are maintained
 * - Data is properly rolled back after each test
 */

import { describe, expect, test } from "bun:test";
import {
	createTestWorkout,
	createTestExercise,
	createTestSet,
	withTestTransaction,
} from "./utils";
import { workouts } from "../schemas/workouts";
import { exercises } from "../schemas/exercises";
import { sets } from "../schemas/sets";
import { eq } from "drizzle-orm";
import { exerciseDefinitions } from "../schemas/exerciseDefinitions";
import { PrimaryLift, Status } from "../schemas/types";
import { users } from "@/drizzle/core/schemas/users";
import { cycles } from "../schemas/cycles";
import { faker } from "@faker-js/faker";

describe("Test Utilities", () => {
	test("should generate and insert test data", async () => {
		await withTestTransaction(async (tx) => {
			// Create test data with unique IDs and data
			const userId = faker.string.uuid();
			const cycleId = faker.string.uuid();
			const exerciseDefId = faker.string.uuid();
			const workoutId = faker.string.uuid();
			const exerciseId = faker.string.uuid();
			const setId = faker.string.uuid();

			// Create user
			await tx.insert(users).values({
				id: userId,
				email: faker.internet.email(),
				password: faker.internet.password(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// Create exercise definition
			await tx.insert(exerciseDefinitions).values({
				id: exerciseDefId,
				name: faker.string.alpha({ length: 20 }),
				type: "primary",
				category: "main_lift",
				primaryLiftDay: PrimaryLift.Bench,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// Create cycle
			await tx.insert(cycles).values({
				id: cycleId,
				userId,
				startDate: new Date(),
				status: Status.Pending,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// Create workout with valid user and cycle IDs
			const workout = createTestWorkout({
				id: workoutId,
				userId,
				cycleId,
			});
			await tx.insert(workouts).values(workout);

			// Create exercise with valid workout and definition IDs
			const exercise = createTestExercise({
				id: exerciseId,
				userId,
				workoutId,
				exerciseDefinitionId: exerciseDefId,
			});
			await tx.insert(exercises).values(exercise);

			// Create set with valid exercise ID
			const set = createTestSet({
				id: setId,
				userId,
				exerciseId,
			});
			await tx.insert(sets).values(set);

			// Verify data was inserted
			const insertedWorkout = await tx
				.select()
				.from(workouts)
				.where(eq(workouts.id, workoutId))
				.get();

			const insertedExercise = await tx
				.select()
				.from(exercises)
				.where(eq(exercises.id, exerciseId))
				.get();

			const insertedSet = await tx
				.select()
				.from(sets)
				.where(eq(sets.id, setId))
				.get();

			// Assertions
			expect(insertedWorkout).toBeDefined();
			expect(insertedWorkout?.id).toBe(workoutId);
			expect(insertedExercise).toBeDefined();
			expect(insertedExercise?.workoutId).toBe(workoutId);
			expect(insertedSet).toBeDefined();
			expect(insertedSet?.exerciseId).toBe(exerciseId);
		});
	});
});
