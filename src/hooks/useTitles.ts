import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Title = Tables<"titles">;
export type TitleInsert = TablesInsert<"titles">;
export type TitleUpdate = TablesUpdate<"titles">;

export type TitleWithChildren = Title & { children: Title[] };

export function useTitles() {
  return useQuery({
    queryKey: ["titles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("titles")
        .select("*")
        .order("title", { ascending: true });
      if (error) throw error;
      return data as Title[];
    },
  });
}

export function useTitlesGrouped() {
  const query = useTitles();

  const grouped = query.data
    ? (() => {
        const parents = query.data.filter((t) => !t.parent_id);
        const children = query.data.filter((t) => t.parent_id);
        return parents.map((parent) => ({
          ...parent,
          children: children
            .filter((c) => c.parent_id === parent.id)
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
        })) as TitleWithChildren[];
      })()
    : [];

  return { ...query, data: grouped };
}

export function useInsertTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: TitleInsert) => {
      const { data, error } = await supabase.from("titles").insert(title).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["titles"] }),
  });
}

export function useUpdateTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TitleUpdate & { id: string }) => {
      const { data, error } = await supabase.from("titles").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["titles"] }),
  });
}

export function useDeleteTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("titles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["titles"] }),
  });
}
