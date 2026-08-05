export async function onRequest(context: { request: Request; env: Record<string, any> }) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Optional: Add admin auth guard if desired.
  // We'll trust the token passed in for the proxy for now, 
  // but it's best to verify admin password since it's an admin-only feature.
  const adminPassword = env.ADMIN_PASSWORD || env.VITE_ADMIN_PASSWORD || 'c@n@rio2690';
  const providedPassword = request.headers.get('X-Admin-Password') || '';
  if (providedPassword !== adminPassword) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { accountId, token, model, payload } = body;

    if (!accountId || !token || !model) {
      return new Response(JSON.stringify({ error: 'Missing required CF parameters' }), { status: 400 });
    }

    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
    const cfRes = await fetch(cfUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const cfData = await cfRes.json();
    
    if (!cfRes.ok) {
      throw new Error(`Cloudflare AI API Error: ${JSON.stringify(cfData)}`);
    }

    return new Response(JSON.stringify(cfData), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error('CF Proxy Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
