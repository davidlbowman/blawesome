import { db } from "@/drizzle/db";
import { PRIMARY_LIFT_PATTERNS } from "@/drizzle/modules/strength-training/constants/liftPatterns";
import {
	ExerciseCategory,
	ExerciseType,
	PrimaryLift,
	Status,
	cycles,
	exerciseDefinitions,
	exercises,
	oneRepMaxes,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import type { ResultSet } from "@libsql/client";
import { type ExtractTablesWithRelations, eq } from "drizzle-orm";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";

const WORKOUT_SEQUENCE = [
	PrimaryLift.Squat,
	PrimaryLift.Bench,
	PrimaryLift.Deadlift,
	PrimaryLift.Overhead,
] as const;

const EXERCISE_CATEGORIES = {
	[PrimaryLift.Squat]: [
		ExerciseCategory.MainLift,
		ExerciseCategory.MainLiftVariation,
		ExerciseCategory.CompoundLeg,
		ExerciseCategory.QuadAccessory,
		ExerciseCategory.HamstringGluteAccessory,
		ExerciseCategory.CalfAccessory,
	],
	[PrimaryLift.Bench]: [
		ExerciseCategory.MainLift,
		ExerciseCategory.MainLiftVariation,
		ExerciseCategory.ChestAccessory,
		ExerciseCategory.ChestAccessory,
		ExerciseCategory.TricepAccessory,
		ExerciseCategory.TricepAccessory,
	],
	[PrimaryLift.Deadlift]: [
		ExerciseCategory.MainLift,
		ExerciseCategory.MainLiftVariation,
		ExerciseCategory.VerticalPullAccessory,
		ExerciseCategory.LateralPullAccessory,
		ExerciseCategory.BicepAccessory,
		ExerciseCategory.BicepAccessory,
	],
	[PrimaryLift.Overhead]: [
		ExerciseCategory.MainLift,
		ExerciseCategory.DeltAccessory,
		ExerciseCategory.DeltAccessory,
		ExerciseCategory.DeltAccessory,
		ExerciseCategory.TricepAccessory,
		ExerciseCategory.BicepAccessory,
	],
} as const;

// Helper function to chunk array into smaller pieces
function chunkArray<T>(array: T[], size: number): T[][] {
	return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
		array.slice(index * size, (index + 1) * size),
	);
}

// Helper function to round down to nearest 5
function roundDownToNearest5(num: number): number {
	return Math.floor(num / 5) * 5;
}

function getWeekPattern(workoutNumber: number) {
	const weekNumber = Math.floor((workoutNumber - 1) / 4) + 1;
	switch (weekNumber) {
		case 1:
			return PRIMARY_LIFT_PATTERNS.week1;
		case 2:
			return PRIMARY_LIFT_PATTERNS.week2;
		case 3:
			return PRIMARY_LIFT_PATTERNS.week3;
		default:
			return PRIMARY_LIFT_PATTERNS.week4;
	}
}

interface SetValues {
	userId: string;
	exerciseId: string;
	weight: number;
	reps: number;
	rpe: number;
	percentageOfMax: number | null;
	setNumber: number;
	status: string;
}

interface CreateCycleParams {
	userId: string;
	tx?: SQLiteTransaction<
		"async",
		ResultSet,
		Record<string, never>,
		ExtractTablesWithRelations<Record<string, never>>
	>;
}

export async function createCycle({ userId, tx }: CreateCycleParams) {
	const queryRunner = tx || db;
	const startDate = new Date();

	// First parallel operation: Get exercise definitions, one rep maxes, and create cycle
	const [allExerciseDefinitions, oneRepMaxRecords, [cycle]] = await Promise.all(
		[
			queryRunner
				.select({
					id: exerciseDefinitions.id,
					category: exerciseDefinitions.category,
					type: exerciseDefinitions.type,
					primaryLiftDay: exerciseDefinitions.primaryLiftDay,
					repMax: exerciseDefinitions.repMax,
					rpeMax: exerciseDefinitions.rpeMax,
				})
				.from(exerciseDefinitions),
			queryRunner
				.select({
					exerciseDefinitionId: oneRepMaxes.exerciseDefinitionId,
					weight: oneRepMaxes.weight,
				})
				.from(oneRepMaxes)
				.where(eq(oneRepMaxes.userId, userId)),
			queryRunner
				.insert(cycles)
				.values({
					userId,
					startDate,
					status: Status.Pending,
				})
				.returning(),
		],
	);

	// Create a map of exercise definition IDs to their one rep maxes
	const oneRepMaxMap = new Map(
		oneRepMaxRecords.map((record) => [
			record.exerciseDefinitionId,
			record.weight,
		]),
	);

	// Prepare workout values
	const workoutValues = Array.from({ length: 16 }).map((_, index) => {
		const workoutDate = new Date(startDate);
		workoutDate.setDate(startDate.getDate() + index * 2);

		return {
			userId,
			cycleId: cycle.id,
			date: workoutDate,
			primaryLift: WORKOUT_SEQUENCE[index % WORKOUT_SEQUENCE.length],
			status: Status.Pending,
			sequence: index + 1,
		};
	});

	// Create workouts
	const createdWorkouts = await queryRunner
		.insert(workouts)
		.values(workoutValues)
		.returning({
			id: workouts.id,
			primaryLift: workouts.primaryLift,
		});

	// Prepare exercise values
	const exerciseValues = createdWorkouts.flatMap((workout) => {
		const categories = EXERCISE_CATEGORIES[workout.primaryLift];
		return categories.map((category, index) => {
			const matchingDefinitions = allExerciseDefinitions.filter(
				(def) =>
					def.category === category &&
					(category === ExerciseCategory.MainLift
						? def.primaryLiftDay === workout.primaryLift
						: true),
			);

			const definition =
				matchingDefinitions[
					Math.floor(Math.random() * matchingDefinitions.length)
				];

			return {
				userId,
				workoutId: workout.id,
				exerciseDefinitionId: definition.id,
				order: index + 1,
				status: Status.Pending,
			};
		});
	});

	// Create exercises and prepare sets in parallel
	const createdExercises = await queryRunner
		.insert(exercises)
		.values(exerciseValues)
		.returning({
			id: exercises.id,
			exerciseDefinitionId: exercises.exerciseDefinitionId,
		});

	// Prepare set values
	const setValues = createdExercises.flatMap<SetValues>((exercise) => {
		const definition = allExerciseDefinitions.find(
			(def) => def.id === exercise.exerciseDefinitionId,
		);

		if (!definition) {
			throw new Error(
				`Could not find exercise definition for exercise ${exercise.id}`,
			);
		}

		const oneRepMax = oneRepMaxMap.get(definition.id);
		const workoutIndex = Math.floor(createdExercises.indexOf(exercise) / 6);
		const weekPattern = getWeekPattern(workoutIndex + 1);

		if (definition.type === ExerciseType.Primary && oneRepMax) {
			// For primary lifts, use the lift patterns and calculate weight from 1RM
			return weekPattern.map((pattern, setIndex) => ({
				userId,
				exerciseId: exercise.id,
				weight: roundDownToNearest5(
					Math.round((pattern.percentageOfMax / 100) * oneRepMax),
				),
				reps: pattern.reps,
				rpe:
					definition.type === ExerciseType.Primary
						? 7
						: (definition.rpeMax ?? 7),
				percentageOfMax: pattern.percentageOfMax,
				setNumber: setIndex + 1,
				status: Status.Pending,
			}));
		}

		// For non-primary lifts, use default values
		return Array.from({ length: 6 }).map((_, setIndex) => ({
			userId,
			exerciseId: exercise.id,
			weight: 100, // Default weight for non-primary lifts
			reps: definition.repMax ?? 8,
			rpe: definition.rpeMax ?? 7,
			percentageOfMax: null,
			setNumber: setIndex + 1,
			status: Status.Pending,
		}));
	});

	// Split sets into chunks and insert all chunks in parallel
	const setChunks = chunkArray(setValues, 50);
	await Promise.all(
		setChunks.map((chunk) => queryRunner.insert(sets).values(chunk)),
	);

	return cycle;
}
