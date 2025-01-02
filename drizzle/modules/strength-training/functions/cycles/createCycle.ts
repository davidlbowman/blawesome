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
	const startDate = new Date();

	// First parallel operation: Get exercise definitions and create cycle
	const [allExerciseDefinitions, [cycle]] = await Promise.all([
		db
			.select({
				id: exerciseDefinitions.id,
				category: exerciseDefinitions.category,
				type: exerciseDefinitions.type,
				primaryLiftDay: exerciseDefinitions.primaryLiftDay,
				repMax: exerciseDefinitions.repMax,
				rpeMax: exerciseDefinitions.rpeMax,
			})
			.from(exerciseDefinitions),
		db
			.insert(cycles)
			.values({
				userId,
				startDate,
				status: Status.Pending,
			})
			.returning(),
	]);

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
	const createdWorkouts = await db
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
	const createdExercises = await db
		.insert(exercises)
		.values(exerciseValues)
		.returning({
			id: exercises.id,
			exerciseDefinitionId: exercises.exerciseDefinitionId,
		});

	// Prepare set values
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
				definition.type === ExerciseType.Primary ? 5 : (definition.repMax ?? 8),
			rpe:
				definition.type === ExerciseType.Primary ? 7 : (definition.rpeMax ?? 7),
			percentageOfMax: definition.type === ExerciseType.Primary ? 70 : null,
			setNumber: setIndex + 1,
			status: Status.Pending,
		}));
	});

	// Split sets into chunks and insert all chunks in parallel
	const setChunks = chunkArray(setValues, 50); // Reduced chunk size for better parallelization
	await Promise.all(setChunks.map((chunk) => db.insert(sets).values(chunk)));

	return cycle;
}

// Run the function directly when this file is executed
if (require.main === module) {
	console.time("Total Execution Time");
	createCycle("325b426b-ee34-4acb-aae9-1dbaa4826d86")
		.then((cycle) => {
			console.log("Successfully created cycle:", cycle);
			console.timeEnd("Total Execution Time");
		})
		.catch((error) => {
			console.error("Error creating cycle:", error);
			process.exit(1);
		});
}
