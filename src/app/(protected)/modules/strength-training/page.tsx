import { OneRMForm } from "@/components/modules/strength-training/cycle/OneRMForm";
import { DashboardView } from "@/components/modules/strength-training/dashboard/DashboardView";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { getTrainingData } from "@/drizzle/modules/strength-training/functions/cycles/getTrainingData";

export default async function StrengthTrainingPage() {
	const userIdResponse = await getUserId();
	if (!userIdResponse.success || !userIdResponse.data) {
		throw new Error("Failed to get user ID");
	}
	const userId = userIdResponse.data;
	const { hasAllMaxes, cycles, workoutData } = await getTrainingData(userId);

	if (!hasAllMaxes) {
		return <OneRMForm />;
	}

	return (
		<DashboardView userId={userId} cycles={cycles} workoutData={workoutData} />
	);
}
