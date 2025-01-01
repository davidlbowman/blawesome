import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	type ExerciseDefinitionsSelect,
	ExerciseType,
	Status,
	type WorkoutsSelect,
} from "@/lib/drizzle/schemas/strength-training";
import { Dumbbell } from "lucide-react";

interface WorkoutCardProps extends WorkoutsSelect {
	exercises: Array<{
		definition: ExerciseDefinitionsSelect;
		order: number;
		sets: Array<{
			weight: number;
			reps: number;
			rpe?: number | null;
			percentageOfMax?: number | null;
			setNumber: number;
			status: (typeof Status)[keyof typeof Status];
		}>;
	}>;
}

function getExerciseTypeLabel(type: string): string {
	switch (type) {
		case ExerciseType.Primary:
			return "Primary";
		case ExerciseType.Variation:
			return "Variation";
		case ExerciseType.Accessory:
			return "Accessory";
		default:
			return type;
	}
}

export function WorkoutCard({
	id,
	date,
	primaryLift,
	status,
	exercises,
}: WorkoutCardProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case Status.Completed:
				return "bg-green-500 text-white";
			case Status.InProgress:
				return "bg-blue-500 text-white";
			default:
				return "bg-secondary text-secondary-foreground";
		}
	};

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		}).format(new Date(date));
	};

	// Sort exercises by order
	const sortedExercises = [...exercises].sort((a, b) => a.order - b.order);

	const mainExercise = sortedExercises.find(
		(e) => e.definition.type === "primary",
	);

	const accessoryExercises = sortedExercises.filter(
		(e) => e.definition.type !== "primary",
	);

	return (
		<Card className="w-full max-w-4xl">
			<CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
				<div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
					<CardTitle className="text-lg font-medium">
						Workout {id.slice(0, 8)}
					</CardTitle>
					<Badge className={getStatusColor(status)}>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</Badge>
				</div>
				<div className="flex items-center space-x-2">
					<Dumbbell className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm text-muted-foreground">
						{formatDate(date)}
					</span>
				</div>
			</CardHeader>
			<CardContent>
				<h3 className="text-xl font-semibold mb-4">
					{primaryLift.charAt(0).toUpperCase() + primaryLift.slice(1)} Day
				</h3>

				{mainExercise && (
					<div className="space-y-6">
						<div className="bg-muted p-4 rounded-lg">
							<h4 className="text-lg font-medium mb-1">
								{mainExercise.definition.name}
							</h4>
							<p className="text-sm text-muted-foreground mb-3">
								Type: {getExerciseTypeLabel(mainExercise.definition.type)}
							</p>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Set</TableHead>
										<TableHead>Weight (lbs)</TableHead>
										<TableHead>Reps</TableHead>
										<TableHead>% of Max</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{mainExercise.sets.map((set) => (
										<TableRow
											key={`${mainExercise.definition.id}-${set.setNumber}`}
										>
											<TableCell>{set.setNumber}</TableCell>
											<TableCell>{set.weight}</TableCell>
											<TableCell>{set.reps}</TableCell>
											<TableCell>
												{set.percentageOfMax ? `${set.percentageOfMax}%` : "-"}
											</TableCell>
											<TableCell>{set.status}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							{accessoryExercises.map((exercise) => {
								const repRange =
									exercise.definition.type === ExerciseType.Variation
										? "6-10"
										: "8-15";
								const rpeRange =
									exercise.definition.type === ExerciseType.Variation
										? "5-7"
										: "5-8";

								return (
									<div
										key={exercise.definition.id}
										className="bg-muted p-4 rounded-lg"
									>
										<h4 className="text-base font-medium mb-1">
											{exercise.definition.name}
										</h4>
										<p className="text-sm text-muted-foreground mb-2">
											Type: {getExerciseTypeLabel(exercise.definition.type)}
										</p>
										<div className="grid grid-cols-3 gap-2 text-sm">
											<div>
												<span className="font-medium">RPE:</span> {rpeRange}
											</div>
											<div>
												<span className="font-medium">Reps:</span> {repRange}
											</div>
											<div>
												<span className="font-medium">Sets:</span>{" "}
												{exercise.sets.length}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{status === Status.Pending && (
					<Button className="w-full mt-6">Start Workout</Button>
				)}
			</CardContent>
		</Card>
	);
}
