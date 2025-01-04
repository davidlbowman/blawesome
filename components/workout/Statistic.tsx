interface StatisticProps {
	value: string;
	label: string;
}

export function Statistic({ value, label }: StatisticProps) {
	return (
		<div className="flex flex-col space-y-1.5">
			<span className="text-2xl font-semibold">{value}</span>
			<span className="text-sm text-muted-foreground">{label}</span>
		</div>
	);
}
