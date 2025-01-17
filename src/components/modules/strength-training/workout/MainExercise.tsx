"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Status } from "@/drizzle/modules/strength-training/types";

interface MainExerciseSet {
	id: string;
	setNumber: number;
	weight: number;
	reps: number | null;
	percentageOfMax: number;
	status: string;
}

interface MainExerciseProps {
	name: string;
	type: string;
	sets: MainExerciseSet[];
}

export function MainExercise({ name, type, sets }: MainExerciseProps) {
	return (
		<div className="rounded-lg bg-muted p-6">
			<h4 className="text-lg font-semibold mb-1">{name}</h4>
			<p className="text-sm text-muted-foreground mb-4">
				{`Type: ${type.charAt(0).toUpperCase()}${type.slice(1)}`}
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
					{sets.map((set) => (
						<TableRow
							key={set.id}
							className={
								set.status === Status.Enum.in_progress
									? "bg-primary/20"
									: set.status === Status.Enum.completed
										? "bg-muted-foreground/10"
										: ""
							}
						>
							<TableCell>{set.setNumber}</TableCell>
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
