import { createClient } from "npm:@supabase/supabase-js@2";

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
  if (u.includes('indicatorseries') || u.includes('powerhousefilms.co.uk')) return 'Indicator';
  if (u.includes('eurekavideo.co.uk')) return 'Eureka';
  if (u.includes('secondsightfilms.co.uk')) return 'Second Sight';
  if (u.includes('88films.tv')) return '88 Films';
  if (u.includes('shop.bfi.org.uk') || u.includes('bfi.org.uk/shop')) return 'BFI';
  if (u.includes('terracottadistribution.com')) return 'Terracotta';
  if (u.includes('mundaymondaystudios.com') || u.includes('mundaymonday')) return 'Munday Monday';
  if (u.includes('vinegarsyndrome.com')) return 'Vinegar Syndrome';
  if (u.includes('imprint-films.com.au') || u.includes('imprintfilms')) return 'Imprint';
  if (u.includes('kinolorber.com')) return 'Kino Lorber';
  if (u.includes('shoutfactory.com')) return 'Shout Factory';
  if (u.includes('bluray.com')) return 'Blu-ray.com';
  try {
    const hostname = new URL(url).hostname.replace('www.', '').replace('shop.', '');
    return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
  } catch {
    return 'Unknown';
  }
}

function extractPrice(markdown: string, title: string): string | null {
  // Strategy: find the product price, not promotional banner prices.
  // Look for the price that appears right after the product title/heading.
  
  // 1. Try to find price after the title heading (# Title\n\nPrice pattern)
  if (title) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const afterTitlePattern = new RegExp(escapedTitle + '[\\s\\S]{0,200}?([£$€]\\d+[.,]\\d{2})', 'i');
    const afterTitleMatch = markdown.match(afterTitlePattern);
    if (afterTitleMatch) return afterTitleMatch[1];
  }

  // 2. Look for a price that follows a markdown heading (# ... \n\n £XX.XX)
  const headingPriceMatch = markdown.match(/^#{1,3}\s+.+\n\n\s*([£$€]\d+[.,]\d{2})/m);
  if (headingPriceMatch) return headingPriceMatch[1];

  // 3. Look for prices with decimal places (more likely to be real product prices)
  const decimalPriceMatch = markdown.match(/([£$€]\d+[.,]\d{2})/);
  if (decimalPriceMatch) return decimalPriceMatch[1];

  // 4. Fallback: any price pattern
  const anyPriceMatch = markdown.match(/([£$€]\d+(?:[.,]\d{2})?)/);
  if (anyPriceMatch) return anyPriceMatch[1];

  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
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
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url } = await req.json();
    if (!url || typeof url !== 'string' || url.trim().length > 2048) {
      return new Response(
        JSON.stringify({ success: false, error: 'A valid URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL is from a supported retailer domain
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const ALLOWED_DOMAINS = [
      'hmv.com', 'zavvi.com', 'amazon.co.uk', 'amazon.com',
      'arrowfilms.com', 'arrowvideo.com', 'criterion.com', 'criterionstore.com',
      'indicatorseries.com', 'powerhousefilms.co.uk', 'eurekavideo.co.uk',
      'secondsightfilms.co.uk', '88films.tv', 'bfi.org.uk',
      'terracottadistribution.com', 'mundaymondaystudios.com',
      'vinegarsyndrome.com', 'imprint-films.com.au', 'imprintfilms.com.au',
      'kinolorber.com', 'shoutfactory.com', 'blu-ray.com',
    ];

    try {
      const parsedUrl = new URL(formattedUrl);
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        throw new Error('Invalid protocol');
      }
      const hostname = parsedUrl.hostname.replace(/^(www|shop)\./i, '');
      if (!ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
        return new Response(
          JSON.stringify({ success: false, error: 'URL must be from a supported retailer' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Scraping service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const retailer = detectRetailer(url);

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

    const metadata = data.data?.metadata || data.metadata || {};
    const markdown = data.data?.markdown || data.markdown || '';

    // Title: use og:title or page title
    let title = metadata.ogTitle || metadata.title || '';
    title = title
      .replace(/\s*[-|–]\s*(HMV|Zavvi|Amazon\.co\.uk|Amazon\.com|Arrow|Criterion).*$/i, '')
      .replace(/\s*\[.*?\]\s*$/, '')
      .trim();

    // Price: smart extraction
    const price = extractPrice(markdown, title);

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
    console.error('Error processing wishlist URL:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
