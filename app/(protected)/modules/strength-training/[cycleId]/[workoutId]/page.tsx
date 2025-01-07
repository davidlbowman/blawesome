import { WorkoutView } from "@/components/workout/WorkoutView";
import { getWorkoutById } from "@/drizzle/modules/strength-training/functions/workouts/getWorkoutById";
import { notFound } from "next/navigation";

interface Props {
	params: Promise<{
		cycleId: string;
		workoutId: string;
	}>;
}

export default async function WorkoutPage({ params }: Props) {
	const { workoutId, cycleId } = await params;
	const workout = await getWorkoutById(workoutId);

	if (!workout) {
		notFound();
	}

	return <WorkoutView workout={workout} cycleId={cycleId} />;
}
