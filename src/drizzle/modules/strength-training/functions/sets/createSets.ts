"use server";

import type { User } from "@/drizzle/core/schemas/users";
import type { DrizzleTransaction } from "@/drizzle/db";
import type { ExerciseDefinitionsSelect } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import { sets } from "@/drizzle/modules/strength-training/schemas/sets";
import type { SetsInsert } from "@/drizzle/modules/strength-training/schemas/sets";
import {
	ExerciseType,
	Status,
} from "@/drizzle/modules/strength-training/types";
import { roundDownToNearest5 } from "@/drizzle/modules/strength-training/utils/math";

const PRIMARY_LIFT_PATTERNS: Record<
	string,
	Pick<SetsInsert, "reps" | "percentageOfMax">[]
> = {
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
};

function getWeekPattern(
	workoutNumber: number,
): Pick<SetsInsert, "reps" | "percentageOfMax">[] {
	const weekNumber = Math.floor((workoutNumber - 1) / 4) + 1;
	return PRIMARY_LIFT_PATTERNS[`week${weekNumber}`];
}

function chunkArray<T>(array: T[], size: number): T[][] {
	return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
		array.slice(i * size, i * size + size),
	);
}

export async function createSets(
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
				(pattern, setIndex): SetsInsert => ({
					userId,
					exerciseId: exercise.id,
					weight: roundDownToNearest5(
						(oneRepMax * (pattern.percentageOfMax ?? 0)) / 100,
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
			(_, setIndex): SetsInsert => ({
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

	const batches = chunkArray(setValues, 500);
	for (const batch of batches) {
		await tx.insert(sets).values(batch);
	}
}
