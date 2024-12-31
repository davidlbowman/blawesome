CREATE TABLE "exercise_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"primary_lift_day" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "exercise_definition_id" uuid;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_exercise_definition_id_exercise_definitions_id_fk" FOREIGN KEY ("exercise_definition_id") REFERENCES "public"."exercise_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "primary_lift_day";