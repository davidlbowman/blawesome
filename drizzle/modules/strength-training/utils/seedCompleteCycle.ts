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
	oneRepMaxes,
	sets,
	workouts,
} from "@/drizzle/modules/strength-training/schemas";
import { eq } from "drizzle-orm";

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

export async function seedCompleteCycle(userId: string) {
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

	// Get one rep maxes for the user
	const userOneRepMaxes = await db
		.select()
		.from(oneRepMaxes)
		.where(eq(oneRepMaxes.userId, userId));

	return await db.transaction(async (tx) => {
		// Create dates for a completed cycle
		const endDate = new Date();
		const startDate = new Date(endDate);
		startDate.setDate(endDate.getDate() - 32); // 16 workouts * 2 days
		const totalWorkouts = 16;

		// 1. Create completed cycle
		const [cycle] = await tx
			.insert(cycles)
			.values({
				userId,
				startDate,
				endDate,
				status: Status.Completed,
				completedAt: endDate,
			})
			.returning();

		// 2. Create completed workouts
		const workoutValues = Array.from({ length: totalWorkouts }).map(
			(_, index) => {
				const workoutDate = new Date(startDate);
				workoutDate.setDate(startDate.getDate() + index * 2);

				return {
					userId,
					cycleId: cycle.id,
					date: workoutDate,
					primaryLift: WORKOUT_SEQUENCE[index % WORKOUT_SEQUENCE.length],
					status: Status.Completed,
					sequence: index + 1,
					completedAt: workoutDate,
					updatedAt: workoutDate,
				};
			},
		);

		const createdWorkouts = await tx
			.insert(workouts)
			.values(workoutValues)
			.returning({
				id: workouts.id,
				primaryLift: workouts.primaryLift,
				status: workouts.status,
				sequence: workouts.sequence,
				completedAt: workouts.completedAt,
			});

		// 3. Create completed exercises
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
					status: Status.Completed,
					completedAt: workout.completedAt,
					updatedAt: workout.completedAt,
				};
			});
		});

		const createdExercises = await tx
			.insert(exercises)
			.values(exerciseValues)
			.returning({
				id: exercises.id,
				exerciseDefinitionId: exercises.exerciseDefinitionId,
				workoutId: exercises.workoutId,
				status: exercises.status,
				completedAt: exercises.completedAt,
			});

		// 4. Create completed sets
		const setValues = createdExercises.flatMap((exercise) => {
			const definition = allExerciseDefinitions.find(
				(def) => def.id === exercise.exerciseDefinitionId,
			);

			if (!definition) {
				throw new Error(
					`Could not find exercise definition for exercise ${exercise.id}`,
				);
			}

			// Find one rep max for primary lifts
			const oneRepMax =
				definition.type === ExerciseType.Primary
					? userOneRepMaxes.find(
							(orm) => orm.exerciseDefinitionId === definition.id,
						)?.weight
					: null;

			return Array.from({ length: 6 }).map((_, setIndex) => ({
				userId,
				exerciseId: exercise.id,
				weight: oneRepMax ? Math.floor(oneRepMax * 0.7) : 100, // 70% of 1RM for primary lifts
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
				status: Status.Completed,
				completedAt: exercise.completedAt,
				updatedAt: exercise.completedAt,
			}));
		});

		// Split sets into chunks of 100 for more efficient insertion
		const setChunks = chunkArray(setValues, 100);
		const createdSets = [];
		for (const chunk of setChunks) {
			const chunkSets = await tx.insert(sets).values(chunk).returning({
				id: sets.id,
				exerciseId: sets.exerciseId,
				weight: sets.weight,
				reps: sets.reps,
				rpe: sets.rpe,
				percentageOfMax: sets.percentageOfMax,
				setNumber: sets.setNumber,
				status: sets.status,
				completedAt: sets.completedAt,
			});
			createdSets.push(...chunkSets);
		}

		return {
			cycle,
			workouts: createdWorkouts,
			exercises: createdExercises,
			sets: createdSets,
		};
	});
}

async function main() {
	const DEFAULT_USER_ID = "325b426b-ee34-4acb-aae9-1dbaa4826d86";

	try {
		const userId = process.argv[2] || DEFAULT_USER_ID;
		console.log("Creating completed cycle for user:", userId);
		const result = await seedCompleteCycle(userId);
		console.log("Successfully seeded completed cycle:", {
			cycleId: result.cycle.id,
			workouts: result.workouts.length,
			exercises: result.exercises.length,
			sets: result.sets.length,
		});
	} catch (error) {
		console.error("Error seeding completed cycle:", error);
		process.exit(1);
	}
	process.exit(0);
}

if (require.main === module) {
	main();
}
