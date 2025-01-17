import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-3xl font-bold text-center">
						Welcome to Our App
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-center text-gray-600">
						We're glad you're here. Please log in or go to your dashboard.
					</p>
					<div className="flex justify-center space-x-4">
						<Link
							href="/login"
							className={buttonVariants({ variant: "default" })}
						>
							Login
						</Link>

						<Link
							href="/modules"
							className={buttonVariants({ variant: "outline" })}
						>
							Go to Dashboard
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
