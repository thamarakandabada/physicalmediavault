const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function detectRetailer(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('hmv.com')) return 'HMV';
  if (u.includes('zavvi.com')) return 'Zavvi';
  if (u.includes('amazon.co.uk') || u.includes('amazon.com')) return 'Amazon';
  if (u.includes('arrowfilms.com') || u.includes('arrowvideo.com')) return 'Arrow';
  if (u.includes('criterion.com') || u.includes('criterionstore')) return 'Criterion';
  if (u.includes('IndicatorSeries') || u.includes('powerhousefilms.co.uk')) return 'Indicator';
  if (u.includes('eurekavideo.co.uk')) return 'Eureka';
  if (u.includes('secondsightfilms.co.uk')) return 'Second Sight';
  if (u.includes('88films.tv')) return '88 Films';
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
  } catch {
    return 'Unknown';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const retailer = detectRetailer(url);

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping wishlist URL:', formattedUrl, 'retailer:', retailer);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'Failed to scrape', retailer }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract info from metadata and markdown
    const metadata = data.data?.metadata || data.metadata || {};
    const markdown = data.data?.markdown || data.markdown || '';

    // Title: use og:title or page title
    let title = metadata.ogTitle || metadata.title || '';
    // Clean common retailer suffixes
    title = title
      .replace(/\s*[-|–]\s*(HMV|Zavvi|Amazon\.co\.uk|Amazon\.com|Arrow|Criterion).*$/i, '')
      .replace(/\s*\[.*?\]\s*$/, '')
      .trim();

    // Price: find first price pattern in markdown
    let price: string | null = null;
    const priceMatch = markdown.match(/[£$€]\d+[\.,]?\d{0,2}/);
    if (priceMatch) {
      price = priceMatch[0];
    }

    // Image: og:image
    const imageUrl = metadata.ogImage || metadata.image || null;

    console.log('Extracted:', { title, price, retailer, imageUrl: imageUrl ? 'yes' : 'no' });

    return new Response(
      JSON.stringify({
        success: true,
        data: { title, price, retailer, image_url: imageUrl },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to scrape' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
