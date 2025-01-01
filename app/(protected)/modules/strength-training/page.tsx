import { OneRMForm } from "@/components/1RMForm";
import { createCycle } from "@/lib/drizzle/cycles/createCycle";
import { getCycles } from "@/lib/drizzle/cycles/getCycles";
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
	const userId = await getUserId();
	const hasAllLifts = await getUserOneRepMaxes();

	if (!hasAllLifts) {
		return <OneRMForm />;
	}

	let cycles = await getCycles(userId);

	if (cycles.length === 0) {
		const newCycle = await createCycle(userId);
		cycles = [newCycle];
	}

	return (
		<div>
			<pre>{JSON.stringify(cycles, null, 2)}</pre>
		</div>
	);
}
