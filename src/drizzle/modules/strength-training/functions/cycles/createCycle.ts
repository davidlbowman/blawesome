"use server";

import type { UserSelect } from "@/drizzle/core/schemas/users";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import { createExercises } from "@/drizzle/modules/strength-training/functions/exercises/createExercises";
import { createSets } from "@/drizzle/modules/strength-training/functions/sets/createSets";
import { createWorkouts } from "@/drizzle/modules/strength-training/functions/workouts/createWorkouts";
import { cycles } from "@/drizzle/modules/strength-training/schemas/cycles";
import {
	type ExerciseDefinitionsSelect,
	exerciseDefinitions,
} from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import {
	type OneRepMaxesSelect,
	oneRepMaxes,
} from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import { Status } from "@/drizzle/modules/strength-training/types";
import { eq } from "drizzle-orm";

export async function createCycle({
	userId,
	tx,
}: {
	userId: UserSelect["id"];
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
		const createWorkoutsResponse = await createWorkouts({
			userId,
			cycle: {
				id: cycle.id,
				startDate: cycle.startDate,
			},
			tx: trx,
		});

		if (!createWorkoutsResponse.success || !createWorkoutsResponse.data) {
			throw new Error("Failed to create workouts");
		}
		const workoutList = createWorkoutsResponse.data;

		// Step 3: Create exercises
		const createExercisesResponse = await createExercises({
			userId,
			workouts: workoutList,
			definitions,
			tx: trx,
		});

		if (!createExercisesResponse.success || !createExercisesResponse.data) {
			throw new Error("Failed to create exercises");
		}
		const exerciseList = createExercisesResponse.data;

		// Step 4: Create sets
		const oneRepMaxMap = new Map<
			OneRepMaxesSelect["exerciseDefinitionId"],
			OneRepMaxesSelect["weight"]
		>(maxes.map((orm) => [orm.exerciseDefinitionId, orm.weight]));

		await createSets({
			userId,
			exercisesList: exerciseList,
			definitions,
			oneRepMaxMap,
			tx: trx,
		});

		return cycle;
	});
}
