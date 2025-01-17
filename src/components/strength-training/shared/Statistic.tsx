"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatisticProps {
	value: string | number;
	label: string;
	description?: string;
	icon?: React.ReactNode;
	className?: string;
	valueClassName?: string;
	labelClassName?: string;
	descriptionClassName?: string;
}

export function Statistic({
	value,
	label,
	description,
	icon,
	className,
	valueClassName,
	labelClassName,
	descriptionClassName,
}: StatisticProps) {
	return (
		<Card className={className}>
			<CardContent className="pt-6">
				<div className="flex items-center gap-4">
					{icon && <div className="text-primary">{icon}</div>}
					<div className="space-y-1">
						<p className={cn("text-2xl font-bold", valueClassName)}>{value}</p>
						<p
							className={cn(
								"text-sm font-medium text-muted-foreground",
								labelClassName,
							)}
						>
							{label}
						</p>
						{description && (
							<p
								className={cn(
									"text-xs text-muted-foreground",
									descriptionClassName,
								)}
							>
								{description}
							</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
