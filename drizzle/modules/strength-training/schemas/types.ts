export const PrimaryLift = {
	Squat: "squat",
	Bench: "bench",
	Deadlift: "deadlift",
	Overhead: "overhead",
};

export const ExerciseType = {
	Primary: "primary",
	Variation: "variation",
	Accessory: "accessory",
} as const;

export const ExerciseCategory = {
	// Primary Categories
	MainLift: "main_lift",
	MainLiftVariation: "main_lift_variation",

	// Leg Day Categories
	CompoundLeg: "compound_leg",
	QuadAccessory: "quad_accessory",
	HamstringGluteAccessory: "hamstring_glute_accessory",
	CalfAccessory: "calf_accessory",

	// Push Day Categories
	ChestAccessory: "chest_accessory",
	TricepAccessory: "tricep_accessory",

	// Pull Day Categories
	VerticalPullAccessory: "vertical_pull_accessory",
	LateralPullAccessory: "lateral_pull_accessory",
	BicepAccessory: "bicep_accessory",

	// Shoulder Day Categories
	DeltAccessory: "delt_accessory",
} as const;

export const Status = {
	Pending: "pending",
	InProgress: "in_progress",
	Completed: "completed",
};
