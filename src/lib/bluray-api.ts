import { supabase } from "@/integrations/supabase/client";

export type BluraySearchResult = {
  title: string;
  year: string;
  url: string;
  coverUrl: string;
  blurayId: string;
};

export type BlurayDetail = {
  title: string;
  year: number | null;
  director: string;
  publisher: string;
  video_quality: string;
  hdr_type: string;
  audio_type: string;
  package_type: string;
  region: string;
  media_type: string;
  runtime: number | null;
};

export async function searchBluray(keyword: string, country: string = 'US'): Promise<BluraySearchResult[]> {
  const { data, error } = await supabase.functions.invoke('bluray-search', {
    body: { action: 'search', keyword, country },
  });
  if (error) throw error;
  return data?.results ?? [];
}

export async function getBlurayDetail(url: string): Promise<BlurayDetail | null> {
  const { data, error } = await supabase.functions.invoke('bluray-search', {
    body: { action: 'detail', url },
  });
  if (error) throw error;
  return data?.data ?? null;
}
