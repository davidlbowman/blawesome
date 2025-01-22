import { WorkoutView } from "@/components/modules/strength-training/workout/WorkoutView";
import { selectAllSetsByWorkoutId } from "@/drizzle/modules/strength-training/functions/sets/selectAllSetsByWorkoutId";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";
import type { WorkoutsSelect } from "@/drizzle/modules/strength-training/schemas/workouts";
import { notFound } from "next/navigation";

export default async function Page({
	params,
}: {
	params: Promise<{
		cycleId: CyclesSelect["id"];
		workoutId: WorkoutsSelect["id"];
	}>;
}) {
	const { cycleId, workoutId } = await params;

	const allSetsResponse = await selectAllSetsByWorkoutId({
		workoutId: { id: workoutId },
	});

	if (!allSetsResponse.success || !allSetsResponse.data) {
		return notFound();
	}

	return (
		<WorkoutView
			workoutId={{ id: workoutId }}
			cycleId={{ id: cycleId }}
			sets={allSetsResponse.data}
		/>
	);
}
