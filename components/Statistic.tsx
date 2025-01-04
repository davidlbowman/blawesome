import { Card, CardContent } from "@/components/ui/card";

interface StatisticProps {
	value: string | number;
	label: string;
	description?: string;
	icon?: React.ReactNode;
}

export function Statistic({ value, label, description, icon }: StatisticProps) {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className="flex items-center gap-4">
					{icon && <div className="text-primary">{icon}</div>}
					<div className="space-y-1">
						<p className="text-2xl font-bold">{value}</p>
						<p className="text-sm font-medium text-muted-foreground">{label}</p>
						{description && (
							<p className="text-xs text-muted-foreground">{description}</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
