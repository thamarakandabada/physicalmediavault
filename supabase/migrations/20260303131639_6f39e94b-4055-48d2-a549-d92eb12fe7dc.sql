
-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  price TEXT,
  retailer TEXT,
  image_url TEXT,
  purchased BOOLEAN NOT NULL DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Owner can view wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update wishlist" ON public.wishlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owner can delete wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_wishlist_updated_at
  BEFORE UPDATE ON public.wishlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
