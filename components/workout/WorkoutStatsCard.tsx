import { Statistic } from "@/components/Statistic";
import { Dumbbell, Target, TrendingUp, Weight } from "lucide-react";

interface WorkoutStatsCardProps {
	totalSets: number;
	completedSets: number;
	totalVolume: number;
	volumeChange: number;
	primaryLiftWeight: number;
	primaryLiftChange: number;
	consistency: number;
}

export function WorkoutStatsCard({
	totalSets,
	completedSets,
	totalVolume,
	volumeChange,
	primaryLiftWeight,
	primaryLiftChange,
	consistency,
}: WorkoutStatsCardProps) {
	return (
		<div className="grid gap-4 md:grid-cols-4">
			<Statistic
				icon={<Target className="h-4 w-4" />}
				value={`${completedSets}/${totalSets}`}
				label="Total Sets"
				description={
					completedSets === totalSets
						? "All sets completed"
						: `${totalSets - completedSets} sets remaining`
				}
			/>
			<Statistic
				icon={<Weight className="h-4 w-4" />}
				value={`${totalVolume.toLocaleString()} lbs`}
				label="Total Volume"
				description={
					volumeChange > 0
						? `+${volumeChange} lbs from last workout`
						: volumeChange < 0
							? `${volumeChange} lbs from last workout`
							: "Same as last workout"
				}
			/>
			<Statistic
				icon={<Dumbbell className="h-4 w-4" />}
				value={`${primaryLiftWeight} lbs`}
				label="Primary Lift"
				description={
					primaryLiftChange > 0
						? `+${primaryLiftChange} lbs from last workout`
						: primaryLiftChange < 0
							? `${primaryLiftChange} lbs from last workout`
							: "Same as last workout"
				}
			/>
			<Statistic
				icon={<TrendingUp className="h-4 w-4" />}
				value={`${consistency}%`}
				label="Consistency"
				description="Sets completed as prescribed"
			/>
		</div>
	);
}
