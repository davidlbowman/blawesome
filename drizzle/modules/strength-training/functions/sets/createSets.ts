"use server";

import {
	type ExerciseDefinitionsSelect,
	ExerciseType,
	type SetsInsert,
	Status,
	type exercises,
} from "@/drizzle/modules/strength-training/schemas";
import type { InferSelectModel } from "drizzle-orm";

type Exercise = InferSelectModel<typeof exercises>;

interface SetScheme {
	reps: number;
	weight?: number;
	percentageOfMax?: number;
	rpe?: number;
}

// Week patterns for primary lifts
const PRIMARY_LIFT_PATTERNS = {
	week1: [
		{ reps: 10, percentageOfMax: 45 },
		{ reps: 5, percentageOfMax: 55 },
		// { reps: 5, percentageOfMax: 65 },
		// { reps: 5, percentageOfMax: 75 },
		// { reps: 5, percentageOfMax: 85 },
		// { reps: 5, percentageOfMax: 85 },
	],
	week2: [
		{ reps: 8, percentageOfMax: 50 },
		{ reps: 3, percentageOfMax: 60 },
		// { reps: 3, percentageOfMax: 70 },
		// { reps: 3, percentageOfMax: 80 },
		// { reps: 3, percentageOfMax: 90 },
		// { reps: 3, percentageOfMax: 90 },
	],
	week3: [
		{ reps: 10, percentageOfMax: 50 },
		{ reps: 5, percentageOfMax: 70 },
		// { reps: 3, percentageOfMax: 80 },
		// { reps: 2, percentageOfMax: 85 },
		// { reps: 1, percentageOfMax: 90 },
		// { reps: 1, percentageOfMax: 95 },
	],
	week4: [
		{ reps: 10, percentageOfMax: 50 },
		{ reps: 8, percentageOfMax: 60 },
		// { reps: 5, percentageOfMax: 70 },
		// { reps: 5, percentageOfMax: 70 },
		// { reps: 5, percentageOfMax: 70 },
		// { reps: 5, percentageOfMax: 70 },
	],
};

const NON_PRIMARY_SETS = 2;

function getWeekNumber(workoutIndex: number): 1 | 2 | 3 | 4 {
	return ((Math.floor(workoutIndex / 4) % 4) + 1) as 1 | 2 | 3 | 4;
}

function roundToNearest5(weight: number): number {
	return Math.floor(weight / 5) * 5;
}

function calculateSetScheme(
	exerciseType: (typeof ExerciseType)[keyof typeof ExerciseType],
	workoutIndex: number,
	oneRepMax: number | null,
	definition: ExerciseDefinitionsSelect,
): SetScheme[] {
	const weekNumber = getWeekNumber(workoutIndex);
	const weekKey = `week${weekNumber}` as keyof typeof PRIMARY_LIFT_PATTERNS;

	if (exerciseType === ExerciseType.Primary && oneRepMax) {
		return PRIMARY_LIFT_PATTERNS[weekKey].map((pattern) => ({
			...pattern,
			weight: roundToNearest5(
				Math.round((oneRepMax * (pattern.percentageOfMax || 0)) / 100),
			),
			rpe: 7, // Fixed RPE for primary lifts
		}));
	}

	// For variations and accessories, use the definition's max values
	const pattern = {
		reps: definition.repMax ?? 8,
		rpe: definition.rpeMax ?? 7,
		weight: 100, // Default weight, will be adjusted based on 1RM later
	};

	// Return only NON_PRIMARY_SETS number of sets with the same pattern
	return Array(NON_PRIMARY_SETS).fill(pattern);
}

export async function createSets(
	userId: string,
	exercise: Exercise,
	exerciseType: (typeof ExerciseType)[keyof typeof ExerciseType],
	workoutIndex: number,
	oneRepMax: number | null,
	definition: ExerciseDefinitionsSelect,
): Promise<SetsInsert[]> {
	const setSchemes = calculateSetScheme(
		exerciseType,
		workoutIndex,
		oneRepMax,
		definition,
	);

	return setSchemes.map((scheme, index) => ({
		userId,
		exerciseId: exercise.id,
		weight: scheme.weight ?? 100,
		reps: scheme.reps,
		rpe: scheme.rpe ?? 7,
		percentageOfMax: scheme.percentageOfMax ?? 70,
		setNumber: index + 1,
		status: Status.Pending,
	}));
}
