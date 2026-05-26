export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API routes
    if (path.startsWith('/api/')) {
      return handleAPI(request, env, url, corsHeaders);
    }

    // Redirect: lookup slug
    const slug = path.slice(1);
    if (slug) {
      const target = await env.URLS.get(slug);
      if (target) {
        // Increment click count
        const meta = await env.URLS.get(`meta:${slug}`, { type: 'json' });
        if (meta) {
          meta.clicks = (meta.clicks || 0) + 1;
          meta.lastClicked = new Date().toISOString();
          await env.URLS.put(`meta:${slug}`, JSON.stringify(meta));
        }
        return Response.redirect(target, 302);
      }
      return new Response('Not found', { status: 404 });
    }

    // Serve the admin UI for root path
    return new Response(ADMIN_HTML, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
};

async function handleAPI(request, env, url, corsHeaders) {
  const path = url.pathname;

  // Auth check for write operations
  if (request.method !== 'GET') {
    const auth = request.headers.get('Authorization');
    if (auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
      return json({ error: 'Unauthorized' }, 401, corsHeaders);
    }
  }

  // POST /api/shorten - create short URL
  if (path === '/api/shorten' && request.method === 'POST') {
    const body = await request.json();
    const { url: targetUrl, slug: customSlug } = body;

    if (!targetUrl) {
      return json({ error: 'url is required' }, 400, corsHeaders);
    }

    // Validate URL
    try {
      new URL(targetUrl);
    } catch {
      return json({ error: 'Invalid URL' }, 400, corsHeaders);
    }

    const slug = customSlug || generateSlug();

    // Check if slug exists
    const existing = await env.URLS.get(slug);
    if (existing) {
      return json({ error: 'Slug already taken' }, 409, corsHeaders);
    }

    await env.URLS.put(slug, targetUrl);
    await env.URLS.put(`meta:${slug}`, JSON.stringify({
      url: targetUrl,
      slug,
      created: new Date().toISOString(),
      clicks: 0,
      lastClicked: null,
    }));

    return json({ slug, url: targetUrl, shortUrl: `https://go.luqmannor.com/${slug}` }, 201, corsHeaders);
  }

  // GET /api/links - list all links
  if (path === '/api/links' && request.method === 'GET') {
    const auth = request.headers.get('Authorization');
    if (auth !== `Bearer ${env.ADMIN_PASSWORD}`) {
      return json({ error: 'Unauthorized' }, 401, corsHeaders);
    }

    const list = await env.URLS.list({ prefix: 'meta:' });
    const links = [];
    for (const key of list.keys) {
      const meta = await env.URLS.get(key.name, { type: 'json' });
      if (meta) links.push(meta);
    }
    links.sort((a, b) => new Date(b.created) - new Date(a.created));
    return json({ links }, 200, corsHeaders);
  }

  // DELETE /api/links/:slug
  if (path.startsWith('/api/links/') && request.method === 'DELETE') {
    const slug = path.replace('/api/links/', '');
    await env.URLS.delete(slug);
    await env.URLS.delete(`meta:${slug}`);
    return json({ deleted: slug }, 200, corsHeaders);
  }

  return json({ error: 'Not found' }, 404, corsHeaders);
}

function generateSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

function json(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
