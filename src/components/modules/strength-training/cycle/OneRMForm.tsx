"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getUserId } from "@/drizzle/core/functions/users/getUserId";
import { getPrimaryExerciseDefinitions } from "@/drizzle/modules/strength-training/functions/exerciseDefinitions/getPrimaryExerciseDefinitions";
import { insertOneRepMax } from "@/drizzle/modules/strength-training/functions/oneRepMaxes/insertOneRepMax";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
	squat: z.coerce
		.number()
		.min(0, "Weight must be a positive number")
		.optional(),
	deadlift: z.coerce
		.number()
		.min(0, "Weight must be a positive number")
		.optional(),
	benchPress: z.coerce
		.number()
		.min(0, "Weight must be a positive number")
		.optional(),
	overheadPress: z.coerce
		.number()
		.min(0, "Weight must be a positive number")
		.optional(),
});

export function OneRMForm() {
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const userIdResponse = await getUserId();
			if (!userIdResponse.success || !userIdResponse.data) {
				throw new Error("Failed to get user ID");
			}
			const userId = userIdResponse.data.id;

			const exerciseDefinitions = await getPrimaryExerciseDefinitions();
			const exercises = [
				{
					id: exerciseDefinitions.find((e) => e.name === "Squat")?.id,
					weight: values.squat,
				},
				{
					id: exerciseDefinitions.find((e) => e.name === "Deadlift")?.id,
					weight: values.deadlift,
				},
				{
					id: exerciseDefinitions.find((e) => e.name === "Bench Press")?.id,
					weight: values.benchPress,
				},
				{
					id: exerciseDefinitions.find((e) => e.name === "Overhead Press")?.id,
					weight: values.overheadPress,
				},
			];
			const validExercises = exercises
				.filter(
					(exercise): exercise is { id: string; weight: number } =>
						typeof exercise.id === "string" &&
						typeof exercise.weight === "number",
				)
				.map((exercise) => ({
					userId,
					exerciseDefinitionId: exercise.id,
					weight: exercise.weight,
				}));

			// Insert one at a time to better identify which one fails
			for (const exercise of validExercises) {
				try {
					const insertResponse = await insertOneRepMax({
						oneRepMax: {
							userId,
							exerciseDefinitionId: exercise.exerciseDefinitionId,
							weight: exercise.weight,
						},
					});
					if (!insertResponse.success) {
						throw new Error("Failed to insert exercise");
					}
				} catch (error) {
					console.error("Failed to insert exercise:", exercise, error);
					throw error;
				}
			}

			router.refresh();
		} catch (error) {
			console.error("Error inserting 1RMs:", error);
			throw error;
		}
	}

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl font-bold">Your 1RMs</CardTitle>
				<CardDescription>
					A 1RM (One-Rep Max) is the maximum weight you can lift for a single
					repetition of an exercise with proper form. It's a key measure of
					strength in weightlifting.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="squat"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Squat</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Weight in lbs"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="deadlift"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Deadlift</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Weight in lbs"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="benchPress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Bench Press</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Weight in lbs"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="overheadPress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Overhead Press</FormLabel>
										<FormControl>
											<Input
												type="number"
												placeholder="Weight in lbs"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<Button type="submit" className="w-full mt-6">
							Submit
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
