import { WorkoutCard } from "@/components/WorkoutCard";
import { getWorkoutDetails } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutDetails";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas";

interface PageProps {
	params: Promise<{
		cycleId: CyclesSelect["id"];
	}>;
}

export default async function CyclePage({ params }: PageProps) {
	const { cycleId } = await params;
	const workoutDetails = await getWorkoutDetails(undefined, cycleId);

	if (!workoutDetails) {
		return (
			<div className="container mx-auto p-6">
				<h1 className="text-2xl font-bold mb-6">No workouts found</h1>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Next Workout</h1>
			<WorkoutCard {...workoutDetails} />
		</div>
	);
}
