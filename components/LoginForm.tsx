"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { verifyUser } from "@/lib/drizzle/users/verifyUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			const user = await verifyUser(data);
			console.log(user);
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						Login
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div>
							<Input
								type="email"
								placeholder="Email"
								{...register("email")}
								className="w-full"
							/>
							{errors.email && (
								<p className="text-sm text-red-500 mt-1">
									{errors.email.message}
								</p>
							)}
						</div>
						<div>
							<Input
								type="password"
								placeholder="Password"
								{...register("password")}
								className="w-full"
							/>
							{errors.password && (
								<p className="text-sm text-red-500 mt-1">
									{errors.password.message}
								</p>
							)}
						</div>
						<Button type="submit" className="w-full">
							{"Log in"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
