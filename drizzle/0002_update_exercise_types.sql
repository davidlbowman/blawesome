-- Update compound and isolation types to accessory
UPDATE "exercise_definitions"
SET "type" = 'accessory'
WHERE "type" IN ('compound', 'isolation'); 