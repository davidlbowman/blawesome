CREATE TABLE "one_rep_maxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"exercise_definition_id" uuid NOT NULL,
	"weight" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "one_rep_maxes" ADD CONSTRAINT "one_rep_maxes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "one_rep_maxes" ADD CONSTRAINT "one_rep_maxes_exercise_definition_id_exercise_definitions_id_fk" FOREIGN KEY ("exercise_definition_id") REFERENCES "public"."exercise_definitions"("id") ON DELETE no action ON UPDATE no action;