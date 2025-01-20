import { OneRMForm } from "@/components/modules/strength-training/cycle/OneRMForm";
import { DashboardView } from "@/components/modules/strength-training/dashboard/DashboardView";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { getTrainingData } from "@/drizzle/modules/strength-training/functions/cycles/getTrainingData";

export default async function StrengthTrainingPage() {
	const userIdResponse = await getUserId();

	if (!userIdResponse.success || !userIdResponse.data) {
		throw new Error("Failed to get user ID");
	}

	const trainingDataResponse = await getTrainingData({
		userId: { id: userIdResponse.data.id },
	});

	if (!trainingDataResponse.success || !trainingDataResponse.data) {
		throw new Error("Failed to get training data");
	}

	const { hasAllMaxes, cycles, workoutData } = trainingDataResponse.data;

	if (!hasAllMaxes) {
		return <OneRMForm />;
	}

	return (
		<DashboardView
			userId={userIdResponse.data.id}
			cycles={cycles}
			workoutData={workoutData}
		/>
	);
}
