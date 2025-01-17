import { describe, expect, test } from "bun:test";
import {
	createTestUser,
	withTestTransaction,
} from "@/drizzle/core/__tests__/utils";
import { users } from "@/drizzle/core/schemas/users";
import { and, eq } from "drizzle-orm";
import { createCycle } from "../functions/cycles/createCycle";
import {
	exerciseDefinitions,
	exercises,
	oneRepMaxes,
	sets,
	workouts,
} from "../schemas";
import { Status } from "../schemas/types";

describe("Cycle Creation", () => {
	test("should create a cycle with workouts, exercises, and sets", async () => {
		await withTestTransaction(async (tx) => {
			// Create a test user
			const testUser = createTestUser();
			const [user] = await tx.insert(users).values(testUser).returning();

			// Get existing squat exercise definition
			const [squat] = await tx
				.select()
				.from(exerciseDefinitions)
				.where(
					and(
						eq(exerciseDefinitions.name, "Squat"),
						eq(exerciseDefinitions.type, "primary"),
					),
				);

			// Create one rep max for squat
			await tx.insert(oneRepMaxes).values({
				userId: user.id,
				exerciseDefinitionId: squat.id,
				weight: 225,
			});

			// Create cycle
			const cycle = await createCycle({ userId: user.id, tx });
			expect(cycle).toBeDefined();
			expect(cycle.status).toBe(Status.Pending);

			// Verify workouts were created
			const cycleWorkouts = await tx
				.select()
				.from(workouts)
				.where(eq(workouts.cycleId, cycle.id));

			expect(cycleWorkouts).toHaveLength(16);
			expect(cycleWorkouts[0].status).toBe(Status.Pending);
			expect(cycleWorkouts[0].primaryLift).toBe("squat");

			// Verify exercises were created for first workout
			const workoutExercises = await tx
				.select()
				.from(exercises)
				.where(eq(exercises.workoutId, cycleWorkouts[0].id));

			expect(workoutExercises).toHaveLength(6); // Each workout has 6 exercises
			expect(workoutExercises[0].status).toBe(Status.Pending);

			// Verify sets were created for first exercise
			const exerciseSets = await tx
				.select()
				.from(sets)
				.where(eq(sets.exerciseId, workoutExercises[0].id));

			expect(exerciseSets.length).toBeGreaterThan(0);
			expect(exerciseSets[0].status).toBe(Status.Pending);
			expect(exerciseSets[0].weight).toBeGreaterThan(0);
		});
	});
});
