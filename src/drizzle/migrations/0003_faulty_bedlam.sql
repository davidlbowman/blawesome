PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "created_at", "updated_at") SELECT "id", "email", "password", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `__new_cycles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_cycles`("id", "user_id", "start_date", "end_date", "status", "created_at", "updated_at", "completed_at") SELECT "id", "user_id", "start_date", "end_date", "status", "created_at", "updated_at", "completed_at" FROM `cycles`;--> statement-breakpoint
DROP TABLE `cycles`;--> statement-breakpoint
ALTER TABLE `__new_cycles` RENAME TO `cycles`;--> statement-breakpoint
CREATE TABLE `__new_exercise_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`primary_lift_day` text NOT NULL,
	`rpe_max` integer,
	`rep_max` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_exercise_definitions`("id", "name", "type", "category", "primary_lift_day", "rpe_max", "rep_max", "created_at", "updated_at") SELECT "id", "name", "type", "category", "primary_lift_day", "rpe_max", "rep_max", "created_at", "updated_at" FROM `exercise_definitions`;--> statement-breakpoint
DROP TABLE `exercise_definitions`;--> statement-breakpoint
ALTER TABLE `__new_exercise_definitions` RENAME TO `exercise_definitions`;--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_definitions_name_type_unique` ON `exercise_definitions` (`name`,`type`);--> statement-breakpoint
CREATE TABLE `__new_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workout_id` text NOT NULL,
	`exercise_definition_id` text NOT NULL,
	`one_rep_max` integer,
	`order` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_exercises`("id", "user_id", "workout_id", "exercise_definition_id", "one_rep_max", "order", "status", "created_at", "updated_at", "completed_at") SELECT "id", "user_id", "workout_id", "exercise_definition_id", "one_rep_max", "order", "status", "created_at", "updated_at", "completed_at" FROM `exercises`;--> statement-breakpoint
DROP TABLE `exercises`;--> statement-breakpoint
ALTER TABLE `__new_exercises` RENAME TO `exercises`;--> statement-breakpoint
CREATE TABLE `__new_one_rep_maxes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exercise_definition_id` text NOT NULL,
	`weight` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_one_rep_maxes`("id", "user_id", "exercise_definition_id", "weight", "created_at", "updated_at") SELECT "id", "user_id", "exercise_definition_id", "weight", "created_at", "updated_at" FROM `one_rep_maxes`;--> statement-breakpoint
DROP TABLE `one_rep_maxes`;--> statement-breakpoint
ALTER TABLE `__new_one_rep_maxes` RENAME TO `one_rep_maxes`;--> statement-breakpoint
CREATE UNIQUE INDEX `one_rep_maxes_user_id_exercise_definition_id_unique` ON `one_rep_maxes` (`user_id`,`exercise_definition_id`);--> statement-breakpoint
CREATE TABLE `__new_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`weight` integer NOT NULL,
	`reps` integer NOT NULL,
	`rpe` integer,
	`percentage_of_max` integer,
	`set_number` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sets`("id", "user_id", "exercise_id", "weight", "reps", "rpe", "percentage_of_max", "set_number", "status", "created_at", "updated_at", "completed_at") SELECT "id", "user_id", "exercise_id", "weight", "reps", "rpe", "percentage_of_max", "set_number", "status", "created_at", "updated_at", "completed_at" FROM `sets`;--> statement-breakpoint
DROP TABLE `sets`;--> statement-breakpoint
ALTER TABLE `__new_sets` RENAME TO `sets`;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cycle_id` text NOT NULL,
	`primary_lift` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`sequence` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cycle_id`) REFERENCES `cycles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "user_id", "cycle_id", "primary_lift", "status", "sequence", "created_at", "updated_at", "completed_at") SELECT "id", "user_id", "cycle_id", "primary_lift", "status", "sequence", "created_at", "updated_at", "completed_at" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;