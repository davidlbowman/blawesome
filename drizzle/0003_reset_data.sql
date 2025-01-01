-- Delete all data in reverse order of dependencies
DELETE FROM sets;
DELETE FROM exercises;
DELETE FROM workouts;
DELETE FROM cycles;
DELETE FROM one_rep_maxes;
DELETE FROM exercise_definitions; 