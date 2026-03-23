import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import type { Plugin } from 'vite'

/**
 * Dev-mode AI proxy plugin.
 * Mimics the Vercel Edge Function /api/ai-proxy for local development.
 * Forwards AI API calls through the Vite dev server to bypass CORS.
 */
function aiProxyPlugin(): Plugin {
  return {
    name: 'ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai-proxy', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          })
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }))
          return
        }

        // Read request body
        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(chunk as Buffer)
        }
        const bodyStr = Buffer.concat(chunks).toString('utf-8')

        try {
          const proxyReq = JSON.parse(bodyStr) as {
            targetUrl: string
            headers: Record<string, string>
            body: string
            stream: boolean
          }

          if (!proxyReq.targetUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'MISSING_TARGET_URL' }))
            return
          }

          // Forward to AI provider
          const upstreamRes = await fetch(proxyReq.targetUrl, {
            method: 'POST',
            headers: proxyReq.headers ?? {},
            body: proxyReq.body,
          })

          if (!upstreamRes.ok) {
            const errText = await upstreamRes.text().catch(() => 'UNKNOWN')
            res.writeHead(upstreamRes.status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: `UPSTREAM_${upstreamRes.status}`, details: errText.slice(0, 500) }))
            return
          }

          // Stream response through
          if (proxyReq.stream && upstreamRes.body) {
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'Access-Control-Allow-Origin': '*',
            })

            const reader = upstreamRes.body.getReader()
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                res.write(value)
              }
            } finally {
              reader.releaseLock()
            }
            res.end()
            return
          }

          // Non-streaming response
          const data = await upstreamRes.text()
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          })
          res.end(data)
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'PROXY_ERROR'
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: msg }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    aiProxyPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'icons/*.png', 'textures/*.jpg'],
      manifest: {
        name: 'SentinelPrime Intelligence Platform',
        short_name: 'SentinelPrime',
        description: 'See Everything. Know Everything. Miss Nothing.',
        theme_color: '#020802',
        background_color: '#020802',
        display: 'standalone',
        orientation: 'landscape-primary',
        start_url: '/',
        scope: '/',
        categories: ['security', 'utilities', 'productivity'],
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sp-google-fonts-style',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sp-google-fonts-files',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sp-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /^https:\/\/(haveibeenpwned|api\.hunter|crt\.sh|api\.shodan|urlscan|ipapi).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sp-osint-api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 15,
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
})
