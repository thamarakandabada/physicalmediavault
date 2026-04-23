ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS watched boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_titles_watched ON public.titles(watched);