-- Journal Notes Table Schema for Supabase
-- This table stores user journal notes with text and audio content

CREATE TABLE IF NOT EXISTS public.journal_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Content Fields
    title text NOT NULL DEFAULT '',
    content text NOT NULL DEFAULT '',
    
    -- Audio Fields
    audio_url text, -- Supabase Storage URL for audio file
    audio_duration integer, -- Duration in seconds
    audio_mime_type text, -- e.g., 'audio/webm', 'audio/mp3'
    audio_size integer, -- File size in bytes
    
    -- Metadata
    mood text CHECK (mood IN ('great', 'good', 'okay', 'bad', 'awful')),
    tags text[] DEFAULT ARRAY[]::text[], -- Array of tags for categorization
    is_private boolean DEFAULT true,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_notes_user_id ON public.journal_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_notes_created_at ON public.journal_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_notes_mood ON public.journal_notes(mood);
CREATE INDEX IF NOT EXISTS idx_journal_notes_tags ON public.journal_notes USING GIN(tags);

-- Row Level Security (RLS)
ALTER TABLE public.journal_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own notes
CREATE POLICY "Users can view their own journal notes" 
ON public.journal_notes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal notes" 
ON public.journal_notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal notes" 
ON public.journal_notes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal notes" 
ON public.journal_notes FOR DELETE 
USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_journal_notes_updated_at 
    BEFORE UPDATE ON public.journal_notes 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('journal-audio', 'journal-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for journal audio files
CREATE POLICY "Users can upload their own journal audio" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'journal-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own journal audio" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'journal-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own journal audio" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'journal-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own journal audio" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'journal-audio' AND auth.uid()::text = (storage.foldername(name))[1]);