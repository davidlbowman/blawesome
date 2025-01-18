"use server";

import type { User } from "@/drizzle/core/schemas/users";
import { type DrizzleTransaction, db } from "@/drizzle/db";
import type { ExerciseDefinitionsSelect } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import type { ExercisesSelect } from "@/drizzle/modules/strength-training/schemas/exercises";
import type { OneRepMaxesSelect } from "@/drizzle/modules/strength-training/schemas/oneRepMaxes";
import {
	type SetsInsert,
	sets,
	setsInsertSchema,
} from "@/drizzle/modules/strength-training/schemas/sets";
import {
	ExerciseType,
	Status,
} from "@/drizzle/modules/strength-training/types";
import { roundDownToNearest5 } from "@/drizzle/modules/strength-training/utils/math";

// Types for Training Block
type SetPattern = {
	reps: NonNullable<SetsInsert["reps"]>;
	percentageOfMax: NonNullable<SetsInsert["percentageOfMax"]>;
};
type WeekPattern = SetPattern[];
type TrainingBlock = {
	patterns: WeekPattern[];
	setsPerExercise: number;
	weeksPerBlock: number;
};

// Training patterns for primary lifts
const PRIMARY_LIFT_TRAINING: TrainingBlock = {
	patterns: [
		// Week 1: Volume
		[
			{ reps: 10, percentageOfMax: 45 },
			{ reps: 5, percentageOfMax: 55 },
			{ reps: 5, percentageOfMax: 65 },
			{ reps: 5, percentageOfMax: 75 },
			{ reps: 5, percentageOfMax: 85 },
			{ reps: 5, percentageOfMax: 85 },
		],
		// Week 2: Intensity
		[
			{ reps: 8, percentageOfMax: 50 },
			{ reps: 3, percentageOfMax: 60 },
			{ reps: 3, percentageOfMax: 70 },
			{ reps: 3, percentageOfMax: 80 },
			{ reps: 3, percentageOfMax: 90 },
			{ reps: 3, percentageOfMax: 90 },
		],
		// Week 3: Peak
		[
			{ reps: 10, percentageOfMax: 50 },
			{ reps: 5, percentageOfMax: 70 },
			{ reps: 3, percentageOfMax: 80 },
			{ reps: 2, percentageOfMax: 85 },
			{ reps: 1, percentageOfMax: 90 },
			{ reps: 1, percentageOfMax: 95 },
		],
		// Week 4: Deload
		[
			{ reps: 10, percentageOfMax: 50 },
			{ reps: 8, percentageOfMax: 60 },
			{ reps: 5, percentageOfMax: 70 },
			{ reps: 5, percentageOfMax: 70 },
			{ reps: 5, percentageOfMax: 70 },
			{ reps: 5, percentageOfMax: 70 },
		],
	],
	setsPerExercise: 6,
	weeksPerBlock: 4,
};

// Utility functions
function getWeekPattern(workoutNumber: number): WeekPattern {
	const weekIndex = Math.floor(
		(workoutNumber - 1) % PRIMARY_LIFT_TRAINING.weeksPerBlock,
	);
	return PRIMARY_LIFT_TRAINING.patterns[weekIndex];
}

function chunkArray<T>(array: T[], size: number): T[][] {
	return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
		array.slice(i * size, i + size),
	);
}

export async function createSets({
	userId,
	exercisesList,
	definitions,
	oneRepMaxMap,
	tx,
}: {
	userId: User["id"];
	exercisesList: Pick<ExercisesSelect, "id" | "exerciseDefinitionId">[];
	definitions: ExerciseDefinitionsSelect[];
	oneRepMaxMap: Map<
		OneRepMaxesSelect["exerciseDefinitionId"],
		OneRepMaxesSelect["weight"]
	>;
	tx?: DrizzleTransaction;
}): Promise<void> {
	const queryRunner = tx || db;

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
		const workoutNumber =
			Math.floor(index / PRIMARY_LIFT_TRAINING.setsPerExercise) + 1;
		const weekPattern = getWeekPattern(workoutNumber);

		if (definition.type === ExerciseType.Enum.primary && oneRepMax) {
			return weekPattern.map((pattern, setIndex) =>
				setsInsertSchema.parse({
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

		return Array.from({ length: PRIMARY_LIFT_TRAINING.setsPerExercise }).map(
			(_, setIndex) =>
				setsInsertSchema.parse({
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
		await queryRunner.insert(sets).values(batch);
	}
}
