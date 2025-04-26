-- Migration: Remove foreign key constraints to auth.users on user_id columns

-- Books table
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_user_id_fkey;

-- Progress table
ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_user_id_fkey;

-- Recommendations table
ALTER TABLE recommendations DROP CONSTRAINT IF EXISTS recommendations_user_id_fkey;

-- Optionally, you may want to update the column definitions to just 'user_id uuid' in your schema files for future migrations.
