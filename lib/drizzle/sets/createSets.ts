"use server";

import { db } from "@/lib/drizzle/db";
import {
	type ExerciseDefinitionsSelect,
	ExerciseType,
	type SetsInsert,
	Status,
	type exercises,
	sets,
} from "@/lib/drizzle/schemas/strength-training";
import type { InferSelectModel } from "drizzle-orm";

type Exercise = InferSelectModel<typeof exercises>;

interface SetScheme {
	reps?: number;
	weight?: number;
	percentageOfMax?: number;
	rpeRange?: { min: number; max: number };
	repRange?: { min: number; max: number };
}

// Week patterns for primary lifts
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
};

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
		}));
	}

	// For variations and accessories, use the definition's ranges
	const pattern = {
		rpeRange:
			definition.rpeMin && definition.rpeMax
				? { min: definition.rpeMin, max: definition.rpeMax }
				: undefined,
		repRange:
			definition.repMin && definition.repMax
				? { min: definition.repMin, max: definition.repMax }
				: undefined,
	};

	// Return 6 sets with the same pattern
	return Array(6).fill(pattern);
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

	const setValues: SetsInsert[] = setSchemes.map((scheme, index) => ({
		userId,
		exerciseId: exercise.id,
		setNumber: index + 1,
		weight: scheme.weight || 0, // For non-primary lifts, weight will be entered by user
		reps:
			scheme.reps ||
			Math.floor(
				((scheme.repRange?.min || 0) + (scheme.repRange?.max || 0)) / 2,
			),
		rpe: scheme.rpeRange
			? Math.floor((scheme.rpeRange.min + scheme.rpeRange.max) / 2)
			: null,
		percentageOfMax: scheme.percentageOfMax || null,
		status: Status.Pending,
	}));

	const createdSets = await db.insert(sets).values(setValues).returning();
	return createdSets;
}
