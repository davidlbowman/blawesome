interface FormatDateParams {
	date: Date;
	month?: "short" | "long";
	day?: "numeric" | "2-digit";
	year?: "numeric" | "2-digit";
}

export function formatDate({
	date,
	month = "short",
	day = "numeric",
	year = "numeric",
}: FormatDateParams) {
	return new Intl.DateTimeFormat("en-US", {
		month,
		day,
		year,
	}).format(date);
}
