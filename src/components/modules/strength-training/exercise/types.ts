import type { ExerciseDefinitionsSelect } from "@/drizzle/modules/strength-training/schemas/exerciseDefinitions";
import type { ExercisesSelect } from "@/drizzle/modules/strength-training/schemas/exercises";
import type { SetsSelect } from "@/drizzle/modules/strength-training/schemas/sets";

export type ExerciseSet = Pick<
	SetsSelect,
	"id" | "setNumber" | "weight" | "reps" | "rpe" | "status"
>;

export interface ExerciseWithSets
	extends Omit<
		ExercisesSelect,
		| "userId"
		| "workoutId"
		| "exerciseDefinitionId"
		| "order"
		| "createdAt"
		| "updatedAt"
		| "completedAt"
	> {
	name: string;
	type: ExerciseDefinitionsSelect["type"];
	sets: ExerciseSet[];
}
