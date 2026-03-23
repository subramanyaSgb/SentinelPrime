import type { ModuleSpec } from '@/types'

/**
 * MODULE_REGISTRY — Complete registry of all intelligence modules.
 * Phase 4 modules (4.1-4.10) are implemented first.
 * Remaining modules will be added in subsequent phases.
 */

export const MODULE_REGISTRY: ModuleSpec[] = [
  // ═══════════════════════════════════════════════
  // CATEGORY 2: PERSON & IDENTITY
  // ═══════════════════════════════════════════════
  {
    id: 'email-profiler',
    name: 'Email Profiler',
    category: 'Person & Identity',
    categoryId: 2,
    description: 'Aggregates breach history, account links and Gravatar data for any email address',
    inputs: [
      {
        name: 'email',
        type: 'email',
        label: 'EMAIL ADDRESS',
        required: true,
        placeholder: 'target@example.com',
      },
    ],
    dataSources: [
      { name: 'HaveIBeenPwned', type: 'free_api', endpoint: 'https://haveibeenpwned.com/api/v3' },
      { name: 'Hunter.io', type: 'free_api', apiKey: 'hunter_api_key' },
      { name: 'Gravatar', type: 'free_api', endpoint: 'https://www.gravatar.com' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt:
      'Analyze this email profile data and identify: 1) Risk indicators 2) Identity clues 3) Recommended next investigative steps',
    linkToTarget: true,
    rateLimit: '1 req/1.5s (HIBP)',
    requiresApiKey: false,
    tags: ['email', 'breach', 'identity', 'person', 'account', 'gravatar'],
  },
  {
    id: 'phone-intel',
    name: 'Phone Intel',
    category: 'Person & Identity',
    categoryId: 2,
    description: 'Analyzes phone numbers for carrier info, location, line type and validity',
    inputs: [
      {
        name: 'phone',
        type: 'phone',
        label: 'PHONE NUMBER',
        required: true,
        placeholder: '+1234567890',
      },
    ],
    dataSources: [
      { name: 'NumVerify', type: 'free_api', endpoint: 'http://apilayer.net/api/validate' },
      { name: 'PhoneInfoga', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt:
      'Analyze this phone number intelligence. Identify: carrier patterns, geographic indicators, line type significance, and recommended OSINT follow-up steps.',
    linkToTarget: true,
    rateLimit: '100 req/month (free tier)',
    requiresApiKey: false,
    tags: ['phone', 'telecom', 'carrier', 'location', 'person'],
  },
  {
    id: 'username-tracer',
    name: 'Username Tracer',
    category: 'Person & Identity',
    categoryId: 2,
    description: 'Checks username presence across 400+ platforms via WhatsMy.Name and generates Sherlock queries',
    inputs: [
      {
        name: 'username',
        type: 'text',
        label: 'USERNAME',
        required: true,
        placeholder: 'john_doe_123',
      },
    ],
    dataSources: [
      { name: 'WhatsMyName', type: 'free_api', endpoint: 'https://raw.githubusercontent.com/WebBreacher/WhatsMyName/main/wmn-data.json' },
      { name: 'Sherlock', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt:
      'Analyze username presence across platforms. Identify: usage patterns, potential identity connections, platform clusters, and recommended investigation targets.',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['username', 'social', 'identity', 'person', 'accounts'],
  },

  // ═══════════════════════════════════════════════
  // CATEGORY 5: DOMAIN & NETWORK
  // ═══════════════════════════════════════════════
  {
    id: 'domain-ip-intel',
    name: 'Domain & IP Intelligence',
    category: 'Domain & Network',
    categoryId: 5,
    description: 'Performs WHOIS, DNS, reverse IP, SSL and geolocation lookups for domains and IPs',
    inputs: [
      {
        name: 'target',
        type: 'text',
        label: 'DOMAIN OR IP ADDRESS',
        required: true,
        placeholder: 'example.com or 192.168.1.1',
      },
    ],
    dataSources: [
      { name: 'ip-api.com', type: 'free_api', endpoint: 'http://ip-api.com/json/' },
      { name: 'crt.sh', type: 'free_api', endpoint: 'https://crt.sh/' },
      { name: 'DNS lookup', type: 'free_api' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt:
      'Analyze this domain/IP intelligence data. Identify: hosting patterns, associated infrastructure, security posture, geographic indicators, and suspicious indicators.',
    linkToTarget: true,
    rateLimit: '45 req/min (ip-api)',
    requiresApiKey: false,
    tags: ['domain', 'ip', 'dns', 'whois', 'ssl', 'geolocation', 'network'],
  },
  {
    id: 'ip-to-map',
    name: 'IP to Map',
    category: 'Domain & Network',
    categoryId: 5,
    description: 'Geolocates IP addresses and plots them on an interactive map with ISP and threat data',
    inputs: [
      {
        name: 'ip',
        type: 'ip',
        label: 'IP ADDRESS',
        required: true,
        placeholder: '8.8.8.8',
      },
    ],
    dataSources: [
      { name: 'ip-api.com', type: 'free_api', endpoint: 'http://ip-api.com/json/' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'map',
    aiEnabled: true,
    aiPrompt:
      'Analyze this IP geolocation data. Identify: location significance, ISP patterns, potential VPN/proxy usage, and intelligence value.',
    linkToTarget: true,
    rateLimit: '45 req/min',
    requiresApiKey: false,
    tags: ['ip', 'map', 'geolocation', 'location', 'network'],
  },

  // ═══════════════════════════════════════════════
  // CATEGORY 6: SEARCH & DISCOVERY
  // ═══════════════════════════════════════════════
  {
    id: 'google-dork-builder',
    name: 'Google Dork Builder',
    category: 'Search & Discovery',
    categoryId: 6,
    description: 'AI-powered Google dork query generator for targeted search discovery',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH OBJECTIVE',
        required: true,
        placeholder: 'Find exposed documents related to Acme Corp',
      },
      {
        name: 'domain',
        type: 'text',
        label: 'TARGET DOMAIN (OPTIONAL)',
        required: false,
        placeholder: 'acmecorp.com',
      },
    ],
    dataSources: [
      { name: 'AI Dork Generation', type: 'ai_only' },
      { name: 'Google Search', type: 'link_out' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt:
      'Generate targeted Google dork queries for OSINT investigation. Include: file type searches, exposed directory queries, credential leak searches, configuration file searches, and explain what each dork targets.',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['google', 'dork', 'search', 'discovery', 'recon'],
  },
  {
    id: 'wayback-crawler',
    name: 'Wayback Machine Crawler',
    category: 'Search & Discovery',
    categoryId: 6,
    description: 'Searches Internet Archive for historical snapshots of any URL',
    inputs: [
      {
        name: 'url',
        type: 'url',
        label: 'TARGET URL',
        required: true,
        placeholder: 'https://example.com',
      },
    ],
    dataSources: [
      { name: 'Archive.org CDX API', type: 'free_api', endpoint: 'https://web.archive.org/cdx/search/cdx' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt:
      'Analyze these archived snapshots. Identify: notable content changes over time, removed content patterns, timeline of site evolution, and intelligence-relevant findings.',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['wayback', 'archive', 'history', 'web', 'cache'],
  },

  // ═══════════════════════════════════════════════
  // CATEGORY 10: SECURITY & THREATS
  // ═══════════════════════════════════════════════
  {
    id: 'breach-lookup',
    name: 'Breach Lookup',
    category: 'Security & Threats',
    categoryId: 10,
    description: 'Checks email addresses and domains against known data breaches via HIBP',
    inputs: [
      {
        name: 'email',
        type: 'email',
        label: 'EMAIL ADDRESS',
        required: true,
        placeholder: 'target@example.com',
      },
    ],
    dataSources: [
      { name: 'HaveIBeenPwned', type: 'free_api', endpoint: 'https://haveibeenpwned.com/api/v3' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt:
      'Analyze these breach results. Identify: most sensitive breaches, data types exposed, timeline of breaches, password reuse risk, and recommended actions.',
    linkToTarget: true,
    rateLimit: '1 req/1.5s',
    requiresApiKey: false,
    tags: ['breach', 'password', 'credential', 'security', 'hibp'],
  },
  {
    id: 'phishing-analyzer',
    name: 'Phishing Link Analyzer',
    category: 'Security & Threats',
    categoryId: 10,
    description: 'Analyzes suspicious URLs for phishing indicators, reputation, and threat data',
    inputs: [
      {
        name: 'url',
        type: 'url',
        label: 'SUSPICIOUS URL',
        required: true,
        placeholder: 'https://suspicious-site.example.com/login',
      },
    ],
    dataSources: [
      { name: 'URLhaus', type: 'free_api', endpoint: 'https://urlhaus-api.abuse.ch/v1/' },
      { name: 'Google Safe Browsing', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt:
      'Analyze this URL for phishing indicators. Check: domain age patterns, URL structure anomalies, SSL certificate issues, brand impersonation signals, and threat assessment.',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['phishing', 'url', 'malware', 'threat', 'security'],
  },
  {
    id: 'metadata-extractor',
    name: 'Metadata Extractor',
    category: 'Visual & Media Intelligence',
    categoryId: 3,
    description: 'Extracts EXIF, GPS, camera, and software metadata from uploaded images and documents',
    inputs: [
      {
        name: 'file',
        type: 'file',
        label: 'UPLOAD FILE',
        required: true,
        placeholder: 'Select image or document...',
      },
    ],
    dataSources: [
      { name: 'Browser EXIF Parser', type: 'ai_only' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt:
      'Analyze extracted metadata from this file. Identify: GPS coordinates and location significance, camera/device identification, software used, timestamps and timeline, and any privacy-sensitive data exposed.',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['metadata', 'exif', 'image', 'gps', 'document', 'forensic'],
  },
]

/**
 * Get module spec by ID
 */
export function getModuleById(id: string): ModuleSpec | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id)
}

/**
 * Get all modules in a category
 */
export function getModulesByCategory(categoryId: number): ModuleSpec[] {
  return MODULE_REGISTRY.filter((m) => m.categoryId === categoryId)
}

/**
 * Search modules by query string (fuzzy match on name, description, tags)
 */
export function searchModules(query: string): ModuleSpec[] {
  const q = query.toLowerCase()
  return MODULE_REGISTRY.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some((t) => t.includes(q)) ||
      m.category.toLowerCase().includes(q)
  )
}

/**
 * Get all unique categories
 */
export function getCategories(): { id: number; name: string; count: number }[] {
  const cats = new Map<number, { name: string; count: number }>()
  for (const m of MODULE_REGISTRY) {
    const existing = cats.get(m.categoryId)
    if (existing) {
      existing.count++
    } else {
      cats.set(m.categoryId, { name: m.category, count: 1 })
    }
  }
  return Array.from(cats.entries())
    .map(([id, data]) => ({ id, name: data.name, count: data.count }))
    .sort((a, b) => a.id - b.id)
}
