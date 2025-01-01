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
import { Status } from "@/lib/drizzle/schemas/strength-training";
import type { WorkoutDetails } from "@/lib/drizzle/workouts/getWorkoutDetails";
import { Dumbbell } from "lucide-react";

function getStatusColor(status: string) {
	switch (status) {
		case Status.Completed:
			return "bg-green-500 text-white";
		case Status.InProgress:
			return "bg-blue-500 text-white";
		default:
			return "bg-secondary text-secondary-foreground";
	}
}

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
};

export function WorkoutCard({
	id,
	date,
	primaryLift,
	status,
	exercises,
}: WorkoutDetails) {
	const sortedExercises = [...exercises].sort(
		(a, b) => a.exercise.order - b.exercise.order,
	);

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
								{`Type: ${mainExercise.definition.type.charAt(0).toUpperCase()}${mainExercise.definition.type.slice(1)}`}
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
							{accessoryExercises.map((exercise) => (
								<div
									key={exercise.definition.id}
									className="bg-muted p-4 rounded-lg"
								>
									<h4 className="text-base font-medium mb-1">
										{exercise.definition.name}
									</h4>
									<p className="text-sm text-muted-foreground mb-2">
										{`Type: ${exercise.definition.type.charAt(0).toUpperCase()}${exercise.definition.type.slice(1)}`}
									</p>
									<div className="grid grid-cols-3 gap-2 text-sm">
										<div>
											<span className="font-medium">RPE:</span>{" "}
											{exercise.definition.rpeMin}-{exercise.definition.rpeMax}
										</div>
										<div>
											<span className="font-medium">Reps:</span>{" "}
											{exercise.definition.repMin}-{exercise.definition.repMax}
										</div>
										<div>
											<span className="font-medium">Sets:</span>{" "}
											{exercise.sets.length}
										</div>
									</div>
								</div>
							))}
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
