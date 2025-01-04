import { WorkoutView } from "@/components/WorkoutView";
import { getWorkoutDetails } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutDetails";

export default async function WorkoutPage({
	params,
}: {
	params: Promise<{ workoutId: string; cycleId: string }>;
}) {
	const { workoutId } = await params;
	const workoutDetails = await getWorkoutDetails(workoutId);

	if (!workoutDetails) {
		return (
			<div className="container mx-auto p-6">
				<h1 className="text-2xl font-bold mb-6">No workout found</h1>
			</div>
		);
	}

	return <WorkoutView workout={workoutDetails} />;
}
