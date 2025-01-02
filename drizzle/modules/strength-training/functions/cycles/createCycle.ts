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

type ExerciseValue = {
	userId: string;
	workoutId: string;
	exerciseDefinitionId: string;
	order: number;
	status: string;
};

type SetValue = {
	userId: string;
	weight: number;
	reps: number;
	rpe: number;
	percentageOfMax: number;
	setNumber: number;
	status: string;
};

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

		// 3. Prepare exercise and set values together
		const { exerciseValues, setValues } = createdWorkouts.reduce<{
			exerciseValues: ExerciseValue[];
			setValues: { exercise: ExerciseValue; set: SetValue }[];
		}>(
			(acc, workout) => {
				const categories = EXERCISE_CATEGORIES[workout.primaryLift];

				categories.forEach((category, index) => {
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

					const exercise = {
						userId,
						workoutId: workout.id,
						exerciseDefinitionId: definition.id,
						order: index + 1,
						status: Status.Pending,
					};

					acc.exerciseValues.push(exercise);

					// Create 6 sets for this exercise
					const sets = Array.from({ length: 6 }).map((_, setIndex) => ({
						userId,
						weight: 100,
						reps:
							definition.type === ExerciseType.Primary
								? 5
								: (definition.repMax ?? 8),
						rpe:
							definition.type === ExerciseType.Primary
								? 7
								: (definition.rpeMax ?? 7),
						percentageOfMax: 70,
						setNumber: setIndex + 1,
						status: Status.Pending,
					}));

					acc.setValues.push(...sets.map((set) => ({ exercise, set })));
				});

				return acc;
			},
			{ exerciseValues: [], setValues: [] },
		);

		// 4. Create all exercises
		const createdExercises = await tx
			.insert(exercises)
			.values(exerciseValues)
			.returning({
				id: exercises.id,
				exerciseDefinitionId: exercises.exerciseDefinitionId,
				workoutId: exercises.workoutId,
			});

		// 5. Create all sets (now we can map exercise IDs)
		const finalSetValues = setValues.map(({ exercise: exerciseValue, set }) => {
			// Find the created exercise that matches this exercise value
			const createdExercise = createdExercises.find(
				(e) =>
					e.exerciseDefinitionId === exerciseValue.exerciseDefinitionId &&
					e.workoutId === exerciseValue.workoutId,
			);

			if (!createdExercise) {
				throw new Error("Could not find matching exercise for set");
			}

			return {
				...set,
				exerciseId: createdExercise.id,
			};
		});

		const createdSets = await tx
			.insert(sets)
			.values(finalSetValues)
			.returning();

		return {
			...cycle,
			workouts: createdWorkouts,
			exercises: createdExercises,
			sets: createdSets,
		};
	});
}
