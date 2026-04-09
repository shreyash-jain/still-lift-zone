-- Test query to check if journal_notes table exists and get its structure
-- Run this in your Supabase SQL editor to verify the setup

-- Check if the table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'journal_notes';

-- If table exists, check its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'journal_notes'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'journal_notes';

-- Check if storage bucket exists
SELECT id, name, public
FROM storage.buckets
WHERE id = 'journal-audio';

-- Check if policies exist
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'journal_notes';