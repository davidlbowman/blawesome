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
import { createUserSession } from "@/lib/drizzle/users/createUserSession";
import { verifyUser } from "@/lib/drizzle/users/verifyUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

function LoginFormContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/modules";

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			const user = await verifyUser(data).catch((error) => {
				console.error("Verify user error:", error);
				throw error;
			});

			if (!user) {
				form.setError("root", { message: "Invalid email or password" });
				return;
			}

			const session = await createUserSession(user).catch((error) => {
				console.error("Session creation error:", error);
				throw error;
			});

			if (!session.success) {
				console.error("Session creation error details:", {
					error: session.error,
					user: user.id,
				});
				form.setError("root", {
					message: session.error || "Failed to create session",
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
