// Fetches Letterboxd RSS feed for a given user and returns a list of recently
// watched films (title + year). RSS only contains the ~50 most recent activities.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_USERNAME = "thamarak";

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractCData(s: string): string {
  const m = s.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1] : s;
}

type WatchedEntry = { title: string; year: number | null; watchedAt: string | null };

function parseRss(xml: string): WatchedEntry[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const out: WatchedEntry[] = [];
  for (const item of items) {
    // Letterboxd uses custom namespaced fields. Prefer letterboxd:filmTitle/filmYear.
    const filmTitleMatch = item.match(/<letterboxd:filmTitle>([\s\S]*?)<\/letterboxd:filmTitle>/);
    const filmYearMatch = item.match(/<letterboxd:filmYear>([\s\S]*?)<\/letterboxd:filmYear>/);
    const titleTagMatch = item.match(/<title>([\s\S]*?)<\/title>/);
    const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    let title = "";
    let year: number | null = null;

    if (filmTitleMatch) {
      title = decodeEntities(extractCData(filmTitleMatch[1])).trim();
    } else if (titleTagMatch) {
      // Fallback: <title> looks like "Film Title, 2024 - ★★★★" or "Film Title, 2024"
      const raw = decodeEntities(extractCData(titleTagMatch[1])).trim();
      // Strip rating suffix
      const noRating = raw.replace(/\s*-\s*[★½]+.*$/u, "").trim();
      const ym = noRating.match(/^(.*),\s*(\d{4})$/);
      if (ym) {
        title = ym[1].trim();
        year = parseInt(ym[2], 10);
      } else {
        title = noRating;
      }
    }

    if (filmYearMatch) {
      const y = parseInt(extractCData(filmYearMatch[1]).trim(), 10);
      if (!Number.isNaN(y)) year = y;
    }

    if (!title) continue;

    out.push({
      title,
      year,
      watchedAt: pubDateMatch ? pubDateMatch[1].trim() : null,
    });
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const username = (url.searchParams.get("username") || DEFAULT_USERNAME).trim();

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return new Response(JSON.stringify({ error: "Invalid username" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const feedUrl = `https://letterboxd.com/${username}/rss/`;
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PhysicalMediaVault/1.0; +https://physicalmediavault.lovable.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      return new Response(
        JSON.stringify({
          error: `Letterboxd returned ${res.status}`,
          detail: body.slice(0, 200),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const xml = await res.text();
    const entries = parseRss(xml);

    return new Response(
      JSON.stringify({ username, count: entries.length, entries }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          // Light caching so we don't hammer Letterboxd if the page is refreshed often
          "Cache-Control": "public, max-age=600",
        },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
