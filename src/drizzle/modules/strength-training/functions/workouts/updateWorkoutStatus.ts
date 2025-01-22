import type { Response } from "@/drizzle/core/types";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { type WorkoutsSelect, workouts } from "../../schemas/workouts";

interface UpdateWorkoutStatusParams {
	workout: Pick<WorkoutsSelect, "id" | "status">;
}

type UpdateWorkoutStatusResponse = Promise<Response<void>>;

export async function updateWorkoutStatus({
	workout,
}: UpdateWorkoutStatusParams): UpdateWorkoutStatusResponse {
	try {
		await db
			.update(workouts)
			.set({ status: workout.status })
			.where(eq(workouts.id, workout.id));

		return { success: true, data: undefined };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error
					: new Error("Failed to update workout status"),
		};
	}
}
