"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createUserSession } from "@/drizzle/core/functions/users/createUserSession";
import { verifyUser } from "@/drizzle/core/functions/users/verifyUser";
import { userSelectSchema } from "@/drizzle/core/schemas/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

function LoginFormContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/modules";

	const verifyUserSchema = userSelectSchema.pick({
		email: true,
		password: true,
	});
	type VerifyUser = z.infer<typeof verifyUserSchema>;

	const form = useForm<VerifyUser>({
		resolver: zodResolver(verifyUserSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: VerifyUser) {
		try {
			const userResponse = await verifyUser(data).catch((error: unknown) => {
				console.error("Verify user error:", error);
				throw error;
			});

			if (!userResponse.success || !userResponse.data) {
				form.setError("root", { message: "Invalid email or password" });
				return;
			}

			const sessionResponse = await createUserSession(userResponse.data).catch(
				(error: unknown) => {
					console.error("Session creation error:", error);
					throw error;
				},
			);

			if (!sessionResponse.success) {
				console.error("Session creation error details:", {
					error: sessionResponse.error,
					user: userResponse.data?.id,
				});
				form.setError("root", {
					message: sessionResponse.error?.message || "Failed to create session",
				});
				return;
			}

			router.push(callbackUrl);
			router.refresh();
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Login error details:", {
					name: error.name,
					message: error.message,
					stack: error.stack,
				});
			} else {
				console.error("Unknown login error:", error);
			}

			form.setError("root", {
				message: "An error occurred during login. Please try again.",
			});
		}
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{form.formState.errors.root && (
							<FormMessage>{form.formState.errors.root.message}</FormMessage>
						)}
						<Button
							type="submit"
							className="w-full"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? "Logging in..." : "Log in"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

export function LoginForm() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<Suspense fallback={<div>Loading...</div>}>
				<LoginFormContent />
			</Suspense>
		</div>
	);
}
