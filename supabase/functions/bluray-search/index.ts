import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Firecrawl not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, keyword, country, url } = await req.json();

    if (action === 'search') {
      const countryParam = country === 'UK' ? 'UK' : 'US';
      const searchUrl = `https://www.blu-ray.com/search/?quicksearch=1&quicksearch_country=${countryParam}&quicksearch_keyword=${encodeURIComponent(keyword)}&section=bluraymovies`;

      console.log('Scraping search URL via Firecrawl:', searchUrl);

      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchUrl,
          formats: ['html'],
          onlyMainContent: false,
          waitFor: 2000,
        }),
      });

      const scrapeData = await response.json();

      if (!response.ok || !scrapeData.success) {
        console.error('Firecrawl scrape error:', scrapeData);
        return new Response(JSON.stringify({ success: false, error: 'Scrape failed', results: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const html = scrapeData.data?.html || '';
      console.log('HTML length:', html.length);
      console.log('Contains hoverlink:', html.includes('hoverlink'));

      const results: Array<{
        title: string;
        year: string;
        url: string;
        coverUrl: string;
        blurayId: string;
      }> = [];

      // Match hoverlink anchors with data-productid, href, and title
      const hoverRegex = /class="hoverlink"[^>]*data-productid="(\d+)"[^>]*href="([^"]+)"[^>]*title="([^"]+)"/g;
      let match;

      while ((match = hoverRegex.exec(html)) !== null) {
        const productId = match[1];
        const href = match[2];
        const fullTitle = match[3];
        const yearMatch = fullTitle.match(/\((\d{4}(?:-\d{4})?)\)$/);
        const cleanTitle = fullTitle.replace(/\s*\(\d{4}(?:-\d{4})?\)$/, '');

        results.push({
          title: cleanTitle,
          year: yearMatch ? yearMatch[1] : '',
          url: href.startsWith('http') ? href : `https://www.blu-ray.com${href}`,
          coverUrl: `https://images.static-bluray.com/movies/covers/${productId}_medium.jpg`,
          blurayId: productId,
        });
      }

      console.log('Found results:', results.length);

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'detail') {
      if (!url) {
        return new Response(JSON.stringify({ success: false, error: 'URL required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Scraping detail URL via Firecrawl:', url);

      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['html'],
          onlyMainContent: false,
          waitFor: 2000,
        }),
      });

      const scrapeData = await response.json();

      if (!response.ok || !scrapeData.success) {
        console.error('Firecrawl detail scrape error:', scrapeData);
        return new Response(JSON.stringify({ success: false, error: 'Detail scrape failed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const html = scrapeData.data?.html || '';

      // Title from h1
      const h1Match = html.match(/<h1>([^<]+)<\/h1>/);
      const rawTitle = h1Match ? h1Match[1].trim() : '';
      const title = rawTitle
        .replace(/\s*4K Blu-ray$/i, '')
        .replace(/\s*3D Blu-ray$/i, '')
        .replace(/\s*Blu-ray$/i, '')
        .trim();

      // Publisher from subheading
      const studioMatch = html.match(/class="subheading grey">\s*<a[^>]*>([^<]+)<\/a>/);
      const publisher = studioMatch ? studioMatch[1].trim() : '';

      // Year
      const yearMatch = html.match(/movies\.php\?year=(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : null;

      // Video quality & HDR
      const videoSection = html.match(/<span class="subheading">Video<\/span><br>([\s\S]*?)<span class="subheading">Audio/);
      let videoQuality = '1080p';
      let hdrType = 'SDR';

      if (videoSection) {
        const vt = videoSection[1];
        if (vt.includes('2160p') || vt.includes('4K')) videoQuality = '4K';
        else if (vt.includes('1080p') || vt.includes('1080i')) videoQuality = '1080p';
        else if (vt.includes('720p')) videoQuality = '720p';

        if (vt.includes('Dolby Vision')) hdrType = 'Dolby Vision';
        else if (vt.includes('HDR10+')) hdrType = 'HDR10+';
        else if (vt.includes('HDR10')) hdrType = 'HDR10';
      }

      // Also check subtitle line for 4K
      const subtitleMatch = html.match(/<span class="subheadingtitle"[^>]*>([^<]+)<\/span>/);
      if (subtitleMatch && subtitleMatch[1].includes('4K')) videoQuality = '4K';

      // Audio
      const audioSection = html.match(/id="shortaudio">([\s\S]*?)<\/div>/);
      let audioType = '';
      if (audioSection) {
        const at = audioSection[1];
        if (at.includes('Dolby Atmos')) audioType = 'Dolby Atmos';
        else if (at.includes('DTS:X')) audioType = 'DTS:X';
        else if (at.includes('7.1')) audioType = '7.1';
        else if (at.includes('5.1')) audioType = '5.1';
        else if (at.includes('2.0') || at.includes('Stereo')) audioType = 'Stereo';
        else if (at.includes('Mono')) audioType = 'Mono';
      }

      // Packaging
      const packSection = html.match(/<span class="subheading">Packaging<\/span><br>([\s\S]*?)(?:<br><br>|<br>\s*<span)/);
      let packageType = 'Plastic Case';
      if (packSection) {
        const pt = packSection[1].toLowerCase();
        if (pt.includes('steelbook')) packageType = 'Steelbook';
        else if (pt.includes('slipcover')) packageType = 'Slipcover';
        else if (pt.includes('digipak') || pt.includes('digipack')) packageType = 'Digipak';
        else if (pt.includes('mediabook')) packageType = 'Mediabook';
        else if (pt.includes('box set') || pt.includes('collection')) packageType = 'Box Set';
      }

      // Region from flag
      const flagMatch = html.match(/<h1>[^<]+<\/h1><img[^>]*src="[^"]*flags\/(US|UK)\.png"/);
      const region = flagMatch ? flagMatch[1] : '';

      const result = {
        title, year, publisher,
        video_quality: videoQuality,
        hdr_type: hdrType,
        audio_type: audioType,
        package_type: packageType,
        region,
        media_type: 'Film',
        director: '',
      };

      return new Response(JSON.stringify({ success: true, data: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
