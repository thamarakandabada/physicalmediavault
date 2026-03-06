import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ error: 'Firecrawl not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role to update titles
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get all non-TV titles without runtime that belong to this user
    const { data: titles, error: fetchError } = await adminClient
      .from('titles')
      .select('id, title, year, director')
      .eq('user_id', user.id)
      .neq('media_type', 'TV')
      .is('runtime', null);

    if (fetchError) throw fetchError;

    console.log(`Found ${titles?.length ?? 0} titles to backfill`);

    let updated = 0;
    let failed = 0;

    for (const title of (titles ?? [])) {
      try {
        // Search blu-ray.com for this title
        const searchTerm = `${title.title} ${title.year ?? ''}`.trim();
        const searchUrl = `https://www.blu-ray.com/search/?quicksearch=1&quicksearch_country=US&quicksearch_keyword=${encodeURIComponent(searchTerm)}&section=bluraymovies`;

        const searchResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: searchUrl, formats: ['html'], onlyMainContent: false, waitFor: 2000 }),
        });

        const searchData = await searchResp.json();
        if (!searchResp.ok || !searchData.success) {
          console.error(`Search failed for "${title.title}"`);
          failed++;
          continue;
        }

        const searchHtml = searchData.data?.html || '';
        const hoverMatch = searchHtml.match(/class="hoverlink"[^>]*data-productid="\d+"[^>]*href="([^"]+)"/);
        if (!hoverMatch) {
          console.log(`No results for "${title.title}"`);
          failed++;
          continue;
        }

        const detailUrl = hoverMatch[1].startsWith('http') ? hoverMatch[1] : `https://www.blu-ray.com${hoverMatch[1]}`;

        // Scrape detail page for runtime
        const detailResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: detailUrl, formats: ['html'], onlyMainContent: false, waitFor: 2000 }),
        });

        const detailData = await detailResp.json();
        if (!detailResp.ok || !detailData.success) {
          console.error(`Detail scrape failed for "${title.title}"`);
          failed++;
          continue;
        }

        const detailHtml = detailData.data?.html || '';
        
        // Parse runtime — handles "1hr 20min", "1 hr 20 min", "80 min", etc.
        let runtime: number | null = null;
        const hrMinMatch = detailHtml.match(/(\d+)\s*hr\s*(\d+)\s*min/i);
        if (hrMinMatch) {
          runtime = parseInt(hrMinMatch[1]) * 60 + parseInt(hrMinMatch[2]);
        } else {
          const minMatch = detailHtml.match(/(\d+)\s*min/i);
          if (minMatch) runtime = parseInt(minMatch[1]);
        }

        if (runtime) {
          const { error: updateError } = await adminClient
            .from('titles')
            .update({ runtime })
            .eq('id', title.id);

          if (updateError) {
            console.error(`Update failed for "${title.title}":`, updateError);
            failed++;
          } else {
            console.log(`Updated "${title.title}" → ${runtime} min`);
            updated++;
          }
        } else {
          console.log(`No runtime found for "${title.title}"`);
          failed++;
        }

        // Rate limit: wait between requests
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {
        console.error(`Error processing "${title.title}":`, err);
        failed++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total: titles?.length ?? 0,
      updated,
      failed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Backfill error:', error);
    return new Response(JSON.stringify({ error: 'Backfill failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
