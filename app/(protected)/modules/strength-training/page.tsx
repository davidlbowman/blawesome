import { OneRMForm } from "@/components/strength-training/cycle/OneRMForm";
import { DashboardView } from "@/components/strength-training/dashboard/DashboardView";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { createCycle } from "@/drizzle/modules/strength-training/functions/cycles/createCycle";
import { getTrainingData } from "@/drizzle/modules/strength-training/functions/cycles/getTrainingData";
import { revalidatePath } from "next/cache";

export default async function StrengthTrainingPage() {
	const userId = await getUserId();
	const { hasAllMaxes, cycles, workoutData } = await getTrainingData(userId);

	if (!hasAllMaxes) {
		return <OneRMForm />;
	}

	async function startNewCycle() {
		"use server";
		await createCycle(userId);
		revalidatePath("/modules/strength-training");
	}

	return (
		<DashboardView
			cycles={cycles}
			workoutData={workoutData}
			onStartNewCycle={startNewCycle}
		/>
	);
}
