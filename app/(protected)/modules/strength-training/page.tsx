import { OneRMForm } from "@/components/1RMForm";
import { db } from "@/lib/drizzle/db";
import { getPrimaryExerciseDefinitions } from "@/lib/drizzle/exerciseDefinitions/getPrimaryExerciseDefinitions";
import { oneRepMaxes } from "@/lib/drizzle/schemas/strength-training";
import { getUserId } from "@/lib/drizzle/users/getUserId";
import { eq } from "drizzle-orm";

async function getUserOneRepMaxes() {
	const userId = await getUserId();
	const allExerciseDefinitions = await getPrimaryExerciseDefinitions();

	const mainLiftNames = ["Squat", "Bench Press", "Deadlift", "Overhead Press"];
	const mainLifts = allExerciseDefinitions.filter((def) =>
		mainLiftNames.includes(def.name),
	);

	const lifts = await db
		.select()
		.from(oneRepMaxes)
		.where(eq(oneRepMaxes.userId, userId));

	const hasAllLifts = mainLifts.every((def) =>
		lifts.some((lift) => lift.exerciseDefinitionId === def.id),
	);

	return hasAllLifts;
}

export default async function StrengthTrainingPage() {
	const hasAllLifts = await getUserOneRepMaxes();

	return <div>{hasAllLifts ? <div>Hello World</div> : <OneRMForm />}</div>;
}
