import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExerciseWithDefinition {
	exercise: {
		id: string;
		order: number;
	};
	definition: {
		id: string;
		name: string;
		type: string;
		rpeMax: number | null;
		repMax: number | null;
	};
	sets: Array<{
		id: string;
		setNumber: number;
		weight: number;
		reps: number;
	}>;
}

interface SetPerformance {
	weight?: number;
	reps?: number;
	rpe?: number;
}

interface SetDataCollectionProps {
	exercise: ExerciseWithDefinition;
	currentSet: ExerciseWithDefinition["sets"][0];
	performance: SetPerformance;
	setPerformance: (perf: SetPerformance) => void;
	onComplete: () => void;
	restTimer: {
		time: number;
		formatTime: (time: number) => string;
	};
	currentExerciseIndex: number;
	totalExercises: number;
	onSkipRemainingInExercise: () => void;
}

export function SetDataCollection({
	exercise,
	currentSet,
	performance,
	setPerformance,
	onComplete,
	restTimer,
	currentExerciseIndex,
	totalExercises,
	onSkipRemainingInExercise,
}: SetDataCollectionProps) {
	const isPrimary = exercise.definition.type === "primary";
	const isLastSet = currentSet.setNumber === exercise.sets.length;
	const isLastExercise = currentExerciseIndex === totalExercises - 1;

	return (
		<div className="space-y-6 p-4">
			<div className="text-center space-y-3">
				<div className="text-6xl font-mono font-bold tracking-tight">
					{restTimer.formatTime(restTimer.time)}
				</div>
				<p className="text-sm text-muted-foreground">
					{isPrimary
						? "Enter your actual performance for this set. If you completed the set as prescribed, you can leave the values unchanged."
						: "Enter the weight used and select your RPE (Rate of Perceived Exertion) for this set."}
				</p>
			</div>

			{isPrimary ? (
				<div className="space-y-4">
					<div>
						<Label htmlFor="weight">Weight (lbs)</Label>
						<Input
							id="weight"
							type="number"
							value={performance.weight}
							onChange={(e) =>
								setPerformance({
									...performance,
									weight: Number(e.target.value),
								})
							}
						/>
					</div>

					<div>
						<Label htmlFor="reps">Reps</Label>
						<Input
							id="reps"
							type="number"
							value={performance.reps}
							onChange={(e) =>
								setPerformance({
									...performance,
									reps: Number(e.target.value),
								})
							}
						/>
					</div>
				</div>
			) : (
				<>
					<div>
						<Label htmlFor="weight">Weight (lbs)</Label>
						<Input
							id="weight"
							type="number"
							value={performance.weight}
							onChange={(e) =>
								setPerformance({
									...performance,
									weight: Number(e.target.value),
								})
							}
						/>
					</div>

					<div>
						<Label>RPE</Label>
						<div className="grid grid-cols-6 gap-2">
							{[5, 6, 7, 8, 9, 10].map((rpe) => (
								<Button
									key={rpe}
									variant={performance.rpe === rpe ? "default" : "outline"}
									onClick={() => setPerformance({ ...performance, rpe })}
								>
									{rpe}
								</Button>
							))}
						</div>
					</div>
				</>
			)}

			<div className="flex flex-col gap-2 pt-4">
				<Button onClick={onComplete}>
					{isLastSet ? "Start Next Exercise" : "Start Next Set"}
				</Button>
				<Button
					variant="ghost"
					className="text-destructive hover:text-destructive"
					onClick={onSkipRemainingInExercise}
				>
					{isLastExercise && isLastSet
						? "Finish Workout"
						: "Skip Remaining Sets"}
				</Button>
			</div>
		</div>
	);
}
