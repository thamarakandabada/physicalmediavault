
-- Allow anyone to view wishlist items (public showcase like titles)
DROP POLICY "Owner can view wishlist" ON public.wishlist;
CREATE POLICY "Anyone can view wishlist" ON public.wishlist FOR SELECT USING (true);
