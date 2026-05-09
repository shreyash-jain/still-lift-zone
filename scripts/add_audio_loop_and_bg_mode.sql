-- Add audio loop flag and background audio playback mode to still_zone_content
-- Run in Supabase SQL editor

ALTER TABLE still_zone_content ADD COLUMN IF NOT EXISTS audio_loop BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE still_zone_content ADD COLUMN IF NOT EXISTS background_audio_mode TEXT NOT NULL DEFAULT 'after' CHECK (background_audio_mode IN ('with', 'after'));
