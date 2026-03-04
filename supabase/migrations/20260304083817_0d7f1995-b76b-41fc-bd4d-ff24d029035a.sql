
-- Create storage bucket for title cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('title-covers', 'title-covers', true);

-- Anyone can view cover images (public bucket)
CREATE POLICY "Anyone can view title covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'title-covers');

-- Authenticated users can upload their own covers
CREATE POLICY "Users can upload title covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'title-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own covers
CREATE POLICY "Users can update title covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'title-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own covers
CREATE POLICY "Users can delete title covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'title-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
