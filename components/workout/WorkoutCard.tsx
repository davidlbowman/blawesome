import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status } from "@/drizzle/modules/strength-training/schemas/types";
import { CalendarDays, Dumbbell, Save } from "lucide-react";
import { AccessoryExercises } from "./AccessoryExercises";
import { MainExercise } from "./MainExercise";

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
	}>;
}

interface WorkoutCardProps {
	workoutState: {
		primaryLift: string;
		date: Date;
		status: string;
	};
	mainExercise: ExerciseWithDefinition;
	accessoryExercises: ExerciseWithDefinition[];
	currentExerciseIndex: number;
	currentSetIndex: number;
	isCollectingData: boolean;
	onStartSet: () => void;
	onCompleteSet: () => void;
	onSkipSet: () => void;
}

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
};

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

export function WorkoutCard({
	workoutState,
	mainExercise,
	accessoryExercises,
	currentExerciseIndex,
	currentSetIndex,
	isCollectingData,
	onStartSet,
	onCompleteSet,
	onSkipSet,
}: WorkoutCardProps) {
	return (
		<Card className="w-full space-y-3">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Dumbbell className="h-6 w-6 text-primary" />
						<div className="flex flex-col">
							<CardTitle className="text-2xl font-bold capitalize">
								{workoutState.primaryLift} Day
							</CardTitle>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<CalendarDays className="h-4 w-4" />
								<span>{formatDate(workoutState.date)}</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="icon"
							onClick={onCompleteSet}
							className="text-muted-foreground hover:text-primary"
							disabled={
								workoutState.status !== Status.InProgress || isCollectingData
							}
						>
							<Save className="h-5 w-5" />
						</Button>
						<Badge className={getStatusColor(workoutState.status)}>
							{workoutState.status.charAt(0).toUpperCase() +
								workoutState.status.slice(1)}
						</Badge>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{mainExercise && (
					<MainExercise
						exercise={mainExercise}
						currentExerciseIndex={currentExerciseIndex}
						currentSetIndex={currentSetIndex}
						workoutStatus={workoutState.status}
					/>
				)}

				<AccessoryExercises
					exercises={accessoryExercises}
					currentExerciseIndex={currentExerciseIndex}
					currentSetIndex={currentSetIndex}
					workoutStatus={workoutState.status}
				/>

				{workoutState.status === Status.Pending ? (
					<Button
						className="w-full"
						onClick={onStartSet}
						disabled={
							workoutState.status === Status.Completed || isCollectingData
						}
					>
						Start Workout
					</Button>
				) : (
					<div className="grid grid-cols-2 gap-2">
						<Button
							onClick={onStartSet}
							disabled={
								workoutState.status === Status.Completed || isCollectingData
							}
						>
							Rest
						</Button>
						{workoutState.status === Status.InProgress && !isCollectingData ? (
							<Button variant="outline" onClick={onSkipSet}>
								Skip Set
							</Button>
						) : (
							<div />
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
