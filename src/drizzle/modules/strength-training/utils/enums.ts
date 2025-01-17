import { z } from "zod";

export const Status = z.enum([
	"pending",
	"in_progress",
	"completed",
	"skipped",
]);
export type Status = z.infer<typeof Status>;

export const PrimaryLift = z.enum(["squat", "bench", "deadlift", "press"]);
export type PrimaryLift = z.infer<typeof PrimaryLift>;
