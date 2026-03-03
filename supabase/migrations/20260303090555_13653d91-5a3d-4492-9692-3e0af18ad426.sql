
-- Create titles table
CREATE TABLE public.titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  director TEXT,
  spine_number INTEGER,
  video_quality TEXT,
  hdr_type TEXT,
  audio_type TEXT,
  package_type TEXT,
  publisher TEXT,
  media_type TEXT NOT NULL DEFAULT 'Film' CHECK (media_type IN ('Film', 'TV')),
  region TEXT CHECK (region IN ('UK', 'US', 'UK/US')),
  parent_id UUID REFERENCES public.titles(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;

-- Public can view all titles
CREATE POLICY "Anyone can view titles"
ON public.titles
FOR SELECT
USING (true);

-- Only authenticated owner can insert
CREATE POLICY "Owner can insert titles"
ON public.titles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only authenticated owner can update their titles
CREATE POLICY "Owner can update titles"
ON public.titles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Only authenticated owner can delete their titles
CREATE POLICY "Owner can delete titles"
ON public.titles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Index for parent lookups
CREATE INDEX idx_titles_parent_id ON public.titles(parent_id);

-- Index for spine number sorting
CREATE INDEX idx_titles_spine_number ON public.titles(spine_number);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_titles_updated_at
BEFORE UPDATE ON public.titles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
