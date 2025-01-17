/**
 * Rounds a number down to the nearest multiple of 5.
 * Used for weight calculations in workouts.
 */
export function roundDownToNearest5(num: number): number {
	return Math.floor(num / 5) * 5;
}
