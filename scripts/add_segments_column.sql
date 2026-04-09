-- Add segments JSONB column and beep audio to still_zone_content
-- Run in Supabase SQL editor

-- Segments: array of {duration, message, audio_url} for multi-part sessions
ALTER TABLE still_zone_content ADD COLUMN IF NOT EXISTS segments JSONB;

-- Beep/transition sound between segments (admin-configurable, not hardcoded)
ALTER TABLE still_zone_content ADD COLUMN IF NOT EXISTS beep_audio_url TEXT;

-- Drop old combo columns (now replaced by segments)
-- Keep them for backward compatibility but they won't be used for new entries
-- ALTER TABLE still_zone_content DROP COLUMN IF EXISTS combo_second_message;
-- ALTER TABLE still_zone_content DROP COLUMN IF EXISTS combo_first_audio_url;
-- ALTER TABLE still_zone_content DROP COLUMN IF EXISTS combo_second_audio_url;
