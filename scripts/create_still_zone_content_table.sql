-- Still Zone Content Management Table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS still_zone_content (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood                   TEXT NOT NULL,
  context                TEXT NOT NULL,
  support_type           TEXT NOT NULL,
  time_key               TEXT NOT NULL,
  action_type            TEXT NOT NULL,
  heading                TEXT,                 -- e.g. "Focus on your breath for 1 minute"
  message                TEXT NOT NULL,
  display_time           INTEGER NOT NULL,
  audio_url              TEXT,
  is_combo               BOOLEAN NOT NULL DEFAULT FALSE,
  combo_second_message   TEXT,
  combo_first_audio_url  TEXT,
  combo_second_audio_url TEXT,
  is_active              BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order             INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary lookup index for user-facing queries
CREATE INDEX IF NOT EXISTS idx_szc_lookup
  ON still_zone_content (mood, context, support_type, time_key)
  WHERE is_active = TRUE;

-- Admin listing index
CREATE INDEX IF NOT EXISTS idx_szc_admin
  ON still_zone_content (mood, support_type, time_key, sort_order);

-- Enable RLS
ALTER TABLE still_zone_content ENABLE ROW LEVEL SECURITY;

-- Public read for active content (anon/authenticated roles)
CREATE POLICY "Public read active content"
  ON still_zone_content FOR SELECT
  USING (is_active = TRUE);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated.
-- Admin access uses service role key which bypasses RLS.

-- Also create the storage bucket for content audio (run via Supabase dashboard):
-- Bucket name: still-zone-content-audio
-- Public: Yes
-- Allowed MIME: audio/mpeg, audio/mp3, audio/wav, audio/ogg, audio/webm, audio/m4a
-- Max file size: 20MB
