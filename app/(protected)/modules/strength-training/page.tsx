import { OneRMForm } from "@/components/strength-training/cycle/OneRMForm";
import { DashboardView } from "@/components/strength-training/dashboard/DashboardView";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { getTrainingData } from "@/drizzle/modules/strength-training/functions/cycles/getTrainingData";

export default async function StrengthTrainingPage() {
	const userId = await getUserId();
	const { hasAllMaxes, cycles, workoutData } = await getTrainingData(userId);

	if (!hasAllMaxes) {
		return <OneRMForm />;
	}

	return (
		<DashboardView userId={userId} cycles={cycles} workoutData={workoutData} />
	);
}
