import { CycleView } from "@/components/modules/strength-training/cycle/CycleView";
import { selectWorkoutsByCycleId } from "@/drizzle/modules/strength-training/functions/workouts/selectWorkoutsByCycleId";
import type { CyclesSelect } from "@/drizzle/modules/strength-training/schemas/cycles";

export default async function CyclePage({
	params,
}: { params: Promise<{ cycleId: CyclesSelect["id"] }> }) {
	const { cycleId } = await params;

	const workoutsResponse = await selectWorkoutsByCycleId({
		cycleId: { id: cycleId },
	});

	if (!workoutsResponse.success || !workoutsResponse.data) {
		return (
			<div className="container mx-auto p-6">
				<h1 className="text-2xl font-bold mb-6">No workouts found</h1>
			</div>
		);
	}
	const workouts = workoutsResponse.data;

	return <CycleView cycleId={{ id: cycleId }} workouts={workouts} />;
}
