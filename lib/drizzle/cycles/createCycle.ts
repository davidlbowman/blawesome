"use server";

import { db } from "@/lib/drizzle/db";
import {
	type CyclesInsert,
	PrimaryLift,
	Status,
	type WorkoutsInsert,
	cycles,
	workouts,
} from "@/lib/drizzle/schemas/strength-training";

const TOTAL_WORKOUTS = 16;
const WORKOUT_SEQUENCE = [
	PrimaryLift.Squat,
	PrimaryLift.Bench,
	PrimaryLift.Deadlift,
	PrimaryLift.Overhead,
] as const;

export async function createCycle(userId: string) {
	const startDate = new Date();

	const cycleData: CyclesInsert = {
		userId,
		startDate,
		status: Status.Pending,
	};

	const [cycle] = await db.insert(cycles).values(cycleData).returning();

	const workoutValues: WorkoutsInsert[] = Array.from({
		length: TOTAL_WORKOUTS,
	}).map((_, index) => {
		const workoutDate = new Date(startDate);
		workoutDate.setDate(startDate.getDate() + index * 2);

		return {
			userId,
			cycleId: cycle.id,
			date: workoutDate,
			primaryLift: WORKOUT_SEQUENCE[index % WORKOUT_SEQUENCE.length],
			status: Status.Pending,
		};
	});

	const createdWorkouts = await db
		.insert(workouts)
		.values(workoutValues)
		.returning();

	return {
		...cycle,
		workouts: createdWorkouts,
	};
}
