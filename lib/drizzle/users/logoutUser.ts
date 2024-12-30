"use server";

import { cookies } from "next/headers";

export async function logoutUser() {
	try {
		// Delete the session cookie
		const cookiesStore = await cookies();
		cookiesStore.delete("session");
		return { success: true };
	} catch (error) {
		console.error("Logout error:", error);
		return { success: false, error: "Failed to logout" };
	}
}
