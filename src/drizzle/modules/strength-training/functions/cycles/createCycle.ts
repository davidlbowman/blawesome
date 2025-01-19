"use server";

import type { UserSelect } from "@/drizzle/core/schemas/users";
import type { Response } from "@/drizzle/core/types";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import { createExercises } from "@/drizzle/modules/strength-training/functions/exercises/createExercises";
import { createSets } from "@/drizzle/modules/strength-training/functions/sets/createSets";
import { createWorkouts } from "@/drizzle/modules/strength-training/functions/workouts/createWorkouts";
import {
	type CyclesSelect,
	cycles,
	cyclesSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/cycles";
import {
	exerciseDefinitions,
	exerciseDefinitionsSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import {
	type OneRepMaxesSelect,
	oneRepMaxes,
	oneRepMaxesSelectSchema,
} from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import { Status } from "@/drizzle/modules/strength-training/types";
import { eq } from "drizzle-orm";

interface CreateCycleParams {
	user: Pick<UserSelect, "id">;
	tx?: DrizzleTransaction;
}

type CreateCycleResponse = Promise<Response<CyclesSelect>>;

export async function createCycle({
	user,
	tx,
}: CreateCycleParams): CreateCycleResponse {
	const queryRunner = tx || db;

	return queryRunner.transaction(async (trx) => {
		// Step 1: Create cycle and get prerequisites
		const [cycle, definitions, maxes] = await Promise.all([
			trx
				.insert(cycles)
				.values({
					userId: user.id,
					startDate: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
					status: Status.Enum.pending,
				})
				.returning()
				.then(([c]) => cyclesSelectSchema.parse(c)),
			trx
				.select()
				.from(exerciseDefinitions)
				.then((defs) => exerciseDefinitionsSelectSchema.array().parse(defs)),
			trx
				.select()
				.from(oneRepMaxes)
				.where(eq(oneRepMaxes.userId, user.id))
				.then((maxes) => oneRepMaxesSelectSchema.array().parse(maxes)),
		]);

		if (!cycle || !definitions || !maxes) {
			return { success: false, error: new Error("Failed to create cycle") };
		}

		// Step 2: Create workouts
		const createWorkoutsResponse = await createWorkouts({
			userId: user.id,
			cycle: {
				id: cycle.id,
			},
			tx: trx,
		});

		if (!createWorkoutsResponse.success || !createWorkoutsResponse.data) {
			return { success: false, error: new Error("Failed to create workouts") };
		}
		const workoutList = createWorkoutsResponse.data;

		// Step 3: Create exercises
		const createExercisesResponse = await createExercises({
			userId: { id: user.id },
			workouts: workoutList,
			definitions,
			tx: trx,
		});

		if (!createExercisesResponse.success || !createExercisesResponse.data) {
			return { success: false, error: new Error("Failed to create exercises") };
		}
		const exerciseList = createExercisesResponse.data;

		// Step 4: Create sets
		const oneRepMaxMap = new Map<
			OneRepMaxesSelect["exerciseDefinitionId"],
			OneRepMaxesSelect["weight"]
		>(maxes.map((orm) => [orm.exerciseDefinitionId, orm.weight]));

		await createSets({
			userId: user.id,
			exercisesList: exerciseList,
			definitions,
			oneRepMaxMap,
			tx: trx,
		});

		return { success: true, data: cycle };
	});
}
