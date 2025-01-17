"use client";

import { Button } from "@/components/ui/button";
import { createCycle } from "@/drizzle/modules/strength-training/functions/cycles/createCycle";
import type {
	CyclesSelect,
	WorkoutsSelect,
} from "@/drizzle/modules/strength-training/schemas";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { CycleList } from "./CycleList";
import { DashboardStats } from "./DashboardStats";

interface DashboardViewProps {
	userId: string;
	cycles: CyclesSelect[];
	workoutData: WorkoutsSelect[];
}

export function DashboardView({
	userId,
	cycles,
	workoutData,
}: DashboardViewProps) {
	const router = useRouter();

	// Calculate overall stats
	const totalCycles = cycles.length;
	const workoutsDone = workoutData.filter(
		(w) => w.status === "completed",
	).length;
	const totalVolume = 123456; // Eventually this will be calculated
	const consistency = 85; // Eventually this will be calculated

	async function handleStartNewCycle() {
		await createCycle({ userId });
		router.refresh();
	}

	return (
		<div className="container mx-auto p-6 space-y-8">
			<div className="flex justify-between items-center">
				<h1 className="text-4xl font-bold">Cycle Dashboard</h1>
				<form className="flex space-x-4">
					<Button type="submit" formAction={handleStartNewCycle}>
						<Plus className="mr-2 h-4 w-4" /> Start New Cycle
					</Button>
					<Button variant="outline" type="button" disabled>
						<Download className="mr-2 h-4 w-4" /> Export Data
					</Button>
				</form>
			</div>

			<DashboardStats
				totalCycles={totalCycles}
				workoutsDone={workoutsDone}
				totalVolume={totalVolume}
				consistency={consistency}
			/>

			<CycleList cycles={cycles} workoutData={workoutData} />
		</div>
	);
}
