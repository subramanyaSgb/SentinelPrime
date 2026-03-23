/**
 * Vercel Edge Function — AI Provider Proxy.
 *
 * Routes AI API calls through the server to avoid CORS restrictions.
 * Supports streaming (SSE) for all providers.
 *
 * Usage: POST /api/ai-proxy
 * Body: { targetUrl, headers, body, stream }
 */

export const config = {
  runtime: 'edge',
}

interface ProxyRequest {
  targetUrl: string
  headers: Record<string, string>
  body: string
  stream: boolean
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }), {
      status: 405,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }

  try {
    const proxyReq = (await request.json()) as ProxyRequest

    if (!proxyReq.targetUrl) {
      return new Response(JSON.stringify({ error: 'MISSING_TARGET_URL' }), {
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      })
    }

    // Validate target URL — only allow known AI provider domains
    const allowedDomains = [
      'integrate.api.nvidia.com',
      'api.groq.com',
      'generativelanguage.googleapis.com',
      'openrouter.ai',
      'localhost',
      '127.0.0.1',
    ]

    const targetHost = new URL(proxyReq.targetUrl).hostname
    const isAllowed = allowedDomains.some(
      (d) => targetHost === d || targetHost.endsWith(`.${d}`)
    )

    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: `DOMAIN_NOT_ALLOWED: ${targetHost}` }),
        {
          status: 403,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        }
      )
    }

    // Forward request to AI provider
    const upstreamResponse = await fetch(proxyReq.targetUrl, {
      method: 'POST',
      headers: proxyReq.headers ?? {},
      body: proxyReq.body,
    })

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text().catch(() => 'UNKNOWN')
      return new Response(
        JSON.stringify({
          error: `UPSTREAM_${String(upstreamResponse.status)}`,
          details: errorText.slice(0, 500),
        }),
        {
          status: upstreamResponse.status,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        }
      )
    }

    // Streaming response — pipe through
    if (proxyReq.stream && upstreamResponse.body) {
      return new Response(upstreamResponse.body, {
        status: 200,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Non-streaming response
    const data = await upstreamResponse.text()
    return new Response(data, {
      status: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PROXY_ERROR'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    })
  }
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
