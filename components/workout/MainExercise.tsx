import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";

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
		percentageOfMax: number;
		status: string;
	}>;
}

interface MainExerciseProps {
	exercise: ExerciseWithDefinition;
	currentExerciseIndex: number;
	currentSetIndex: number;
	workoutStatus: string;
}

export function MainExercise({
	exercise,
	currentExerciseIndex,
	currentSetIndex,
	workoutStatus,
}: MainExerciseProps) {
	return (
		<div className="rounded-lg bg-muted p-6">
			<h4 className="text-lg font-semibold mb-1">{exercise.definition.name}</h4>
			<p className="text-sm text-muted-foreground mb-4">
				{`Type: ${exercise.definition.type.charAt(0).toUpperCase()}${exercise.definition.type.slice(1)}`}
			</p>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Set</TableHead>
						<TableHead>Weight (lbs)</TableHead>
						<TableHead>Reps</TableHead>
						<TableHead>% of Max</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{exercise.sets.map((set) => (
						<TableRow
							key={set.id}
							className={
								workoutStatus === Status.InProgress &&
								currentExerciseIndex === 0
									? set.setNumber - 1 === currentSetIndex
										? "bg-primary/20"
										: set.status === Status.Completed
											? "bg-muted-foreground/10"
											: set.status === Status.Skipped
												? "bg-muted-foreground/5"
												: ""
									: set.status === Status.Completed
										? "bg-muted-foreground/10"
										: set.status === Status.Skipped
											? "bg-muted-foreground/5"
											: ""
							}
						>
							<TableCell className="flex items-center gap-2">
								<span>{set.setNumber}</span>
							</TableCell>
							<TableCell>{set.weight}</TableCell>
							<TableCell>{set.reps}</TableCell>
							<TableCell>{`${set.percentageOfMax}%`}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
