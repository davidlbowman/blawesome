/**
 * Test Utilities for Strength Training Module
 */

import { db } from "@/drizzle/db";
import { faker } from "@faker-js/faker";
import { PrimaryLift, Status } from "../schemas";

export async function withTestTransaction<T>(
	// @ts-expect-error
	callback: (tx) => Promise<T>,
): Promise<T> {
	return await db
		.transaction(async (tx) => {
			const result = await callback(tx);
			// Always rollback in test environment
			throw { message: "ROLLBACK_TEST_TRANSACTION", result } as const;
		})
		.catch((e: { message: string; result: T }) => {
			if (e.message === "ROLLBACK_TEST_TRANSACTION") {
				return e.result;
			}
			throw e;
		});
}

export function createTestWorkout({
	id = faker.string.uuid(),
	userId,
	cycleId,
	primaryLift = PrimaryLift.Squat,
}: {
	id?: string;
	userId: string;
	cycleId: string;
	primaryLift?: (typeof PrimaryLift)[keyof typeof PrimaryLift];
}) {
	return {
		id,
		userId,
		cycleId,
		primaryLift,
		date: new Date(),
		sequence: faker.number.int({ min: 1, max: 16 }),
		status: Status.Pending,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

export function createTestExercise({
	id = faker.string.uuid(),
	userId,
	workoutId,
	exerciseDefinitionId,
}: {
	id?: string;
	userId: string;
	workoutId: string;
	exerciseDefinitionId: string;
}) {
	return {
		id,
		userId,
		workoutId,
		exerciseDefinitionId,
		order: faker.number.int({ min: 1, max: 10 }),
		status: Status.Pending,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

export function createTestSet({
	id = faker.string.uuid(),
	userId,
	exerciseId,
}: {
	id?: string;
	userId: string;
	exerciseId: string;
}) {
	return {
		id,
		userId,
		exerciseId,
		setNumber: faker.number.int({ min: 1, max: 6 }),
		weight: faker.number.int({ min: 45, max: 315 }),
		reps: faker.number.int({ min: 1, max: 12 }),
		rpe: faker.number.int({ min: 6, max: 10 }),
		percentageOfMax: faker.number.int({ min: 50, max: 95 }),
		status: Status.Pending,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}
