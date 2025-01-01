-- Add category column as nullable first
ALTER TABLE "exercise_definitions" ADD COLUMN "category" text;

-- Update existing data with appropriate categories
UPDATE "exercise_definitions"
SET "category" = CASE
    WHEN "type" = 'primary' THEN 'main_lift'
    WHEN "type" = 'variation' THEN 'main_lift_variation'
    WHEN "type" = 'compound' AND "primary_lift_day" = 'squat' THEN 'compound_leg'
    WHEN "type" = 'isolation' AND "primary_lift_day" = 'squat' THEN 'quad_accessory'
    WHEN "type" = 'compound' AND "primary_lift_day" = 'bench' THEN 'chest_accessory'
    WHEN "type" = 'isolation' AND "primary_lift_day" = 'bench' THEN 'tricep_accessory'
    WHEN "type" = 'compound' AND "primary_lift_day" = 'deadlift' THEN 'vertical_pull_accessory'
    WHEN "type" = 'isolation' AND "primary_lift_day" = 'deadlift' THEN 'bicep_accessory'
    WHEN "type" = 'isolation' AND "primary_lift_day" = 'overhead' THEN 'delt_accessory'
    ELSE 'main_lift' -- fallback
END;

-- Make category column non-nullable
ALTER TABLE "exercise_definitions" ALTER COLUMN "category" SET NOT NULL; 