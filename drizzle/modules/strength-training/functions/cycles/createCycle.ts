"use server";

import { db } from "@/drizzle/db";
import {
	ExerciseCategory,
	ExerciseType,
	PrimaryLift,
	Status,
	cycles,
	exerciseDefinitions,
	exercises,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";

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

export async function createCycle(userId: string) {
	// Get exercise definitions outside transaction since they're static
	const allExerciseDefinitions = await db
		.select({
			id: exerciseDefinitions.id,
			category: exerciseDefinitions.category,
			type: exerciseDefinitions.type,
			primaryLiftDay: exerciseDefinitions.primaryLiftDay,
			repMax: exerciseDefinitions.repMax,
			rpeMax: exerciseDefinitions.rpeMax,
		})
		.from(exerciseDefinitions);

	return await db.transaction(async (tx) => {
		const startDate = new Date();
		const totalWorkouts = 16;

		// 1. Create cycle
		const [cycle] = await tx
			.insert(cycles)
			.values({
				userId,
				startDate,
				status: Status.Pending,
			})
			.returning();

		// 2. Create workouts (prepare all values first)
		const workoutValues = Array.from({ length: totalWorkouts }).map(
			(_, index) => {
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
			},
		);

		const createdWorkouts = await tx
			.insert(workouts)
			.values(workoutValues)
			.returning({
				id: workouts.id,
				primaryLift: workouts.primaryLift,
			});

		// 3. Prepare exercise values
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

		// 4. Create all exercises
		const createdExercises = await tx
			.insert(exercises)
			.values(exerciseValues)
			.returning({
				id: exercises.id,
				exerciseDefinitionId: exercises.exerciseDefinitionId,
				workoutId: exercises.workoutId,
			});

		// 5. Create sets in batches
		const setValues = createdExercises.flatMap((exercise) => {
			const definition = allExerciseDefinitions.find(
				(def) => def.id === exercise.exerciseDefinitionId,
			);

			if (!definition) {
				throw new Error(
					`Could not find exercise definition for exercise ${exercise.id}`,
				);
			}

			return Array.from({ length: 6 }).map((_, setIndex) => ({
				userId,
				exerciseId: exercise.id,
				weight: 100,
				reps:
					definition.type === ExerciseType.Primary
						? 5
						: (definition.repMax ?? 8),
				rpe:
					definition.type === ExerciseType.Primary
						? 7
						: (definition.rpeMax ?? 7),
				percentageOfMax: definition.type === ExerciseType.Primary ? 70 : null,
				setNumber: setIndex + 1,
				status: Status.Pending,
			}));
		});

		// Split sets into chunks of 100 for more efficient insertion
		const setChunks = chunkArray(setValues, 100);
		for (const chunk of setChunks) {
			await tx.insert(sets).values(chunk);
		}

		return cycle;
	});
}
