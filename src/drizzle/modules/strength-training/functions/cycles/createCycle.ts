"use server";

import type { User } from "@/drizzle/core/schemas/users";
import { db } from "@/drizzle/db";
import type { DrizzleTransaction } from "@/drizzle/db";
import { PRIMARY_LIFT_PATTERNS } from "@/drizzle/modules/strength-training/constants/liftPatterns";
import {
	ExerciseCategory,
	ExerciseType,
	PrimaryLift,
	Status,
} from "@/drizzle/modules/strength-training/types";
import { roundDownToNearest5 } from "@/drizzle/modules/strength-training/utils/math";
import { eq } from "drizzle-orm";
import { cycles } from "../../schemas/cycles";
import {
	exerciseDefinitions,
	exerciseDefinitionsSelectSchema,
} from "../../schemas/exerciseDefinitions";
import { exercises } from "../../schemas/exercises";
import type { ExercisesInsert } from "../../schemas/exercises";
import { oneRepMaxes } from "../../schemas/oneRepMaxes";
import { sets } from "../../schemas/sets";
import type { SetsInsert } from "../../schemas/sets";
import { workouts } from "../../schemas/workouts";
import type { WorkoutsInsert } from "../../schemas/workouts";

const WORKOUT_SEQUENCE = [
	PrimaryLift.Enum.squat,
	PrimaryLift.Enum.bench,
	PrimaryLift.Enum.deadlift,
	PrimaryLift.Enum.press,
] as const;

const EXERCISE_CATEGORIES = {
	[PrimaryLift.Enum.squat]: [
		ExerciseCategory.Enum.main_lift,
		ExerciseCategory.Enum.main_lift_variation,
		ExerciseCategory.Enum.compound_leg,
		ExerciseCategory.Enum.quad_accessory,
		ExerciseCategory.Enum.hamstring_glute_accessory,
		ExerciseCategory.Enum.calf_accessory,
	],
	[PrimaryLift.Enum.bench]: [
		ExerciseCategory.Enum.main_lift,
		ExerciseCategory.Enum.main_lift_variation,
		ExerciseCategory.Enum.chest_accessory,
		ExerciseCategory.Enum.chest_accessory,
		ExerciseCategory.Enum.tricep_accessory,
		ExerciseCategory.Enum.tricep_accessory,
	],
	[PrimaryLift.Enum.deadlift]: [
		ExerciseCategory.Enum.main_lift,
		ExerciseCategory.Enum.main_lift_variation,
		ExerciseCategory.Enum.vertical_pull_accessory,
		ExerciseCategory.Enum.lateral_pull_accessory,
		ExerciseCategory.Enum.bicep_accessory,
		ExerciseCategory.Enum.bicep_accessory,
	],
	[PrimaryLift.Enum.press]: [
		ExerciseCategory.Enum.main_lift,
		ExerciseCategory.Enum.delt_accessory,
		ExerciseCategory.Enum.delt_accessory,
		ExerciseCategory.Enum.delt_accessory,
		ExerciseCategory.Enum.tricep_accessory,
		ExerciseCategory.Enum.bicep_accessory,
	],
} as const;

// Helper function to chunk array into smaller pieces
function chunkArray<T>(array: T[], size: number): T[][] {
	return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
		array.slice(index * size, (index + 1) * size),
	);
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

interface CreateCycleParams {
	userId: User["id"];
	tx?: DrizzleTransaction;
}

export async function createCycle({ userId, tx }: CreateCycleParams) {
	const queryRunner = tx || db;
	const startDate = new Date();

	// First parallel operation: Get exercise definitions, one rep maxes, and create cycle
	const [rawExerciseDefinitions, oneRepMaxRecords, [cycle]] = await Promise.all(
		[
			queryRunner
				.select({
					id: exerciseDefinitions.id,
					name: exerciseDefinitions.name,
					category: exerciseDefinitions.category,
					type: exerciseDefinitions.type,
					primaryLiftDay: exerciseDefinitions.primaryLiftDay,
					repMax: exerciseDefinitions.repMax,
					rpeMax: exerciseDefinitions.rpeMax,
					createdAt: exerciseDefinitions.createdAt,
					updatedAt: exerciseDefinitions.updatedAt,
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
					status: Status.Enum.pending,
				})
				.returning(),
		],
	);

	// Parse exercise definitions through schema
	const allExerciseDefinitions = rawExerciseDefinitions.map((def) =>
		exerciseDefinitionsSelectSchema.parse(def),
	);

	console.log("Exercise Definitions after parse:", allExerciseDefinitions);

	// Create a map of exercise definition IDs to their one rep maxes
	const oneRepMaxMap = new Map(
		oneRepMaxRecords.map((record) => [
			record.exerciseDefinitionId,
			record.weight,
		]),
	);

	// Prepare workout values
	const workoutValues: WorkoutsInsert[] = Array.from({ length: 16 }).map(
		(_, index) => {
			const workoutDate = new Date(startDate);
			workoutDate.setDate(startDate.getDate() + index * 2);

			return {
				userId,
				cycleId: cycle.id,
				date: workoutDate,
				primaryLift: WORKOUT_SEQUENCE[index % WORKOUT_SEQUENCE.length],
				status: Status.Enum.pending,
				sequence: index + 1,
			};
		},
	);

	// Create workouts
	const createdWorkouts = await queryRunner
		.insert(workouts)
		.values(workoutValues)
		.returning({
			id: workouts.id,
			primaryLift: workouts.primaryLift,
		});

	// Prepare exercise values
	const exerciseValues: ExercisesInsert[] = createdWorkouts.flatMap(
		(workout) => {
			console.log("Processing workout:", workout);
			const categories =
				EXERCISE_CATEGORIES[workout.primaryLift as PrimaryLift];
			console.log("Categories for workout:", categories);

			return categories.map((category, index) => {
				console.log("Finding exercises for category:", category);
				console.log("Available definitions:", allExerciseDefinitions);

				const matchingDefinitions = allExerciseDefinitions.filter((def) => {
					const categoryMatch = def.category === category;
					const primaryLiftMatch =
						category === ExerciseCategory.Enum.main_lift
							? def.primaryLiftDay === workout.primaryLift
							: true;

					console.log("Matching attempt:", {
						def,
						categoryMatch,
						primaryLiftMatch,
						category,
						isMainLift: category === ExerciseCategory.Enum.main_lift,
						workoutPrimaryLift: workout.primaryLift,
					});

					return categoryMatch && primaryLiftMatch;
				});

				if (matchingDefinitions.length === 0) {
					throw new Error(
						`No matching exercise definition found for category ${category}. ` +
							`Workout primary lift: ${workout.primaryLift}. ` +
							`Available definitions: ${JSON.stringify(
								allExerciseDefinitions.map((d) => ({
									category: d.category,
									primaryLiftDay: d.primaryLiftDay,
								})),
							)}`,
					);
				}

				const definition =
					matchingDefinitions[
						Math.floor(Math.random() * matchingDefinitions.length)
					];

				return {
					userId,
					workoutId: workout.id,
					exerciseDefinitionId: definition.id,
					order: index + 1,
					status: Status.Enum.pending,
				};
			});
		},
	);

	// Create exercises and prepare sets in parallel
	const createdExercises = await queryRunner
		.insert(exercises)
		.values(exerciseValues)
		.returning({
			id: exercises.id,
			exerciseDefinitionId: exercises.exerciseDefinitionId,
		});

	// Prepare set values
	const setValues = createdExercises.flatMap<SetsInsert>((exercise) => {
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

		if (definition.type === ExerciseType.Enum.primary && oneRepMax) {
			// For primary lifts, use the lift patterns and calculate weight from 1RM
			return weekPattern.map((pattern, setIndex) => ({
				userId,
				exerciseId: exercise.id,
				weight: roundDownToNearest5(
					Math.round((pattern.percentageOfMax / 100) * oneRepMax),
				),
				reps: pattern.reps,
				rpe:
					definition.type === ExerciseType.Enum.primary
						? 7
						: (definition.rpeMax ?? 7),
				percentageOfMax: pattern.percentageOfMax,
				setNumber: setIndex + 1,
				status: Status.Enum.pending,
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
			status: Status.Enum.pending,
		}));
	});

	// Split sets into chunks and insert all chunks in parallel
	const setChunks = chunkArray(setValues, 50);
	await Promise.all(
		setChunks.map((chunk) => queryRunner.insert(sets).values(chunk)),
	);

	return cycle;
}
