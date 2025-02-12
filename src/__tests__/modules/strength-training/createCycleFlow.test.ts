import { describe, expect, test } from "bun:test";
import { withTestTransaction } from "@/__tests__/utils";
import { createUser } from "@/drizzle/core/functions/users/createUser";
import { createCycle } from "@/drizzle/modules/strength-training/functions/cycles/createCycle";
import { exerciseDefinitions } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { exercises } from "@/drizzle/modules/strength-training/schemas/exercises";
import { oneRepMaxes } from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import { sets } from "@/drizzle/modules/strength-training/schemas/sets";
import { workouts } from "@/drizzle/modules/strength-training/schemas/workouts";
import {
	ExerciseType,
	PrimaryLift,
	Status,
} from "@/drizzle/modules/strength-training/types";
import { roundDownToNearest5 } from "@/drizzle/modules/strength-training/utils/math";
import { faker } from "@faker-js/faker";
import { and, eq } from "drizzle-orm";

describe("Cycle Creation Flow", () => {
	test("should create a complete cycle with workouts, exercises, and sets", async () => {
		await withTestTransaction(async (tx) => {
			// 1. Create a test user
			const userResponse = await createUser({
				user: {
					email: faker.internet.email(),
					password: faker.internet.password(),
				},
				tx,
			});

			if (!userResponse.success || !userResponse.data) {
				throw new Error("Failed to create user");
			}

			const user = userResponse.data;

			// 2. Insert test one rep maxes for primary lifts
			const primaryExerciseDefinitions = await tx
				.select()
				.from(exerciseDefinitions)
				.where(eq(exerciseDefinitions.type, ExerciseType.Enum.primary));

			await Promise.all(
				primaryExerciseDefinitions.map((def) =>
					tx.insert(oneRepMaxes).values({
						userId: user.id,
						exerciseDefinitionId: def.id,
						weight: faker.number.int({ min: 100, max: 400 }),
						createdAt: new Date(),
						updatedAt: new Date(),
					}),
				),
			);

			// 3. Create cycle
			const cycleResponse = await createCycle({
				user: { id: user.id },
				tx,
			});

			if (!cycleResponse.success || !cycleResponse.data) {
				throw new Error("Failed to create cycle");
			}

			const cycle = cycleResponse.data;

			// 4. Verify cycle was created
			expect(cycle.userId).toBe(user.id);
			expect(cycle.status).toBe(Status.Enum.pending);
			expect(cycle.startDate).toBeDefined();

			// 5. Verify workouts were created
			const cycleWorkouts = await tx
				.select()
				.from(workouts)
				.where(eq(workouts.cycleId, cycle.id));

			expect(cycleWorkouts).toHaveLength(16); // 4 weeks * 4 workouts
			expect(cycleWorkouts[0].status).toBe(Status.Enum.pending);
			expect(cycleWorkouts[0].primaryLift).toBeDefined();

			// 6. Verify exercises were created
			const workoutExercises = await tx
				.select()
				.from(exercises)
				.where(eq(exercises.workoutId, cycleWorkouts[0].id));

			expect(workoutExercises).toHaveLength(6); // 6 exercises per workout
			expect(workoutExercises[0].status).toBe(Status.Enum.pending);
			expect(workoutExercises[0].order).toBe(1);

			// 7. Verify sets were created
			const exerciseSets = await tx
				.select()
				.from(sets)
				.where(eq(sets.exerciseId, workoutExercises[0].id));

			expect(exerciseSets.length).toBeGreaterThan(0);
			expect(exerciseSets[0].status).toBe(Status.Enum.pending);
			expect(exerciseSets[0].weight).toBeGreaterThan(0);
			expect(exerciseSets[0].reps).toBeGreaterThan(0);
			expect(exerciseSets[0].rpe).toBeGreaterThan(0);
		});
	});

	test("should calculate correct weights based on one rep maxes", async () => {
		await withTestTransaction(async (tx) => {
			// 1. Create a test user
			const userResponse = await createUser({
				user: {
					email: faker.internet.email(),
					password: faker.internet.password(),
				},
				tx,
			});

			if (!userResponse.success || !userResponse.data) {
				throw new Error("Failed to create user");
			}

			const user = userResponse.data;

			// 2. Get a primary lift exercise definition (e.g., Squat)
			const [squatDefinition] = await tx
				.select()
				.from(exerciseDefinitions)
				.where(
					and(
						eq(exerciseDefinitions.type, ExerciseType.Enum.primary),
						eq(exerciseDefinitions.primaryLiftDay, PrimaryLift.Enum.squat),
					),
				);

			if (!squatDefinition) {
				throw new Error("Squat definition not found");
			}

			// 3. Insert a known one rep max
			const oneRepMax = 225; // Known value for easier testing
			await tx.insert(oneRepMaxes).values({
				userId: user.id,
				exerciseDefinitionId: squatDefinition.id,
				weight: oneRepMax,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// 4. Create cycle
			const cycleResponse = await createCycle({
				user: { id: user.id },
				tx,
			});

			if (!cycleResponse.success || !cycleResponse.data) {
				throw new Error("Failed to create cycle");
			}

			const cycle = cycleResponse.data;

			// 5. Get the first squat workout
			const squatWorkout = await tx
				.select()
				.from(workouts)
				.where(
					and(
						eq(workouts.cycleId, cycle.id),
						eq(workouts.primaryLift, PrimaryLift.Enum.squat),
					),
				)
				.get();

			if (!squatWorkout) {
				throw new Error("Squat workout not found");
			}

			// 6. Get the main lift exercise
			const mainLiftExercise = await tx
				.select()
				.from(exercises)
				.where(
					and(
						eq(exercises.workoutId, squatWorkout.id),
						eq(exercises.exerciseDefinitionId, squatDefinition.id),
					),
				)
				.get();

			if (!mainLiftExercise) {
				throw new Error("Main lift exercise not found");
			}

			// 7. Get the sets and verify weights
			const exerciseSets = await tx
				.select()
				.from(sets)
				.where(eq(sets.exerciseId, mainLiftExercise.id));

			// Verify each set has correct percentage-based weight
			for (const set of exerciseSets) {
				if (set.percentageOfMax) {
					const expectedWeight = roundDownToNearest5(
						Math.round((set.percentageOfMax / 100) * oneRepMax),
					);
					expect(set.weight).toBe(expectedWeight);
				}
			}
		});
	});
});
