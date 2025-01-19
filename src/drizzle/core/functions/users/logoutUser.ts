"use server";

import type { Response } from "@/drizzle/core/types";
import { cookies } from "next/headers";

type LogoutUserResponse = Promise<Response<void>>;

export async function logoutUser(): LogoutUserResponse {
	try {
		const cookiesStore = await cookies();
		cookiesStore.delete("session");
		return { success: true };
	} catch (error) {
		if (error instanceof Error) {
			return { success: false, error };
		}
		return { success: false, error: new Error("Failed to logout") };
	}
}
