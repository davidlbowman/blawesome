PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exercise_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`primary_lift_day` text NOT NULL,
	`rpe_max` integer,
	`rep_max` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_exercise_definitions`("id", "name", "type", "category", "primary_lift_day", "rpe_max", "rep_max", "created_at", "updated_at") SELECT "id", "name", "type", "category", "primary_lift_day", "rpe_max", "rep_max", "created_at", "updated_at" FROM `exercise_definitions`;--> statement-breakpoint
DROP TABLE `exercise_definitions`;--> statement-breakpoint
ALTER TABLE `__new_exercise_definitions` RENAME TO `exercise_definitions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_definitions_name_type_unique` ON `exercise_definitions` (`name`,`type`);