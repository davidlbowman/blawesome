import { clearWorkoutData } from "@/lib/drizzle/scripts/clearWorkoutData";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		await clearWorkoutData();
		return NextResponse.json({ message: "Successfully cleared workout data" });
	} catch (error) {
		console.error("Error clearing workout data:", error);
		return NextResponse.json(
			{ error: "Failed to clear workout data" },
			{ status: 500 },
		);
	}
}
