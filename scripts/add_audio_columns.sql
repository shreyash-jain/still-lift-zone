-- Add background audio, completion sound, and beep sound columns to still_zone_content
-- Run in Supabase SQL editor

ALTER TABLE still_zone_content ADD COLUMN IF NOT EXISTS background_audio_url TEXT;
ALTER TABLE still_zone_content ADD COLUMN IF NOT EXISTS completion_audio_url TEXT;
ALTER TABLE still_zone_content ADD COLUMN IF NOT EXISTS beep_audio_url TEXT;
