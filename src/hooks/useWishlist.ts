import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type WishlistItem = {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  price: string | null;
  retailer: string | null;
  image_url: string | null;
  purchased: boolean;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
};

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .order("purchased", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WishlistItem[];
    },
  });
}

export function useAddWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      user_id: string;
      url: string;
      title?: string | null;
      price?: string | null;
      retailer?: string | null;
      image_url?: string | null;
    }) => {
      const { data, error } = await supabase.from("wishlist").insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useTogglePurchased() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, purchased }: { id: string; purchased: boolean }) => {
      const { error } = await supabase
        .from("wishlist")
        .update({
          purchased,
          purchased_at: purchased ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useDeleteWishlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wishlist").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}
