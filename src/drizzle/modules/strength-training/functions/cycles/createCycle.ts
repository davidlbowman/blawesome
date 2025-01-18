"use server";

import type { User } from "@/drizzle/core/schemas/users";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import {
	DefaultExerciseDefinitions,
	ExerciseType,
	type PrimaryLift,
	Status,
} from "@/drizzle/modules/strength-training/types";
import { roundDownToNearest5 } from "@/drizzle/modules/strength-training/utils/math";
import { eq } from "drizzle-orm";
import { cycles } from "../../schemas/cycles";
import {
	type ExerciseDefinitionsSelect,
	exerciseDefinitions,
} from "../../schemas/exerciseDefinitions";
import { type ExercisesInsert, exercises } from "../../schemas/exercises";
import { type OneRepMaxesSelect, oneRepMaxes } from "../../schemas/oneRepMaxes";
import { type SetsInsert, sets } from "../../schemas/sets";
import { type WorkoutsInsert, workouts } from "../../schemas/workouts";

const PRIMARY_LIFT_PATTERNS = {
	week1: [
		{ reps: 10, percentageOfMax: 45 },
		{ reps: 5, percentageOfMax: 55 },
		{ reps: 5, percentageOfMax: 65 },
		{ reps: 5, percentageOfMax: 75 },
		{ reps: 5, percentageOfMax: 85 },
		{ reps: 5, percentageOfMax: 85 },
	],
	week2: [
		{ reps: 8, percentageOfMax: 50 },
		{ reps: 3, percentageOfMax: 60 },
		{ reps: 3, percentageOfMax: 70 },
		{ reps: 3, percentageOfMax: 80 },
		{ reps: 3, percentageOfMax: 90 },
		{ reps: 3, percentageOfMax: 90 },
	],
	week3: [
		{ reps: 10, percentageOfMax: 50 },
		{ reps: 5, percentageOfMax: 70 },
		{ reps: 3, percentageOfMax: 80 },
		{ reps: 2, percentageOfMax: 85 },
		{ reps: 1, percentageOfMax: 90 },
		{ reps: 1, percentageOfMax: 95 },
	],
	week4: [
		{ reps: 10, percentageOfMax: 50 },
		{ reps: 8, percentageOfMax: 60 },
		{ reps: 5, percentageOfMax: 70 },
		{ reps: 5, percentageOfMax: 70 },
		{ reps: 5, percentageOfMax: 70 },
		{ reps: 5, percentageOfMax: 70 },
	],
} as const;

async function createWorkouts(
	userId: User["id"],
	cycleId: string,
	startDate: Date,
	tx: DrizzleTransaction,
): Promise<Array<{ id: string; primaryLift: PrimaryLift }>> {
	const workoutValues = Array.from({ length: 16 }).map((_, index) => {
		const workoutDate = new Date(startDate);
		workoutDate.setDate(startDate.getDate() + index * 2);

		// Get primary lift in correct order: squat, bench, deadlift, overhead
		const primaryLifts = ["squat", "bench", "deadlift", "overhead"] as const;

		const primaryLift = primaryLifts[index % 4];

		return {
			userId,
			cycleId,
			date: workoutDate,
			primaryLift,
			status: Status.Enum.pending,
			sequence: index + 1,
		} satisfies WorkoutsInsert;
	});

	const createdWorkouts = await tx
		.insert(workouts)
		.values(workoutValues)
		.returning();

	return createdWorkouts.map((w) => ({
		id: w.id,
		primaryLift: w.primaryLift as PrimaryLift,
	}));
}

async function createExercises(
	userId: User["id"],
	workouts: Array<{ id: string; primaryLift: PrimaryLift }>,
	definitions: ExerciseDefinitionsSelect[],
	tx: DrizzleTransaction,
): Promise<Array<{ id: string; exerciseDefinitionId: string }>> {
	const exerciseValues = workouts.flatMap((workout) => {
		const exercises = DefaultExerciseDefinitions.get(workout.primaryLift);
		if (!exercises) {
			throw new Error(
				`No exercises found for primary lift ${workout.primaryLift}`,
			);
		}

		return exercises.map((exercise, index) => {
			const definition = definitions.find(
				(def) =>
					def.category === exercise.category && def.type === exercise.type,
			);

			if (!definition) {
				throw new Error(
					`No exercise definition found for category ${exercise.category} and type ${exercise.type}`,
				);
			}

			return {
				userId,
				workoutId: workout.id,
				exerciseDefinitionId: definition.id,
				order: index + 1,
				status: Status.Enum.pending,
			} satisfies ExercisesInsert;
		});
	});

	const createdExercises = await tx
		.insert(exercises)
		.values(exerciseValues)
		.returning();

	return createdExercises.map((e) => ({
		id: e.id,
		exerciseDefinitionId: e.exerciseDefinitionId,
	}));
}

type SetValues = {
	userId: string;
	exerciseId: string;
	weight: number;
	reps: number;
	rpe: number;
	percentageOfMax: number | null;
	setNumber: number;
	status: typeof Status.Enum.pending;
};

async function createSets(
	userId: User["id"],
	exercisesList: Array<{ id: string; exerciseDefinitionId: string }>,
	definitions: ExerciseDefinitionsSelect[],
	oneRepMaxMap: Map<string, number>,
	tx: DrizzleTransaction,
): Promise<void> {
	const setValues = exercisesList.flatMap((exercise, index) => {
		const definition = definitions.find(
			(def) => def.id === exercise.exerciseDefinitionId,
		);

		if (!definition) {
			throw new Error(
				`No definition found for exercise ${exercise.exerciseDefinitionId}`,
			);
		}

		const oneRepMax = oneRepMaxMap.get(definition.id);
		const workoutNumber = Math.floor(index / 6) + 1;
		const weekPattern = getWeekPattern(workoutNumber);

		if (definition.type === ExerciseType.Enum.primary && oneRepMax) {
			return weekPattern.map(
				(pattern, setIndex): SetValues => ({
					userId,
					exerciseId: exercise.id,
					weight: roundDownToNearest5(
						(oneRepMax * pattern.percentageOfMax) / 100,
					),
					reps: pattern.reps,
					rpe: 7,
					percentageOfMax: pattern.percentageOfMax,
					setNumber: setIndex + 1,
					status: Status.Enum.pending,
				}),
			);
		}

		return Array.from({ length: 6 }).map(
			(_, setIndex): SetValues => ({
				userId,
				exerciseId: exercise.id,
				weight: 100,
				reps: definition.repMax ?? 8,
				rpe: definition.rpeMax ?? 7,
				percentageOfMax: null,
				setNumber: setIndex + 1,
				status: Status.Enum.pending,
			}),
		);
	});

	// Batch insert sets
	const batches = chunkArray(setValues, 500);
	for (const batch of batches) {
		await tx.insert(sets).values(batch as SetsInsert[]);
	}
}

function chunkArray<T>(array: T[], size: number): T[][] {
	return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
		array.slice(i * size, i + size),
	);
}

function getWeekPattern(workoutNumber: number) {
	const weekNumber = Math.floor((workoutNumber - 1) / 4) + 1;
	return PRIMARY_LIFT_PATTERNS[
		`week${weekNumber}` as keyof typeof PRIMARY_LIFT_PATTERNS
	];
}

export async function createCycle({
	userId,
	tx,
}: {
	userId: User["id"];
	tx?: DrizzleTransaction;
}) {
	const queryRunner = tx || db;

	return queryRunner.transaction(async (trx) => {
		// Step 1: Create cycle and get prerequisites
		const [cycle, definitions, maxes] = await Promise.all([
			trx
				.insert(cycles)
				.values({
					userId,
					startDate: new Date(),
					status: Status.Enum.pending,
				})
				.returning()
				.then(([c]) => c),
			trx.select().from(exerciseDefinitions) as Promise<
				ExerciseDefinitionsSelect[]
			>,
			trx
				.select()
				.from(oneRepMaxes)
				.where(eq(oneRepMaxes.userId, userId)) as Promise<OneRepMaxesSelect[]>,
		]);

		if (!cycle) {
			throw new Error("Failed to create cycle");
		}

		// Step 2: Create workouts
		const workoutList = await createWorkouts(
			userId,
			cycle.id,
			cycle.startDate,
			trx,
		);

		// Step 3: Create exercises
		const exerciseList = await createExercises(
			userId,
			workoutList,
			definitions,
			trx,
		);

		// Step 4: Create sets
		const oneRepMaxMap = new Map(
			maxes.map((orm) => [orm.exerciseDefinitionId, orm.weight]),
		);
		await createSets(userId, exerciseList, definitions, oneRepMaxMap, trx);

		return cycle;
	});
}
