-- Add per-track audio volume (0–100) to still_zone_content
-- Run in Supabase SQL editor

ALTER TABLE still_zone_content
    ADD COLUMN IF NOT EXISTS audio_volume INTEGER NOT NULL DEFAULT 80
        CHECK (audio_volume BETWEEN 0 AND 100);

ALTER TABLE still_zone_content
    ADD COLUMN IF NOT EXISTS background_audio_volume INTEGER NOT NULL DEFAULT 40
        CHECK (background_audio_volume BETWEEN 0 AND 100);

ALTER TABLE still_zone_content
    ADD COLUMN IF NOT EXISTS completion_audio_volume INTEGER NOT NULL DEFAULT 80
        CHECK (completion_audio_volume BETWEEN 0 AND 100);

ALTER TABLE still_zone_content
    ADD COLUMN IF NOT EXISTS beep_audio_volume INTEGER NOT NULL DEFAULT 80
        CHECK (beep_audio_volume BETWEEN 0 AND 100);
