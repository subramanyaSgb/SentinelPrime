import type { ModuleSpec } from '@/types'

/**
 * MODULE_REGISTRY — Complete registry of all intelligence modules.
 * 147 categories, 300+ module specs.
 * Each module follows the ModuleSpec interface.
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
    aiPrompt: 'Analyze this email profile data and identify: 1) Risk indicators 2) Identity clues 3) Recommended next investigative steps',
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
      { name: 'phone', type: 'phone', label: 'PHONE NUMBER', required: true, placeholder: '+1234567890' },
    ],
    dataSources: [
      { name: 'NumVerify', type: 'free_api', endpoint: 'http://apilayer.net/api/validate' },
      { name: 'PhoneInfoga', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze this phone number intelligence. Identify: carrier patterns, geographic indicators, line type significance, and recommended OSINT follow-up steps.',
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
      { name: 'username', type: 'text', label: 'USERNAME', required: true, placeholder: 'john_doe_123' },
    ],
    dataSources: [
      { name: 'WhatsMyName', type: 'free_api', endpoint: 'https://raw.githubusercontent.com/WebBreacher/WhatsMyName/main/wmn-data.json' },
      { name: 'Sherlock', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze username presence across platforms. Identify: usage patterns, potential identity connections, platform clusters, and recommended investigation targets.',
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
      { name: 'target', type: 'text', label: 'DOMAIN OR IP ADDRESS', required: true, placeholder: 'example.com or 192.168.1.1' },
    ],
    dataSources: [
      { name: 'ip-api.com', type: 'free_api', endpoint: 'http://ip-api.com/json/' },
      { name: 'crt.sh', type: 'free_api', endpoint: 'https://crt.sh/' },
      { name: 'DNS lookup', type: 'free_api' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze this domain/IP intelligence data. Identify: hosting patterns, associated infrastructure, security posture, geographic indicators, and suspicious indicators.',
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
      { name: 'ip', type: 'ip', label: 'IP ADDRESS', required: true, placeholder: '8.8.8.8' },
    ],
    dataSources: [
      { name: 'ip-api.com', type: 'free_api', endpoint: 'http://ip-api.com/json/' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'map',
    aiEnabled: true,
    aiPrompt: 'Analyze this IP geolocation data. Identify: location significance, ISP patterns, potential VPN/proxy usage, and intelligence value.',
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
      { name: 'query', type: 'text', label: 'SEARCH OBJECTIVE', required: true, placeholder: 'Find exposed documents related to Acme Corp' },
      { name: 'domain', type: 'text', label: 'TARGET DOMAIN (OPTIONAL)', required: false, placeholder: 'acmecorp.com' },
    ],
    dataSources: [
      { name: 'AI Dork Generation', type: 'ai_only' },
      { name: 'Google Search', type: 'link_out' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Generate targeted Google dork queries for OSINT investigation. Include: file type searches, exposed directory queries, credential leak searches, configuration file searches, and explain what each dork targets.',
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
      { name: 'url', type: 'url', label: 'TARGET URL', required: true, placeholder: 'https://example.com' },
    ],
    dataSources: [
      { name: 'Archive.org CDX API', type: 'free_api', endpoint: 'https://web.archive.org/cdx/search/cdx' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze these archived snapshots. Identify: notable content changes over time, removed content patterns, timeline of site evolution, and intelligence-relevant findings.',
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
      { name: 'email', type: 'email', label: 'EMAIL ADDRESS', required: true, placeholder: 'target@example.com' },
    ],
    dataSources: [
      { name: 'HaveIBeenPwned', type: 'free_api', endpoint: 'https://haveibeenpwned.com/api/v3' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze these breach results. Identify: most sensitive breaches, data types exposed, timeline of breaches, password reuse risk, and recommended actions.',
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
      { name: 'url', type: 'url', label: 'SUSPICIOUS URL', required: true, placeholder: 'https://suspicious-site.example.com/login' },
    ],
    dataSources: [
      { name: 'URLhaus', type: 'free_api', endpoint: 'https://urlhaus-api.abuse.ch/v1/' },
      { name: 'Google Safe Browsing', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze this URL for phishing indicators. Check: domain age patterns, URL structure anomalies, SSL certificate issues, brand impersonation signals, and threat assessment.',
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
      { name: 'file', type: 'file', label: 'UPLOAD FILE', required: true, placeholder: 'Select image or document...' },
    ],
    dataSources: [
      { name: 'Browser EXIF Parser', type: 'ai_only' },
      { name: 'AI Analysis', type: 'ai_only' },
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze extracted metadata from this file. Identify: GPS coordinates and location significance, camera/device identification, software used, timestamps and timeline, and any privacy-sensitive data exposed.',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['metadata', 'exif', 'image', 'gps', 'document', 'forensic'],
  },

  // ═══════════════════════════════════════════════
  // CATEGORY 2: PERSON & IDENTITY
  // ═══════════════════════════════════════════════
  {
    id: 'person-lookup',
    name: 'Person Lookup',
    category: 'Person & Identity',
    categoryId: 2,
    description: 'Aggregates public records, social profiles, and identity data for a person name',
    inputs: [
      {
        name: 'name',
        type: 'text',
        label: 'FULL NAME',
        required: true,
        placeholder: 'John Doe',
      }
    ],
    dataSources: [
      { name: 'Google Search', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['person', 'name', 'identity', 'search'],
  },
  {
    id: 'fake-profile-detector',
    name: 'Fake Profile Detector',
    category: 'Person & Identity',
    categoryId: 2,
    description: 'Analyzes social media profiles for signs of fabrication or bot activity',
    inputs: [
      {
        name: 'profileUrl',
        type: 'url',
        label: 'PROFILE URL',
        required: true,
        placeholder: 'https://twitter.com/username',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Social Blade', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['fake', 'bot', 'social', 'profile', 'detection'],
  },
  {
    id: 'writing-style-analyzer',
    name: 'Writing Style Analyzer',
    category: 'Person & Identity',
    categoryId: 2,
    description: 'AI-powered analysis of writing patterns to identify authorship and stylistic fingerprints',
    inputs: [
      {
        name: 'text',
        type: 'textarea',
        label: 'TEXT SAMPLE',
        required: true,
        placeholder: 'Paste text sample for analysis...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'text',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['writing', 'authorship', 'style', 'nlp', 'forensic'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 3: VISUAL & MEDIA INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'reverse-image-search',
    name: 'Reverse Image Search',
    category: 'Visual & Media Intelligence',
    categoryId: 3,
    description: 'Generates reverse image search links across Google, Yandex, TinEye and Bing',
    inputs: [
      {
        name: 'imageUrl',
        type: 'url',
        label: 'IMAGE URL',
        required: true,
        placeholder: 'https://example.com/photo.jpg',
      }
    ],
    dataSources: [
      { name: 'Google Images', type: 'link_out' },
      { name: 'Yandex Images', type: 'link_out' },
      { name: 'TinEye', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['image', 'reverse', 'search', 'visual'],
  },
  {
    id: 'geosint-location-from-image',
    name: 'Location from Image (GeoSINT)',
    category: 'Visual & Media Intelligence',
    categoryId: 3,
    description: 'AI analyzes visual cues in images to determine probable geographic location',
    inputs: [
      {
        name: 'file',
        type: 'file',
        label: 'UPLOAD IMAGE',
        required: true,
        placeholder: 'Select image...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['geolocation', 'image', 'geosint', 'visual'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 4: AI & BIOMETRIC ANALYSIS
  // ═══════════════════════════════════════════════
  {
    id: 'voice-fingerprinter',
    name: 'Voice Fingerprinter',
    category: 'AI & Biometric Analysis',
    categoryId: 4,
    description: 'AI analysis of voice recordings to extract speaker characteristics and identity markers',
    inputs: [
      {
        name: 'file',
        type: 'file',
        label: 'UPLOAD AUDIO',
        required: true,
        placeholder: 'Select audio file...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['voice', 'audio', 'biometric', 'identity'],
  },
  {
    id: 'emotion-stress-analyzer',
    name: 'Emotion & Stress Analyzer',
    category: 'AI & Biometric Analysis',
    categoryId: 4,
    description: 'Detects emotional state and stress indicators from text, audio, or behavioral patterns',
    inputs: [
      {
        name: 'text',
        type: 'textarea',
        label: 'TEXT OR TRANSCRIPT',
        required: true,
        placeholder: 'Paste text for emotional analysis...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['emotion', 'stress', 'behavioral', 'psychology'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 5: DOMAIN & NETWORK
  // ═══════════════════════════════════════════════
  {
    id: 'subdomain-enumerator',
    name: 'Subdomain Enumerator',
    category: 'Domain & Network',
    categoryId: 5,
    description: 'Discovers subdomains using certificate transparency logs and DNS brute-force',
    inputs: [
      {
        name: 'domain',
        type: 'text',
        label: 'ROOT DOMAIN',
        required: true,
        placeholder: 'example.com',
      }
    ],
    dataSources: [
      { name: 'crt.sh', type: 'free_api', endpoint: 'https://crt.sh/' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'table',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['subdomain', 'dns', 'domain', 'recon'],
  },
  {
    id: 'tech-fingerprinter',
    name: 'Technology Fingerprinter',
    category: 'Domain & Network',
    categoryId: 5,
    description: 'Identifies web technologies, CMS, frameworks and server software from HTTP headers and page analysis',
    inputs: [
      {
        name: 'url',
        type: 'url',
        label: 'TARGET URL',
        required: true,
        placeholder: 'https://example.com',
      }
    ],
    dataSources: [
      { name: 'Wappalyzer', type: 'link_out' },
      { name: 'BuiltWith', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['technology', 'fingerprint', 'web', 'recon'],
  },
  {
    id: 'vpn-proxy-detector',
    name: 'VPN/Proxy Detector',
    category: 'Domain & Network',
    categoryId: 5,
    description: 'Checks if an IP address is a known VPN endpoint, proxy, or Tor exit node',
    inputs: [
      {
        name: 'ip',
        type: 'ip',
        label: 'IP ADDRESS',
        required: true,
        placeholder: '1.2.3.4',
      }
    ],
    dataSources: [
      { name: 'ip-api.com', type: 'free_api', endpoint: 'http://ip-api.com/json/' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['vpn', 'proxy', 'tor', 'anonymity', 'ip'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 6: SEARCH & DISCOVERY
  // ═══════════════════════════════════════════════
  {
    id: 'paste-monitor',
    name: 'Paste Monitor',
    category: 'Search & Discovery',
    categoryId: 6,
    description: 'Searches paste sites for mentions of target keywords, emails, or domains',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH TERM',
        required: true,
        placeholder: 'email@example.com or domain.com',
      }
    ],
    dataSources: [
      { name: 'IntelX', type: 'link_out' },
      { name: 'Pastebin Search', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['paste', 'leak', 'search', 'monitor'],
  },
  {
    id: 'news-mention-tracker',
    name: 'News & Mention Tracker',
    category: 'Search & Discovery',
    categoryId: 6,
    description: 'Tracks news articles and media mentions across GDELT and Google News',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Person name or organization',
      }
    ],
    dataSources: [
      { name: 'GDELT', type: 'free_api', endpoint: 'https://api.gdeltproject.org/api/v2' },
      { name: 'Google News', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['news', 'media', 'mentions', 'gdelt'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 7: SOCIAL & COMMUNITY
  // ═══════════════════════════════════════════════
  {
    id: 'social-osint',
    name: 'Social OSINT',
    category: 'Social & Community',
    categoryId: 7,
    description: 'Cross-platform social media intelligence aggregation and link generation',
    inputs: [
      {
        name: 'username',
        type: 'text',
        label: 'USERNAME',
        required: true,
        placeholder: 'johndoe123',
      }
    ],
    dataSources: [
      { name: 'Multiple Platforms', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['social', 'media', 'osint', 'accounts'],
  },
  {
    id: 'reddit-analyzer',
    name: 'Reddit Analyzer',
    category: 'Social & Community',
    categoryId: 7,
    description: 'Analyzes Reddit user activity patterns, subreddit engagement, and content history',
    inputs: [
      {
        name: 'username',
        type: 'text',
        label: 'REDDIT USERNAME',
        required: true,
        placeholder: 'reddit_user',
      }
    ],
    dataSources: [
      { name: 'Reddit API', type: 'free_api', endpoint: 'https://www.reddit.com/user/' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['reddit', 'social', 'analysis', 'community'],
  },
  {
    id: 'telegram-osint',
    name: 'Telegram OSINT',
    category: 'Social & Community',
    categoryId: 7,
    description: 'Generates intelligence links for Telegram users, groups, and channels',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'USERNAME OR GROUP',
        required: true,
        placeholder: '@username or group name',
      }
    ],
    dataSources: [
      { name: 'Telegram Search', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['telegram', 'messaging', 'social', 'osint'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 8: COMMUNICATIONS & TELECOM
  // ═══════════════════════════════════════════════
  {
    id: 'email-header-analyzer',
    name: 'Email Header Analyzer',
    category: 'Communications & Telecom',
    categoryId: 8,
    description: 'Parses email headers to trace origin servers, routing path, and authentication results',
    inputs: [
      {
        name: 'headers',
        type: 'textarea',
        label: 'EMAIL HEADERS',
        required: true,
        placeholder: 'Paste full email headers here...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['email', 'header', 'spf', 'dkim', 'trace'],
  },
  {
    id: 'imei-lookup',
    name: 'IMEI Lookup',
    category: 'Communications & Telecom',
    categoryId: 8,
    description: 'Checks device information from IMEI number including manufacturer and model',
    inputs: [
      {
        name: 'imei',
        type: 'text',
        label: 'IMEI NUMBER',
        required: true,
        placeholder: '353456789012345',
      }
    ],
    dataSources: [
      { name: 'IMEI.info', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['imei', 'device', 'mobile', 'telecom'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 9: CODE & TECHNICAL
  // ═══════════════════════════════════════════════
  {
    id: 'github-osint',
    name: 'GitHub OSINT',
    category: 'Code & Technical',
    categoryId: 9,
    description: 'Analyzes GitHub profiles for commit patterns, email addresses, collaborators, and exposed secrets',
    inputs: [
      {
        name: 'username',
        type: 'text',
        label: 'GITHUB USERNAME',
        required: true,
        placeholder: 'octocat',
      }
    ],
    dataSources: [
      { name: 'GitHub API', type: 'free_api', endpoint: 'https://api.github.com' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    rateLimit: '60 req/hr',
    requiresApiKey: false,
    tags: ['github', 'code', 'developer', 'git'],
  },
  {
    id: 'pdf-doc-deep-scan',
    name: 'PDF/Doc Deep Scan',
    category: 'Code & Technical',
    categoryId: 9,
    description: 'Extracts hidden metadata, embedded objects, macros and potential threats from documents',
    inputs: [
      {
        name: 'file',
        type: 'file',
        label: 'UPLOAD DOCUMENT',
        required: true,
        placeholder: 'Select PDF or DOC...',
      }
    ],
    dataSources: [
      { name: 'Browser Parser', type: 'ai_only' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pdf', 'document', 'forensic', 'metadata'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 10: SECURITY & THREATS
  // ═══════════════════════════════════════════════
  {
    id: 'dark-web-tracker',
    name: 'Dark Web Tracker',
    category: 'Security & Threats',
    categoryId: 10,
    description: 'Generates search links for dark web monitoring services and .onion indexers',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH TERM',
        required: true,
        placeholder: 'email, domain, or keyword',
      }
    ],
    dataSources: [
      { name: 'IntelX', type: 'link_out' },
      { name: 'Ahmia', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['darkweb', 'tor', 'onion', 'threat'],
  },
  {
    id: 'malware-hash-lookup',
    name: 'Malware Hash Lookup',
    category: 'Security & Threats',
    categoryId: 10,
    description: 'Checks file hashes against VirusTotal, MalwareBazaar, and threat intelligence feeds',
    inputs: [
      {
        name: 'hash',
        type: 'text',
        label: 'FILE HASH (MD5/SHA1/SHA256)',
        required: true,
        placeholder: 'd41d8cd98f00b204e9800998ecf8427e',
      }
    ],
    dataSources: [
      { name: 'MalwareBazaar', type: 'free_api', endpoint: 'https://mb-api.abuse.ch/api/v1/' },
      { name: 'VirusTotal', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['malware', 'hash', 'virus', 'threat'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 11: FINANCIAL CRIMES & FRAUD
  // ═══════════════════════════════════════════════
  {
    id: 'crypto-wallet-tracker',
    name: 'Crypto Wallet Tracker',
    category: 'Financial Crimes & Fraud',
    categoryId: 11,
    description: 'Analyzes cryptocurrency wallet addresses for transaction history and risk indicators',
    inputs: [
      {
        name: 'address',
        type: 'text',
        label: 'WALLET ADDRESS',
        required: true,
        placeholder: '0x742d35Cc6634C0532925...',
      }
    ],
    dataSources: [
      { name: 'Blockchain.com', type: 'link_out' },
      { name: 'Etherscan', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['crypto', 'bitcoin', 'ethereum', 'wallet', 'blockchain'],
  },
  {
    id: 'company-registry-lookup',
    name: 'Company Registry Lookup',
    category: 'Financial Crimes & Fraud',
    categoryId: 11,
    description: 'Searches company registries for business filings, directors, and corporate structure',
    inputs: [
      {
        name: 'company',
        type: 'text',
        label: 'COMPANY NAME',
        required: true,
        placeholder: 'Acme Corporation',
      }
    ],
    dataSources: [
      { name: 'OpenCorporates', type: 'link_out' },
      { name: 'SEC EDGAR', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['company', 'corporate', 'registry', 'business'],
  },
  {
    id: 'sanctions-list-checker',
    name: 'Sanctions List Checker',
    category: 'Financial Crimes & Fraud',
    categoryId: 11,
    description: 'Checks names and entities against OFAC, UN, EU and other sanctions lists',
    inputs: [
      {
        name: 'name',
        type: 'text',
        label: 'NAME OR ENTITY',
        required: true,
        placeholder: 'Person or organization name',
      }
    ],
    dataSources: [
      { name: 'OFAC SDN', type: 'link_out' },
      { name: 'UN Sanctions', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['sanctions', 'ofac', 'compliance', 'watchlist'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 12: DARK WEB & CYBERCRIME
  // ═══════════════════════════════════════════════
  {
    id: 'dark-web-market-monitor',
    name: 'Dark Web Market Monitor',
    category: 'Dark Web & Cybercrime',
    categoryId: 12,
    description: 'Generates intelligence links for dark web marketplace monitoring and analysis',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH KEYWORD',
        required: true,
        placeholder: 'Product, vendor, or category',
      }
    ],
    dataSources: [
      { name: 'IntelX', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['darkweb', 'market', 'cybercrime'],
  },
  {
    id: 'cybercrime-forum-scanner',
    name: 'Cybercrime Forum Scanner',
    category: 'Dark Web & Cybercrime',
    categoryId: 12,
    description: 'Searches cybercrime forums for mentions of targets, leaked data, or threat actors',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH TERM',
        required: true,
        placeholder: 'email, username, or domain',
      }
    ],
    dataSources: [
      { name: 'IntelX', type: 'link_out' },
      { name: 'BreachForums Search', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['forum', 'cybercrime', 'underground', 'threat'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 13: PHYSICAL SURVEILLANCE & TRACKING
  // ═══════════════════════════════════════════════
  {
    id: 'aircraft-tracker',
    name: 'Aircraft Tracker',
    category: 'Physical Surveillance & Tracking',
    categoryId: 13,
    description: 'Tracks aircraft via ADS-B Exchange for real-time position, route history, and registration data',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'REGISTRATION / ICAO / CALLSIGN',
        required: true,
        placeholder: 'N12345 or ABC123',
      }
    ],
    dataSources: [
      { name: 'ADS-B Exchange', type: 'free_api', endpoint: 'https://opensky-network.org/api' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'map',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['aircraft', 'flight', 'adsb', 'tracking'],
  },
  {
    id: 'vessel-tracker',
    name: 'Vessel Tracker',
    category: 'Physical Surveillance & Tracking',
    categoryId: 13,
    description: 'Tracks ships and vessels via AIS data including position, route, and port calls',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'VESSEL NAME / MMSI / IMO',
        required: true,
        placeholder: 'Ever Given or 123456789',
      }
    ],
    dataSources: [
      { name: 'MarineTraffic', type: 'link_out' },
      { name: 'VesselFinder', type: 'link_out' }
    ],
    outputType: 'map',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['vessel', 'ship', 'ais', 'maritime'],
  },
  {
    id: 'cell-tower-mapper',
    name: 'Cell Tower Mapper',
    category: 'Physical Surveillance & Tracking',
    categoryId: 13,
    description: 'Maps cellular tower locations and coverage areas for geolocation analysis',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'LOCATION OR MCC/MNC/LAC/CID',
        required: true,
        placeholder: 'City name or 310/410/1234/5678',
      }
    ],
    dataSources: [
      { name: 'OpenCelliD', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'map',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['cell', 'tower', 'mobile', 'geolocation'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 14: SATELLITE & GEOSPATIAL INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'satellite-image-lookup',
    name: 'Satellite Image Lookup',
    category: 'Satellite & Geospatial Intelligence',
    categoryId: 14,
    description: 'Generates links to satellite imagery providers for any coordinates or location',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'LOCATION OR COORDINATES',
        required: true,
        placeholder: '40.7128, -74.0060 or New York',
      }
    ],
    dataSources: [
      { name: 'Google Earth', type: 'link_out' },
      { name: 'Sentinel Hub', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'map',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['satellite', 'imagery', 'geospatial'],
  },
  {
    id: 'coordinates-extractor',
    name: 'Coordinates Extractor',
    category: 'Satellite & Geospatial Intelligence',
    categoryId: 14,
    description: 'Extracts and converts geographic coordinates from text, addresses, or place names',
    inputs: [
      {
        name: 'input',
        type: 'text',
        label: 'ADDRESS OR PLACE NAME',
        required: true,
        placeholder: '1600 Pennsylvania Ave, Washington DC',
      }
    ],
    dataSources: [
      { name: 'Nominatim', type: 'free_api', endpoint: 'https://nominatim.openstreetmap.org' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'map',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    rateLimit: '1 req/s',
    requiresApiKey: false,
    tags: ['coordinates', 'geocoding', 'location'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 15: GOVERNMENT & LEGAL RECORDS
  // ═══════════════════════════════════════════════
  {
    id: 'court-records-search',
    name: 'Court Records Search',
    category: 'Government & Legal Records',
    categoryId: 15,
    description: 'Generates search links for federal and state court records databases',
    inputs: [
      {
        name: 'name',
        type: 'text',
        label: 'PARTY NAME',
        required: true,
        placeholder: 'John Doe or Company Inc',
      }
    ],
    dataSources: [
      { name: 'PACER', type: 'link_out' },
      { name: 'CourtListener', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['court', 'legal', 'records', 'litigation'],
  },
  {
    id: 'property-records-lookup',
    name: 'Property Records Lookup',
    category: 'Government & Legal Records',
    categoryId: 15,
    description: 'Searches property ownership records, tax assessments, and deed transfers',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'ADDRESS OR OWNER NAME',
        required: true,
        placeholder: '123 Main St or property owner',
      }
    ],
    dataSources: [
      { name: 'County Records', type: 'link_out' },
      { name: 'Zillow', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['property', 'real estate', 'ownership', 'tax'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 16: IOT & SMART DEVICES
  // ═══════════════════════════════════════════════
  {
    id: 'smart-home-exposure',
    name: 'Smart Home Exposure Checker',
    category: 'IoT & Smart Devices',
    categoryId: 16,
    description: 'Scans for exposed smart home devices, cameras, and IoT endpoints via Shodan',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'IP RANGE OR QUERY',
        required: true,
        placeholder: '192.168.1.0/24 or webcam',
      }
    ],
    dataSources: [
      { name: 'Shodan', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['iot', 'smart home', 'camera', 'exposure'],
  },
  {
    id: 'default-credential-checker',
    name: 'Default Credential Checker',
    category: 'IoT & Smart Devices',
    categoryId: 16,
    description: 'Looks up known default credentials for device makes and models',
    inputs: [
      {
        name: 'device',
        type: 'text',
        label: 'DEVICE MAKE/MODEL',
        required: true,
        placeholder: 'Hikvision DS-2CD2142FWD',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Default Passwords DB', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['credentials', 'default', 'iot', 'security'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 17: SUPPLY CHAIN & SHIPPING
  // ═══════════════════════════════════════════════
  {
    id: 'container-tracker',
    name: 'Container Tracker',
    category: 'Supply Chain & Shipping',
    categoryId: 17,
    description: 'Tracks shipping containers via container number across major shipping lines',
    inputs: [
      {
        name: 'containerNum',
        type: 'text',
        label: 'CONTAINER NUMBER',
        required: true,
        placeholder: 'MSCU1234567',
      }
    ],
    dataSources: [
      { name: 'Shipping Line APIs', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['container', 'shipping', 'logistics', 'supply chain'],
  },
  {
    id: 'port-activity-monitor',
    name: 'Port Activity Monitor',
    category: 'Supply Chain & Shipping',
    categoryId: 17,
    description: 'Monitors port activities, vessel arrivals, and departures at global ports',
    inputs: [
      {
        name: 'port',
        type: 'text',
        label: 'PORT NAME OR CODE',
        required: true,
        placeholder: 'Los Angeles or USLAX',
      }
    ],
    dataSources: [
      { name: 'MarineTraffic', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['port', 'shipping', 'maritime', 'logistics'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 18: OPSEC & INVESTIGATOR SAFETY
  // ═══════════════════════════════════════════════
  {
    id: 'opsec-advisor',
    name: 'Operational Security Advisor',
    category: 'OpSec & Investigator Safety',
    categoryId: 18,
    description: 'AI-powered operational security assessment and recommendations for investigators',
    inputs: [
      {
        name: 'scenario',
        type: 'textarea',
        label: 'DESCRIBE YOUR INVESTIGATION SCENARIO',
        required: true,
        placeholder: 'What are you investigating and what precautions do you need?',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'text',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['opsec', 'safety', 'security', 'investigator'],
  },
  {
    id: 'anonymous-query-router',
    name: 'Anonymous Query Router',
    category: 'OpSec & Investigator Safety',
    categoryId: 18,
    description: 'Suggests privacy-preserving methods and tools for anonymous research queries',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'RESEARCH QUERY',
        required: true,
        placeholder: 'What do you want to search anonymously?',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'text',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['anonymous', 'privacy', 'tor', 'opsec'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 19: AI-NATIVE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'behavioral-pattern-predictor',
    name: 'Behavioral Pattern Predictor',
    category: 'AI-Native Intelligence',
    categoryId: 19,
    description: 'AI predicts behavioral patterns and likely next actions based on historical data',
    inputs: [
      {
        name: 'data',
        type: 'textarea',
        label: 'BEHAVIORAL DATA / OBSERVATIONS',
        required: true,
        placeholder: 'Paste behavioral observations, activity logs, or patterns...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['behavioral', 'prediction', 'ai', 'pattern'],
  },
  {
    id: 'narrative-disinfo-detector',
    name: 'Narrative & Disinformation Detector',
    category: 'AI-Native Intelligence',
    categoryId: 19,
    description: 'AI analyzes text for disinformation patterns, propaganda techniques, and narrative manipulation',
    inputs: [
      {
        name: 'text',
        type: 'textarea',
        label: 'TEXT TO ANALYZE',
        required: true,
        placeholder: 'Paste article, post, or content...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['disinformation', 'narrative', 'propaganda', 'ai'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 20: REAL-TIME MONITORING & ALERTING
  // ═══════════════════════════════════════════════
  {
    id: 'domain-monitoring',
    name: 'Domain Monitoring',
    category: 'Real-Time Monitoring & Alerting',
    categoryId: 20,
    description: 'Sets up monitoring alerts for domain changes, DNS modifications, and SSL updates',
    inputs: [
      {
        name: 'domain',
        type: 'text',
        label: 'DOMAIN TO MONITOR',
        required: true,
        placeholder: 'example.com',
      }
    ],
    dataSources: [
      { name: 'crt.sh', type: 'free_api', endpoint: 'https://crt.sh/' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['monitoring', 'domain', 'alert', 'dns'],
  },
  {
    id: 'breach-alert-feed',
    name: 'Breach Alert Feed',
    category: 'Real-Time Monitoring & Alerting',
    categoryId: 20,
    description: 'Monitors for new data breaches and alerts when target emails or domains are affected',
    inputs: [
      {
        name: 'email',
        type: 'email',
        label: 'EMAIL TO MONITOR',
        required: true,
        placeholder: 'target@example.com',
      }
    ],
    dataSources: [
      { name: 'HIBP', type: 'free_api', endpoint: 'https://haveibeenpwned.com/api/v3' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['breach', 'alert', 'monitoring', 'security'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 21: FORENSIC INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'hash-verification-tool',
    name: 'Hash Verification Tool',
    category: 'Forensic Intelligence',
    categoryId: 21,
    description: 'Generates and verifies file hashes (MD5, SHA1, SHA256) for evidence integrity',
    inputs: [
      {
        name: 'file',
        type: 'file',
        label: 'UPLOAD FILE',
        required: true,
        placeholder: 'Select file for hashing...',
      }
    ],
    dataSources: [
      { name: 'Browser Crypto', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['hash', 'verification', 'forensic', 'integrity'],
  },
  {
    id: 'steganography-detector',
    name: 'Steganography Detector',
    category: 'Forensic Intelligence',
    categoryId: 21,
    description: 'AI-powered detection of hidden data embedded in images and media files',
    inputs: [
      {
        name: 'file',
        type: 'file',
        label: 'UPLOAD IMAGE',
        required: true,
        placeholder: 'Select image to analyze...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['steganography', 'hidden', 'forensic', 'image'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 22: INFRASTRUCTURE & CLOUD INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'cloud-provider-identifier',
    name: 'Cloud Provider Identifier',
    category: 'Infrastructure & Cloud Intelligence',
    categoryId: 22,
    description: 'Identifies which cloud provider hosts a domain or IP and maps its infrastructure',
    inputs: [
      {
        name: 'target',
        type: 'text',
        label: 'DOMAIN OR IP',
        required: true,
        placeholder: 'example.com or 1.2.3.4',
      }
    ],
    dataSources: [
      { name: 'ip-api.com', type: 'free_api', endpoint: 'http://ip-api.com/json/' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['cloud', 'aws', 'azure', 'gcp', 'hosting'],
  },
  {
    id: 'bucket-storage-finder',
    name: 'Bucket & Storage Exposure Finder',
    category: 'Infrastructure & Cloud Intelligence',
    categoryId: 22,
    description: 'Generates search queries for exposed S3 buckets, Azure blobs, and GCS buckets',
    inputs: [
      {
        name: 'keyword',
        type: 'text',
        label: 'COMPANY/KEYWORD',
        required: true,
        placeholder: 'acme-corp',
      }
    ],
    dataSources: [
      { name: 'GrayhatWarfare', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['bucket', 's3', 'storage', 'exposure', 'cloud'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 23: DATA CORRELATION & FUSION
  // ═══════════════════════════════════════════════
  {
    id: 'cross-platform-identity-linker',
    name: 'Cross-Platform Identity Linker',
    category: 'Data Correlation & Fusion',
    categoryId: 23,
    description: 'AI correlates identity fragments across platforms to build unified profiles',
    inputs: [
      {
        name: 'data',
        type: 'textarea',
        label: 'IDENTITY FRAGMENTS',
        required: true,
        placeholder: 'Enter known identifiers: emails, usernames, phone numbers...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['identity', 'correlation', 'fusion', 'cross-platform'],
  },
  {
    id: 'pattern-of-life-analyzer',
    name: 'Pattern of Life Analyzer',
    category: 'Data Correlation & Fusion',
    categoryId: 23,
    description: 'AI builds activity patterns from digital footprint data to predict behavior',
    inputs: [
      {
        name: 'data',
        type: 'textarea',
        label: 'ACTIVITY DATA',
        required: true,
        placeholder: 'Paste timestamps, locations, activities...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pattern', 'behavior', 'activity', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 24: LINGUISTIC & CULTURAL INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'dialect-accent-identifier',
    name: 'Dialect & Accent Identifier',
    category: 'Linguistic & Cultural Intelligence',
    categoryId: 24,
    description: 'AI identifies regional dialect and accent patterns from text or audio transcripts',
    inputs: [
      {
        name: 'text',
        type: 'textarea',
        label: 'TEXT SAMPLE',
        required: true,
        placeholder: 'Paste text for dialect analysis...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'text',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['dialect', 'accent', 'linguistic', 'language'],
  },
  {
    id: 'source-reliability-scorer',
    name: 'Source Reliability Scorer',
    category: 'Linguistic & Cultural Intelligence',
    categoryId: 24,
    description: 'AI scores the reliability and credibility of information sources',
    inputs: [
      {
        name: 'source',
        type: 'textarea',
        label: 'SOURCE DESCRIPTION',
        required: true,
        placeholder: 'Describe the source and its claims...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['reliability', 'credibility', 'source', 'scoring'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 25: SIGNALS INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'spectrum-activity-monitor',
    name: 'Spectrum Activity Monitor',
    category: 'Signals Intelligence',
    categoryId: 25,
    description: 'AI analysis of radio frequency spectrum usage and anomaly detection',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'LOCATION',
        required: true,
        placeholder: 'City or coordinates',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'FCC Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['radio', 'frequency', 'spectrum', 'signals'],
  },
  {
    id: 'five-g-network-mapper',
    name: '5G Network Mapper',
    category: 'Signals Intelligence',
    categoryId: 25,
    description: 'Maps 5G tower deployments and coverage areas for network intelligence',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'LOCATION',
        required: true,
        placeholder: 'City name or coordinates',
      }
    ],
    dataSources: [
      { name: 'OOKLA', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'map',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['5g', 'network', 'cellular', 'coverage'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 26: SPECIALIZED DOMAIN INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'medical-license-verifier',
    name: 'Medical License Verifier',
    category: 'Specialized Domain Intelligence',
    categoryId: 26,
    description: 'Verifies medical practitioner licenses and disciplinary records',
    inputs: [
      {
        name: 'name',
        type: 'text',
        label: 'PRACTITIONER NAME',
        required: true,
        placeholder: 'Dr. John Smith',
      }
    ],
    dataSources: [
      { name: 'State Medical Board', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['medical', 'license', 'verification', 'healthcare'],
  },
  {
    id: 'mitre-attack-mapper',
    name: 'MITRE ATT&CK Mapper',
    category: 'Specialized Domain Intelligence',
    categoryId: 26,
    description: 'Maps threat indicators and attack patterns to the MITRE ATT&CK framework',
    inputs: [
      {
        name: 'indicators',
        type: 'textarea',
        label: 'THREAT INDICATORS',
        required: true,
        placeholder: 'Describe attack patterns or paste IOCs...',
      }
    ],
    dataSources: [
      { name: 'MITRE ATT&CK', type: 'link_out' },
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['mitre', 'attack', 'ttp', 'threat'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 27: EMERGING TECH INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'ai-model-fingerprinter',
    name: 'AI Model Fingerprinter',
    category: 'Emerging Tech Intelligence',
    categoryId: 27,
    description: 'Identifies which AI model generated a piece of text or image',
    inputs: [
      {
        name: 'text',
        type: 'textarea',
        label: 'AI-GENERATED CONTENT',
        required: true,
        placeholder: 'Paste suspected AI-generated text...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['ai', 'detection', 'model', 'fingerprint'],
  },
  {
    id: 'synthetic-media-detector',
    name: 'Synthetic Media Detector',
    category: 'Emerging Tech Intelligence',
    categoryId: 27,
    description: 'Detects AI-generated images, deepfakes, and synthetic media content',
    inputs: [
      {
        name: 'file',
        type: 'file',
        label: 'UPLOAD MEDIA',
        required: true,
        placeholder: 'Select image or video...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['deepfake', 'synthetic', 'ai', 'detection'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 28: HEALTHCARE & MEDICAL INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'drug-trial-finder',
    name: 'Drug Trial Participant Finder',
    category: 'Healthcare & Medical Intelligence',
    categoryId: 28,
    description: 'Searches clinical trial databases for participant information and trial details',
    inputs: [
      {
        name: 'trial',
        type: 'text',
        label: 'SEARCH TERM',
        required: true,
        placeholder: 'Drug name or condition',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['clinical', 'trial', 'medical', 'healthcare'],
  },
  {
    id: 'pharma-patent-tracker',
    name: 'Pharmaceutical Patent Tracker',
    category: 'Healthcare & Medical Intelligence',
    categoryId: 28,
    description: 'Tracks pharmaceutical patents, expiration dates, and generic alternatives',
    inputs: [
      {
        name: 'drug',
        type: 'text',
        label: 'DRUG NAME',
        required: true,
        placeholder: 'Aspirin or patent number',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pharma', 'patent', 'drug', 'intellectual property'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 29: MILITARY & DEFENSE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'military-unit-tracker',
    name: 'Military Unit Tracker',
    category: 'Military & Defense Intelligence',
    categoryId: 29,
    description: 'Identifies and tracks military unit deployments and activities worldwide',
    inputs: [
      {
        name: 'unit',
        type: 'text',
        label: 'UNIT DESIGNATION',
        required: true,
        placeholder: 'Unit name or designation',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['military', 'unit', 'defense', 'deployment'],
  },
  {
    id: 'weapons-system-identifier',
    name: 'Weapons System Identifier',
    category: 'Military & Defense Intelligence',
    categoryId: 29,
    description: 'AI identifies weapons systems from images or descriptions',
    inputs: [
      {
        name: 'data',
        type: 'textarea',
        label: 'DESCRIPTION OR DETAILS',
        required: true,
        placeholder: 'Describe the weapons system...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['weapons', 'military', 'identification', 'defense'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 30: ENVIRONMENTAL & CLIMATE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'pollution-source-tracker',
    name: 'Pollution Source Tracker',
    category: 'Environmental & Climate Intelligence',
    categoryId: 30,
    description: 'Monitors and maps pollution sources using satellite and sensor data',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'LOCATION',
        required: true,
        placeholder: 'City or coordinates',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pollution', 'environment', 'climate'],
  },
  {
    id: 'deforestation-monitor',
    name: 'Deforestation Monitor',
    category: 'Environmental & Climate Intelligence',
    categoryId: 30,
    description: 'Tracks deforestation rates and logging activities via satellite imagery',
    inputs: [
      {
        name: 'region',
        type: 'text',
        label: 'REGION',
        required: true,
        placeholder: 'Amazon Basin or coordinates',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['deforestation', 'forest', 'satellite', 'environment'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 31: SPORTS & ATHLETE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'match-fixing-detector',
    name: 'Match Fixing Detector',
    category: 'Sports & Athlete Intelligence',
    categoryId: 31,
    description: 'AI analyzes betting odds and match data for fixing indicators',
    inputs: [
      {
        name: 'match',
        type: 'text',
        label: 'MATCH OR EVENT',
        required: true,
        placeholder: 'Team A vs Team B',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['sports', 'betting', 'fraud', 'match fixing'],
  },
  {
    id: 'athlete-profile-aggregator',
    name: 'Athlete Profile Aggregator',
    category: 'Sports & Athlete Intelligence',
    categoryId: 31,
    description: 'Aggregates athlete data from sports databases and social media',
    inputs: [
      {
        name: 'name',
        type: 'text',
        label: 'ATHLETE NAME',
        required: true,
        placeholder: 'Athlete full name',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['athlete', 'sports', 'profile'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 32: ENTERTAINMENT & CELEBRITY INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'celebrity-digital-footprint',
    name: 'Celebrity Digital Footprint Mapper',
    category: 'Entertainment & Celebrity Intelligence',
    categoryId: 32,
    description: 'Maps complete digital presence of public figures across all platforms',
    inputs: [
      {
        name: 'name',
        type: 'text',
        label: 'CELEBRITY NAME',
        required: true,
        placeholder: 'Celebrity or public figure name',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['celebrity', 'digital', 'footprint', 'social'],
  },
  {
    id: 'scandal-controversy-timeline',
    name: 'Scandal & Controversy Timeline',
    category: 'Entertainment & Celebrity Intelligence',
    categoryId: 32,
    description: 'Builds chronological timeline of public controversies and scandals',
    inputs: [
      {
        name: 'name',
        type: 'text',
        label: 'PERSON NAME',
        required: true,
        placeholder: 'Public figure name',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['scandal', 'controversy', 'timeline'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 33: RELIGIOUS & CULT INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'cult-activity-monitor',
    name: 'Cult Activity Monitor',
    category: 'Religious & Cult Intelligence',
    categoryId: 33,
    description: 'Monitors known cult organizations for recruitment and activity patterns',
    inputs: [
      {
        name: 'org',
        type: 'text',
        label: 'ORGANIZATION NAME',
        required: true,
        placeholder: 'Group or organization name',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['cult', 'religion', 'monitoring'],
  },
  {
    id: 'extremist-group-tracker',
    name: 'Extremist Group Tracker',
    category: 'Religious & Cult Intelligence',
    categoryId: 33,
    description: 'Tracks extremist group activities and recruitment across platforms',
    inputs: [
      {
        name: 'group',
        type: 'text',
        label: 'GROUP NAME',
        required: true,
        placeholder: 'Group name or ideology',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['extremist', 'group', 'tracking', 'radicalization'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 34: ACADEMIC & RESEARCH INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'academic-fraud-detector',
    name: 'Academic Fraud Detector',
    category: 'Academic & Research Intelligence',
    categoryId: 34,
    description: 'Checks for plagiarism, predatory journals, and fraudulent research papers',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'PAPER TITLE OR DOI',
        required: true,
        placeholder: 'Research paper title or DOI',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['academic', 'fraud', 'plagiarism', 'research'],
  },
  {
    id: 'retracted-paper-monitor',
    name: 'Retracted Paper Monitor',
    category: 'Academic & Research Intelligence',
    categoryId: 34,
    description: 'Monitors for retracted academic papers and research misconduct',
    inputs: [
      {
        name: 'author',
        type: 'text',
        label: 'AUTHOR NAME',
        required: true,
        placeholder: 'Researcher name',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['retraction', 'academic', 'misconduct'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 35: UNDERGROUND MARKETS & TRAFFICKING
  // ═══════════════════════════════════════════════
  {
    id: 'human-trafficking-route-mapper',
    name: 'Human Trafficking Route Mapper',
    category: 'Underground Markets & Trafficking',
    categoryId: 35,
    description: 'AI maps known trafficking routes and identifies patterns',
    inputs: [
      {
        name: 'region',
        type: 'text',
        label: 'REGION OR COUNTRY',
        required: true,
        placeholder: 'Geographic region',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['trafficking', 'human', 'route', 'crime'],
  },
  {
    id: 'counterfeit-goods-mapper',
    name: 'Counterfeit Goods Network Mapper',
    category: 'Underground Markets & Trafficking',
    categoryId: 35,
    description: 'Maps counterfeit product distribution networks and sellers',
    inputs: [
      {
        name: 'product',
        type: 'text',
        label: 'PRODUCT OR BRAND',
        required: true,
        placeholder: 'Brand or product name',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['counterfeit', 'fraud', 'goods'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 36: WEATHER & NATURAL DISASTER INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'storm-tracker',
    name: 'Real-Time Storm Tracker',
    category: 'Weather & Natural Disaster Intelligence',
    categoryId: 36,
    description: 'Tracks active storms, hurricanes, and severe weather events',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'LOCATION',
        required: true,
        placeholder: 'Region or coordinates',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['storm', 'weather', 'hurricane', 'disaster'],
  },
  {
    id: 'earthquake-monitor',
    name: 'Earthquake Early Warning Monitor',
    category: 'Weather & Natural Disaster Intelligence',
    categoryId: 36,
    description: 'Monitors seismic activity and earthquake early warning data',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'LOCATION',
        required: true,
        placeholder: 'Region or coordinates',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['earthquake', 'seismic', 'disaster'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 37: TRANSPORTATION & LOGISTICS INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'traffic-intelligence',
    name: 'Real-Time Traffic Intelligence',
    category: 'Transportation & Logistics Intelligence',
    categoryId: 37,
    description: 'Analyzes traffic patterns and congestion for route intelligence',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'LOCATION',
        required: true,
        placeholder: 'City or route',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['traffic', 'transportation', 'logistics'],
  },
  {
    id: 'accident-hotspot-mapper',
    name: 'Accident & Incident Hotspot Mapper',
    category: 'Transportation & Logistics Intelligence',
    categoryId: 37,
    description: 'Maps historical accident and incident locations for risk assessment',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'LOCATION',
        required: true,
        placeholder: 'City or highway',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['accident', 'incident', 'safety'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 38: POLITICAL & ELECTION INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'campaign-finance-tracker',
    name: 'Campaign Finance Tracker',
    category: 'Political & Election Intelligence',
    categoryId: 38,
    description: 'Tracks political campaign donations and expenditures via FEC data',
    inputs: [
      {
        name: 'name',
        type: 'text',
        label: 'CANDIDATE OR COMMITTEE',
        required: true,
        placeholder: 'Candidate name or PAC',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['campaign', 'finance', 'election', 'political'],
  },
  {
    id: 'politician-social-monitor',
    name: 'Politician Social Monitor',
    category: 'Political & Election Intelligence',
    categoryId: 38,
    description: 'Monitors politicians social media activity and public statements',
    inputs: [
      {
        name: 'name',
        type: 'text',
        label: 'POLITICIAN NAME',
        required: true,
        placeholder: 'Politician full name',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['politician', 'social', 'monitor'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 39: INSURANCE & RISK ASSESSMENT
  // ═══════════════════════════════════════════════
  {
    id: 'insurance-fraud-detector',
    name: 'Insurance Fraud Pattern Detector',
    category: 'Insurance & Risk Assessment',
    categoryId: 39,
    description: 'AI identifies patterns consistent with insurance fraud schemes',
    inputs: [
      {
        name: 'data',
        type: 'textarea',
        label: 'CLAIM DETAILS',
        required: true,
        placeholder: 'Describe the insurance claim...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['insurance', 'fraud', 'risk'],
  },
  {
    id: 'property-risk-scorer',
    name: 'Property Risk Scorer',
    category: 'Insurance & Risk Assessment',
    categoryId: 39,
    description: 'Calculates risk scores for properties based on location and environmental factors',
    inputs: [
      {
        name: 'address',
        type: 'text',
        label: 'PROPERTY ADDRESS',
        required: true,
        placeholder: '123 Main St, City',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['property', 'risk', 'insurance'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 40: REAL ESTATE & URBAN INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'property-ownership-tracer',
    name: 'Property Ownership Chain Tracer',
    category: 'Real Estate & Urban Intelligence',
    categoryId: 40,
    description: 'Traces property ownership history and corporate ownership chains',
    inputs: [
      {
        name: 'address',
        type: 'text',
        label: 'PROPERTY ADDRESS',
        required: true,
        placeholder: '123 Main St, City, State',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['property', 'ownership', 'real estate'],
  },
  {
    id: 'neighborhood-crime-heatmap',
    name: 'Neighborhood Crime Heat Map',
    category: 'Real Estate & Urban Intelligence',
    categoryId: 40,
    description: 'Generates crime heatmaps for neighborhoods using public crime data',
    inputs: [
      {
        name: 'location',
        type: 'text',
        label: 'NEIGHBORHOOD',
        required: true,
        placeholder: 'Address or neighborhood name',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Database', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['crime', 'heatmap', 'neighborhood', 'safety'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 41: ANIMAL & WILDLIFE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'endangered-species-monitor',
    name: 'Endangered Species Trade Monitor',
    category: 'Animal & Wildlife Intelligence',
    categoryId: 41,
    description: 'Endangered Species Trade Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['animal', 'intelligence', 'analysis'],
  },
  {
    id: 'wildlife-migration-tracker',
    name: 'Wildlife Migration Tracker',
    category: 'Animal & Wildlife Intelligence',
    categoryId: 41,
    description: 'Wildlife Migration Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['animal', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 42: CHEMICAL & BIOLOGICAL THREAT DETECTION
  // ═══════════════════════════════════════════════
  {
    id: 'chemical-facility-mapper',
    name: 'Chemical Facility Mapper',
    category: 'Chemical & Biological Threat Detection',
    categoryId: 42,
    description: 'Chemical Facility Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['chemical', 'intelligence', 'analysis'],
  },
  {
    id: 'biolab-mapper',
    name: 'Biolab & BSL Level Mapper',
    category: 'Chemical & Biological Threat Detection',
    categoryId: 42,
    description: 'Biolab & BSL Level Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['chemical', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 43: QUANTUM & EMERGING THREAT VECTORS
  // ═══════════════════════════════════════════════
  {
    id: 'quantum-computing-tracker',
    name: 'Quantum Computing Capability Tracker',
    category: 'Quantum & Emerging Threat Vectors',
    categoryId: 43,
    description: 'Quantum Computing Capability Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['quantum', 'intelligence', 'analysis'],
  },
  {
    id: 'ai-weaponization-monitor',
    name: 'AI Weaponization Monitor',
    category: 'Quantum & Emerging Threat Vectors',
    categoryId: 43,
    description: 'AI Weaponization Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['quantum', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 44: PSYCHOLOGICAL & BEHAVIORAL PROFILING
  // ═══════════════════════════════════════════════
  {
    id: 'dark-triad-scorer',
    name: 'Dark Triad Personality Scorer',
    category: 'Psychological & Behavioral Profiling',
    categoryId: 44,
    description: 'Dark Triad Personality Scorer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['psychological', 'intelligence', 'analysis'],
  },
  {
    id: 'deception-probability-scorer',
    name: 'Deception Probability Scorer',
    category: 'Psychological & Behavioral Profiling',
    categoryId: 44,
    description: 'Deception Probability Scorer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['psychological', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 45: ARCHAEOLOGICAL & HISTORICAL INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'archaeological-site-mapper',
    name: 'Archaeological Site Mapper',
    category: 'Archaeological & Historical Intelligence',
    categoryId: 45,
    description: 'Archaeological Site Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['archaeological', 'intelligence', 'analysis'],
  },
  {
    id: 'declassified-document-search',
    name: 'Declassified Document Search',
    category: 'Archaeological & Historical Intelligence',
    categoryId: 45,
    description: 'Declassified Document Search — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['archaeological', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 46: OCEAN & UNDERWATER INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'underwater-cable-mapper',
    name: 'Underwater Cable Mapper',
    category: 'Ocean & Underwater Intelligence',
    categoryId: 46,
    description: 'Underwater Cable Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['ocean', 'intelligence', 'analysis'],
  },
  {
    id: 'piracy-incident-tracker',
    name: 'Piracy Incident Tracker',
    category: 'Ocean & Underwater Intelligence',
    categoryId: 46,
    description: 'Piracy Incident Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['ocean', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 47: POLAR & EXTREME ENVIRONMENT INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'arctic-ice-monitor',
    name: 'Arctic Ice Coverage Monitor',
    category: 'Polar & Extreme Environment Intelligence',
    categoryId: 47,
    description: 'Arctic Ice Coverage Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['polar', 'intelligence', 'analysis'],
  },
  {
    id: 'glacier-retreat-tracker',
    name: 'Glacier Retreat Tracker',
    category: 'Polar & Extreme Environment Intelligence',
    categoryId: 47,
    description: 'Glacier Retreat Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['polar', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 48: SURVEILLANCE COUNTER-MEASURES
  // ═══════════════════════════════════════════════
  {
    id: 'browser-fingerprint-analyzer',
    name: 'Browser Fingerprint Analyzer',
    category: 'Surveillance Counter-Measures',
    categoryId: 48,
    description: 'Browser Fingerprint Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['surveillance', 'intelligence', 'analysis'],
  },
  {
    id: 'metadata-scrubber',
    name: 'Metadata Scrubber',
    category: 'Surveillance Counter-Measures',
    categoryId: 48,
    description: 'Metadata Scrubber — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['surveillance', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 49: ECONOMIC WARFARE & SANCTIONS INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'sanctions-evasion-detector',
    name: 'Sanctions Evasion Network Detector',
    category: 'Economic Warfare & Sanctions Intelligence',
    categoryId: 49,
    description: 'Sanctions Evasion Network Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['economic', 'intelligence', 'analysis'],
  },
  {
    id: 'currency-manipulation-detector',
    name: 'Currency Manipulation Detector',
    category: 'Economic Warfare & Sanctions Intelligence',
    categoryId: 49,
    description: 'Currency Manipulation Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['economic', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 50: DISINFORMATION & INFLUENCE OPERATIONS
  // ═══════════════════════════════════════════════
  {
    id: 'bot-network-detector',
    name: 'Coordinated Inauthentic Behavior Detector',
    category: 'Disinformation & Influence Operations',
    categoryId: 50,
    description: 'Coordinated Inauthentic Behavior Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['disinformation', 'intelligence', 'analysis'],
  },
  {
    id: 'troll-farm-identifier',
    name: 'Troll Farm Identifier',
    category: 'Disinformation & Influence Operations',
    categoryId: 50,
    description: 'Troll Farm Identifier — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['disinformation', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 51: FUTURISM & PREDICTIVE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'geopolitical-risk-forecaster',
    name: 'Geopolitical Risk Forecaster',
    category: 'Futurism & Predictive Intelligence',
    categoryId: 51,
    description: 'Geopolitical Risk Forecaster — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['futurism', 'intelligence', 'analysis'],
  },
  {
    id: 'social-unrest-predictor',
    name: 'Social Unrest Predictor',
    category: 'Futurism & Predictive Intelligence',
    categoryId: 51,
    description: 'Social Unrest Predictor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['futurism', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 52: CHILD SAFETY & PROTECTION
  // ═══════════════════════════════════════════════
  {
    id: 'csam-hash-checker',
    name: 'Child Exploitation Material Hash Checker',
    category: 'Child Safety & Protection',
    categoryId: 52,
    description: 'Child Exploitation Material Hash Checker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['child', 'intelligence', 'analysis'],
  },
  {
    id: 'online-predator-detector',
    name: 'Online Predator Pattern Detector',
    category: 'Child Safety & Protection',
    categoryId: 52,
    description: 'Online Predator Pattern Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['child', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 53: INTELLECTUAL PROPERTY & COUNTERFEITING
  // ═══════════════════════════════════════════════
  {
    id: 'trademark-infringement-scanner',
    name: 'Trademark Infringement Scanner',
    category: 'Intellectual Property & Counterfeiting',
    categoryId: 53,
    description: 'Trademark Infringement Scanner — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['intellectual', 'intelligence', 'analysis'],
  },
  {
    id: 'counterfeit-product-mapper',
    name: 'Counterfeit Product Network Mapper',
    category: 'Intellectual Property & Counterfeiting',
    categoryId: 53,
    description: 'Counterfeit Product Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['intellectual', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 54: LABOR & HUMAN RIGHTS INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'forced-labor-auditor',
    name: 'Forced Labor Supply Chain Auditor',
    category: 'Labor & Human Rights Intelligence',
    categoryId: 54,
    description: 'Forced Labor Supply Chain Auditor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['labor', 'intelligence', 'analysis'],
  },
  {
    id: 'human-rights-violation-mapper',
    name: 'Human Rights Violation Mapper',
    category: 'Labor & Human Rights Intelligence',
    categoryId: 54,
    description: 'Human Rights Violation Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['labor', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 55: NARCOTICS & DRUG INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'drug-trafficking-mapper',
    name: 'Drug Trafficking Route Mapper',
    category: 'Narcotics & Drug Intelligence',
    categoryId: 55,
    description: 'Drug Trafficking Route Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['narcotics', 'intelligence', 'analysis'],
  },
  {
    id: 'street-price-tracker',
    name: 'Street Price Index Tracker',
    category: 'Narcotics & Drug Intelligence',
    categoryId: 55,
    description: 'Street Price Index Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['narcotics', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 56: TERRORISM & EXTREMISM INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'terrorist-org-database',
    name: 'Terrorist Organization Database',
    category: 'Terrorism & Extremism Intelligence',
    categoryId: 56,
    description: 'Terrorist Organization Database — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['terrorism', 'intelligence', 'analysis'],
  },
  {
    id: 'radicalization-pipeline-mapper',
    name: 'Radicalization Pipeline Mapper',
    category: 'Terrorism & Extremism Intelligence',
    categoryId: 56,
    description: 'Radicalization Pipeline Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['terrorism', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 57: CORPORATE ESPIONAGE & INSIDER THREATS
  // ═══════════════════════════════════════════════
  {
    id: 'insider-threat-profiler',
    name: 'Insider Threat Behavior Profiler',
    category: 'Corporate Espionage & Insider Threats',
    categoryId: 57,
    description: 'Insider Threat Behavior Profiler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['corporate', 'intelligence', 'analysis'],
  },
  {
    id: 'competitive-intel-aggregator',
    name: 'Competitive Intelligence Aggregator',
    category: 'Corporate Espionage & Insider Threats',
    categoryId: 57,
    description: 'Competitive Intelligence Aggregator — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['corporate', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 58: ART & LUXURY GOODS INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'stolen-art-search',
    name: 'Stolen Art Database Search',
    category: 'Art & Luxury Goods Intelligence',
    categoryId: 58,
    description: 'Stolen Art Database Search — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['art', 'intelligence', 'analysis'],
  },
  {
    id: 'provenance-chain-verifier',
    name: 'Provenance Chain Verifier',
    category: 'Art & Luxury Goods Intelligence',
    categoryId: 58,
    description: 'Provenance Chain Verifier — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['art', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 59: BLACK BUDGET & COVERT OPERATIONS
  // ═══════════════════════════════════════════════
  {
    id: 'covert-flight-analyzer',
    name: 'Covert Flight Pattern Analyzer',
    category: 'Black Budget & Covert Operations',
    categoryId: 59,
    description: 'Covert Flight Pattern Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['black', 'intelligence', 'analysis'],
  },
  {
    id: 'shell-company-gov-tracer',
    name: 'Shell Company Government Contractor Tracer',
    category: 'Black Budget & Covert Operations',
    categoryId: 59,
    description: 'Shell Company Government Contractor Tracer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['black', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 60: CRYPTOCURRENCY & DEFI INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'blockchain-tx-visualizer',
    name: 'Blockchain Transaction Graph Visualizer',
    category: 'Cryptocurrency & DeFi Intelligence',
    categoryId: 60,
    description: 'Blockchain Transaction Graph Visualizer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['cryptocurrency', 'intelligence', 'analysis'],
  },
  {
    id: 'rug-pull-warning',
    name: 'Rug Pull Early Warning System',
    category: 'Cryptocurrency & DeFi Intelligence',
    categoryId: 60,
    description: 'Rug Pull Early Warning System — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['cryptocurrency', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 61: SOCIAL MANIPULATION & PROPAGANDA
  // ═══════════════════════════════════════════════
  {
    id: 'meme-warfare-tracker',
    name: 'Meme Warfare Tracker',
    category: 'Social Manipulation & Propaganda',
    categoryId: 61,
    description: 'Meme Warfare Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['social', 'intelligence', 'analysis'],
  },
  {
    id: 'propaganda-technique-identifier',
    name: 'Propaganda Technique Identifier',
    category: 'Social Manipulation & Propaganda',
    categoryId: 61,
    description: 'Propaganda Technique Identifier — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['social', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 62: FORENSIC ACCOUNTING & AUDITING
  // ═══════════════════════════════════════════════
  {
    id: 'benfords-law-analyzer',
    name: 'Benfords Law Fraud Analyzer',
    category: 'Forensic Accounting & Auditing',
    categoryId: 62,
    description: 'Benfords Law Fraud Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['forensic', 'intelligence', 'analysis'],
  },
  {
    id: 'ponzi-scheme-detector',
    name: 'Ponzi Scheme Pattern Detector',
    category: 'Forensic Accounting & Auditing',
    categoryId: 62,
    description: 'Ponzi Scheme Pattern Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['forensic', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 63: PRIVATE MILITARY & MERCENARY INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'pmc-database',
    name: 'Private Military Company Database',
    category: 'Private Military & Mercenary Intelligence',
    categoryId: 63,
    description: 'Private Military Company Database — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['private', 'intelligence', 'analysis'],
  },
  {
    id: 'mercenary-recruitment-monitor',
    name: 'Mercenary Recruitment Monitor',
    category: 'Private Military & Mercenary Intelligence',
    categoryId: 63,
    description: 'Mercenary Recruitment Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['private', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 64: UNDERGROUND IDENTITY MARKETS
  // ═══════════════════════════════════════════════
  {
    id: 'fake-id-market-monitor',
    name: 'Fake ID Market Monitor',
    category: 'Underground Identity Markets',
    categoryId: 64,
    description: 'Fake ID Market Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  {
    id: 'synthetic-identity-detector',
    name: 'Synthetic Identity Fraud Detector',
    category: 'Underground Identity Markets',
    categoryId: 64,
    description: 'Synthetic Identity Fraud Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 65: WHISTLEBLOWER & LEAK INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'leak-verification-tool',
    name: 'Leak Verification Tool',
    category: 'Whistleblower & Leak Intelligence',
    categoryId: 65,
    description: 'Leak Verification Tool — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['whistleblower', 'intelligence', 'analysis'],
  },
  {
    id: 'source-attribution-analyzer',
    name: 'Source Attribution Risk Analyzer',
    category: 'Whistleblower & Leak Intelligence',
    categoryId: 65,
    description: 'Source Attribution Risk Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['whistleblower', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 66: PANDEMIC & BIODEFENSE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'disease-outbreak-aggregator',
    name: 'Disease Outbreak Signal Aggregator',
    category: 'Pandemic & Biodefense Intelligence',
    categoryId: 66,
    description: 'Disease Outbreak Signal Aggregator — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pandemic', 'intelligence', 'analysis'],
  },
  {
    id: 'vaccine-efficacy-monitor',
    name: 'Vaccine Efficacy Monitor',
    category: 'Pandemic & Biodefense Intelligence',
    categoryId: 66,
    description: 'Vaccine Efficacy Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pandemic', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 67: AUGMENTED REALITY & SMART CITY SURVEILLANCE
  // ═══════════════════════════════════════════════
  {
    id: 'smart-city-sensor-mapper',
    name: 'Smart City Sensor Network Mapper',
    category: 'Augmented Reality & Smart City Surveillance',
    categoryId: 67,
    description: 'Smart City Sensor Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['augmented', 'intelligence', 'analysis'],
  },
  {
    id: 'facial-recognition-tracker',
    name: 'Facial Recognition Deployment Tracker',
    category: 'Augmented Reality & Smart City Surveillance',
    categoryId: 67,
    description: 'Facial Recognition Deployment Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['augmented', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 68: NEURAL & BCI INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'bci-device-scanner',
    name: 'BCI Device Registry Scanner',
    category: 'Neural & BCI Intelligence',
    categoryId: 68,
    description: 'BCI Device Registry Scanner — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['neural', 'intelligence', 'analysis'],
  },
  {
    id: 'neural-data-leak-detector',
    name: 'Neural Data Privacy Leak Detector',
    category: 'Neural & BCI Intelligence',
    categoryId: 68,
    description: 'Neural Data Privacy Leak Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['neural', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 69: QUANTUM CRYPTOGRAPHY & POST-QUANTUM THREATS
  // ═══════════════════════════════════════════════
  {
    id: 'post-quantum-tracker',
    name: 'Post-Quantum Algorithm Adoption Tracker',
    category: 'Quantum Cryptography & Post-Quantum Threats',
    categoryId: 69,
    description: 'Post-Quantum Algorithm Adoption Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['quantum', 'intelligence', 'analysis'],
  },
  {
    id: 'harvest-now-decrypt-detector',
    name: 'Harvest Now Decrypt Later Attack Detector',
    category: 'Quantum Cryptography & Post-Quantum Threats',
    categoryId: 69,
    description: 'Harvest Now Decrypt Later Attack Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['quantum', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 70: UNDERGROUND ECONOMY & BARTER NETWORKS
  // ═══════════════════════════════════════════════
  {
    id: 'shadow-economy-estimator',
    name: 'Shadow Economy Size Estimator',
    category: 'Underground Economy & Barter Networks',
    categoryId: 70,
    description: 'Shadow Economy Size Estimator — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  {
    id: 'black-market-price-tracker',
    name: 'Black Market Price Index Tracker',
    category: 'Underground Economy & Barter Networks',
    categoryId: 70,
    description: 'Black Market Price Index Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 71: TRIBAL & INDIGENOUS COMMUNITY INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'indigenous-land-rights-db',
    name: 'Indigenous Land Rights Database',
    category: 'Tribal & Indigenous Community Intelligence',
    categoryId: 71,
    description: 'Indigenous Land Rights Database — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['tribal', 'intelligence', 'analysis'],
  },
  {
    id: 'resource-extraction-monitor',
    name: 'Resource Extraction on Indigenous Land Monitor',
    category: 'Tribal & Indigenous Community Intelligence',
    categoryId: 71,
    description: 'Resource Extraction on Indigenous Land Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['tribal', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 72: DEEPFAKE ECOSYSTEM MAPPING
  // ═══════════════════════════════════════════════
  {
    id: 'deepfake-tool-tracker',
    name: 'Deepfake Generation Tool Tracker',
    category: 'Deepfake Ecosystem Mapping',
    categoryId: 72,
    description: 'Deepfake Generation Tool Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['deepfake', 'intelligence', 'analysis'],
  },
  {
    id: 'face-swap-marketplace-monitor',
    name: 'Face Swap Marketplace Monitor',
    category: 'Deepfake Ecosystem Mapping',
    categoryId: 72,
    description: 'Face Swap Marketplace Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['deepfake', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 73: NANOTECHNOLOGY & MICRO-SURVEILLANCE
  // ═══════════════════════════════════════════════
  {
    id: 'micro-drone-tracker',
    name: 'Micro-Drone Activity Tracker',
    category: 'Nanotechnology & Micro-Surveillance',
    categoryId: 73,
    description: 'Micro-Drone Activity Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['nanotechnology', 'intelligence', 'analysis'],
  },
  {
    id: 'rfid-nfc-detector',
    name: 'RFID & NFC Covert Implant Detector',
    category: 'Nanotechnology & Micro-Surveillance',
    categoryId: 73,
    description: 'RFID & NFC Covert Implant Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['nanotechnology', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 74: CONSCIOUSNESS & MEMETIC WARFARE
  // ═══════════════════════════════════════════════
  {
    id: 'meme-evolution-tracker',
    name: 'Meme Evolution Tracker',
    category: 'Consciousness & Memetic Warfare',
    categoryId: 74,
    description: 'Meme Evolution Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['consciousness', 'intelligence', 'analysis'],
  },
  {
    id: 'overton-window-tracker',
    name: 'Overton Window Shift Tracker',
    category: 'Consciousness & Memetic Warfare',
    categoryId: 74,
    description: 'Overton Window Shift Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['consciousness', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 75: INTERPLANETARY & DEEP SPACE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'mars-mission-tracker',
    name: 'Mars Mission Activity Tracker',
    category: 'Interplanetary & Deep Space Intelligence',
    categoryId: 75,
    description: 'Mars Mission Activity Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['interplanetary', 'intelligence', 'analysis'],
  },
  {
    id: 'space-debris-monitor',
    name: 'Deep Space Network Signal Monitor',
    category: 'Interplanetary & Deep Space Intelligence',
    categoryId: 75,
    description: 'Deep Space Network Signal Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['interplanetary', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 76: HATE GROUP & EXTREMIST NETWORK MAPPING
  // ═══════════════════════════════════════════════
  {
    id: 'hate-group-registry',
    name: 'Hate Group Registry Database',
    category: 'Hate Group & Extremist Network Mapping',
    categoryId: 76,
    description: 'Hate Group Registry Database — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['hate', 'intelligence', 'analysis'],
  },
  {
    id: 'extremist-symbol-recognizer',
    name: 'Extremist Symbol & Insignia Recognizer',
    category: 'Hate Group & Extremist Network Mapping',
    categoryId: 76,
    description: 'Extremist Symbol & Insignia Recognizer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['hate', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 77: CELEBRITY STALKER & THREAT ASSESSMENT
  // ═══════════════════════════════════════════════
  {
    id: 'threat-obsession-profiler',
    name: 'Threat Actor Obsession Profiler',
    category: 'Celebrity Stalker & Threat Assessment',
    categoryId: 77,
    description: 'Threat Actor Obsession Profiler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['celebrity', 'intelligence', 'analysis'],
  },
  {
    id: 'doxing-early-warning',
    name: 'Doxing Attack Early Warning',
    category: 'Celebrity Stalker & Threat Assessment',
    categoryId: 77,
    description: 'Doxing Attack Early Warning — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['celebrity', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 78: ORGAN TRAFFICKING & MEDICAL BLACK MARKETS
  // ═══════════════════════════════════════════════
  {
    id: 'organ-trafficking-mapper',
    name: 'Organ Trafficking Route Mapper',
    category: 'Organ Trafficking & Medical Black Markets',
    categoryId: 78,
    description: 'Organ Trafficking Route Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['organ', 'intelligence', 'analysis'],
  },
  {
    id: 'donor-registry-fraud-detector',
    name: 'Donor Registry Fraud Detector',
    category: 'Organ Trafficking & Medical Black Markets',
    categoryId: 78,
    description: 'Donor Registry Fraud Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['organ', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 79: COUNTERFEIT MEDICINE & PHARMA FRAUD
  // ═══════════════════════════════════════════════
  {
    id: 'counterfeit-drug-mapper',
    name: 'Counterfeit Drug Network Mapper',
    category: 'Counterfeit Medicine & Pharma Fraud',
    categoryId: 79,
    description: 'Counterfeit Drug Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['counterfeit', 'intelligence', 'analysis'],
  },
  {
    id: 'fake-pharmacy-detector',
    name: 'Fake Pharmacy Website Detector',
    category: 'Counterfeit Medicine & Pharma Fraud',
    categoryId: 79,
    description: 'Fake Pharmacy Website Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['counterfeit', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 80: ELECTION TECHNOLOGY VULNERABILITIES
  // ═══════════════════════════════════════════════
  {
    id: 'voting-machine-vuln-db',
    name: 'Voting Machine Vulnerability Database',
    category: 'Election Technology Vulnerabilities',
    categoryId: 80,
    description: 'Voting Machine Vulnerability Database — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['election', 'intelligence', 'analysis'],
  },
  {
    id: 'election-infrastructure-mapper',
    name: 'Election Infrastructure Attack Surface Mapper',
    category: 'Election Technology Vulnerabilities',
    categoryId: 80,
    description: 'Election Infrastructure Attack Surface Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['election', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 81: AUTONOMOUS AI THREAT MONITORING
  // ═══════════════════════════════════════════════
  {
    id: 'rogue-ai-monitor',
    name: 'Rogue AI Behavior Monitor',
    category: 'Autonomous AI Threat Monitoring',
    categoryId: 81,
    description: 'Rogue AI Behavior Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['autonomous', 'intelligence', 'analysis'],
  },
  {
    id: 'ai-alignment-monitor',
    name: 'AI Alignment Research Monitor',
    category: 'Autonomous AI Threat Monitoring',
    categoryId: 81,
    description: 'AI Alignment Research Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['autonomous', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 82: GENETIC & DNA INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'genealogy-dna-search',
    name: 'Public Genealogy DNA Database Search',
    category: 'Genetic & DNA Intelligence',
    categoryId: 82,
    description: 'Public Genealogy DNA Database Search — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['genetic', 'intelligence', 'analysis'],
  },
  {
    id: 'genetic-privacy-monitor',
    name: 'Genetic Privacy Leak Monitor',
    category: 'Genetic & DNA Intelligence',
    categoryId: 82,
    description: 'Genetic Privacy Leak Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['genetic', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 83: BIOHACKING & TRANSHUMANIST NETWORKS
  // ═══════════════════════════════════════════════
  {
    id: 'biohacker-community-monitor',
    name: 'Biohacker Community Monitor',
    category: 'Biohacking & Transhumanist Networks',
    categoryId: 83,
    description: 'Biohacker Community Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['biohacking', 'intelligence', 'analysis'],
  },
  {
    id: 'diy-bio-lab-mapper',
    name: 'DIY Biology Lab Network Mapper',
    category: 'Biohacking & Transhumanist Networks',
    categoryId: 83,
    description: 'DIY Biology Lab Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['biohacking', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 84: TIME-BASED & TEMPORAL INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'timestamp-analyzer',
    name: 'Digital Activity Timestamp Analyzer',
    category: 'Time-Based & Temporal Intelligence',
    categoryId: 84,
    description: 'Digital Activity Timestamp Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['time-based', 'intelligence', 'analysis'],
  },
  {
    id: 'timezone-inconsistency-detector',
    name: 'Time Zone Inconsistency Detector',
    category: 'Time-Based & Temporal Intelligence',
    categoryId: 84,
    description: 'Time Zone Inconsistency Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['time-based', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 85: SOUND & ACOUSTIC INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'background-noise-geolocation',
    name: 'Background Noise Geolocation',
    category: 'Sound & Acoustic Intelligence',
    categoryId: 85,
    description: 'Background Noise Geolocation — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['sound', 'intelligence', 'analysis'],
  },
  {
    id: 'audio-deepfake-detector',
    name: 'Audio Deepfake Detector',
    category: 'Sound & Acoustic Intelligence',
    categoryId: 85,
    description: 'Audio Deepfake Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['sound', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 86: SMELL & CHEMICAL SIGNATURE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'chemical-plume-modeler',
    name: 'Chemical Plume Dispersion Modeler',
    category: 'Smell & Chemical Signature Intelligence',
    categoryId: 86,
    description: 'Chemical Plume Dispersion Modeler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['smell', 'intelligence', 'analysis'],
  },
  {
    id: 'explosive-precursor-monitor',
    name: 'Explosive Precursor Chemical Monitor',
    category: 'Smell & Chemical Signature Intelligence',
    categoryId: 86,
    description: 'Explosive Precursor Chemical Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['smell', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 87: CROWD & MASS BEHAVIOR INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'crowd-density-mapper',
    name: 'Crowd Density Real-Time Mapper',
    category: 'Crowd & Mass Behavior Intelligence',
    categoryId: 87,
    description: 'Crowd Density Real-Time Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['crowd', 'intelligence', 'analysis'],
  },
  {
    id: 'protest-early-warning',
    name: 'Protest & Civil Unrest Early Warning',
    category: 'Crowd & Mass Behavior Intelligence',
    categoryId: 87,
    description: 'Protest & Civil Unrest Early Warning — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['crowd', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 88: SLEEP & CIRCADIAN PATTERN INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'sleep-pattern-profiler',
    name: 'Online Activity Sleep Pattern Profiler',
    category: 'Sleep & Circadian Pattern Intelligence',
    categoryId: 88,
    description: 'Online Activity Sleep Pattern Profiler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['sleep', 'intelligence', 'analysis'],
  },
  {
    id: 'device-usage-profiler',
    name: 'Device Usage Pattern Profiler',
    category: 'Sleep & Circadian Pattern Intelligence',
    categoryId: 88,
    description: 'Device Usage Pattern Profiler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['sleep', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 89: MICRO-EXPRESSION & BODY LANGUAGE AI
  // ═══════════════════════════════════════════════
  {
    id: 'stress-response-visualizer',
    name: 'Stress Response Visualizer',
    category: 'Micro-Expression & Body Language AI',
    categoryId: 89,
    description: 'Stress Response Visualizer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['micro-expression', 'intelligence', 'analysis'],
  },
  {
    id: 'group-dynamics-mapper',
    name: 'Group Dynamics Power Mapper',
    category: 'Micro-Expression & Body Language AI',
    categoryId: 89,
    description: 'Group Dynamics Power Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['micro-expression', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 90: SHADOW GOVERNMENT & DEEP STATE MAPPING
  // ═══════════════════════════════════════════════
  {
    id: 'revolving-door-tracker',
    name: 'Revolving Door Tracker',
    category: 'Shadow Government & Deep State Mapping',
    categoryId: 90,
    description: 'Revolving Door Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['shadow', 'intelligence', 'analysis'],
  },
  {
    id: 'think-tank-influence-mapper',
    name: 'Think Tank Influence Mapper',
    category: 'Shadow Government & Deep State Mapping',
    categoryId: 90,
    description: 'Think Tank Influence Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['shadow', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 91: SIMULATION & REALITY VERIFICATION
  // ═══════════════════════════════════════════════
  {
    id: 'manufactured-event-detector',
    name: 'Manufactured Event Detector',
    category: 'Simulation & Reality Verification',
    categoryId: 91,
    description: 'Manufactured Event Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['simulation', 'intelligence', 'analysis'],
  },
  {
    id: 'truth-decay-tracker',
    name: 'Truth Decay Index Tracker',
    category: 'Simulation & Reality Verification',
    categoryId: 91,
    description: 'Truth Decay Index Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['simulation', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 92: PET & ANIMAL OWNERSHIP INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'pet-registry-search',
    name: 'Pet Registry Database Search',
    category: 'Pet & Animal Ownership Intelligence',
    categoryId: 92,
    description: 'Pet Registry Database Search — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pet', 'intelligence', 'analysis'],
  },
  {
    id: 'animal-abuse-registry-search',
    name: 'Animal Abuse Registry Search',
    category: 'Pet & Animal Ownership Intelligence',
    categoryId: 92,
    description: 'Animal Abuse Registry Search — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pet', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 93: TATTOO CULTURE & GANG MARKING INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'gang-tattoo-recognition',
    name: 'Gang Tattoo Recognition AI',
    category: 'Tattoo Culture & Gang Marking Intelligence',
    categoryId: 93,
    description: 'Gang Tattoo Recognition AI — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['tattoo', 'intelligence', 'analysis'],
  },
  {
    id: 'hate-symbol-tattoo-detector',
    name: 'Hate Symbol Tattoo Detector',
    category: 'Tattoo Culture & Gang Marking Intelligence',
    categoryId: 93,
    description: 'Hate Symbol Tattoo Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['tattoo', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 94: GRAFFITI & STREET ART INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'graffiti-tag-identifier',
    name: 'Graffiti Tag Style Identifier',
    category: 'Graffiti & Street Art Intelligence',
    categoryId: 94,
    description: 'Graffiti Tag Style Identifier — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['graffiti', 'intelligence', 'analysis'],
  },
  {
    id: 'gang-territory-mapper',
    name: 'Gang Territory Marker Mapper',
    category: 'Graffiti & Street Art Intelligence',
    categoryId: 94,
    description: 'Gang Territory Marker Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['graffiti', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 95: UNDERGROUND MUSIC & SUBCULTURE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'underground-venue-mapper',
    name: 'Underground Venue Network Mapper',
    category: 'Underground Music & Subculture Intelligence',
    categoryId: 95,
    description: 'Underground Venue Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  {
    id: 'subculture-radicalization-tracker',
    name: 'Subculture Radicalization Pathway Tracker',
    category: 'Underground Music & Subculture Intelligence',
    categoryId: 95,
    description: 'Subculture Radicalization Pathway Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 96: SPORTS BETTING & MATCH INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'odds-anomaly-detector',
    name: 'Odds Movement Anomaly Detector',
    category: 'Sports Betting & Match Intelligence',
    categoryId: 96,
    description: 'Odds Movement Anomaly Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['sports', 'intelligence', 'analysis'],
  },
  {
    id: 'match-fixing-network-mapper',
    name: 'Match Fixing Network Mapper',
    category: 'Sports Betting & Match Intelligence',
    categoryId: 96,
    description: 'Match Fixing Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['sports', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 97: ASTROLOGY & OCCULT NETWORK INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'occult-org-registry',
    name: 'Occult Organization Registry',
    category: 'Astrology & Occult Network Intelligence',
    categoryId: 97,
    description: 'Occult Organization Registry — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['astrology', 'intelligence', 'analysis'],
  },
  {
    id: 'ritual-crime-database',
    name: 'Ritual Crime Incident Database',
    category: 'Astrology & Occult Network Intelligence',
    categoryId: 97,
    description: 'Ritual Crime Incident Database — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['astrology', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 98: HOMELESS & TRANSIENT POPULATION INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'homeless-encampment-mapper',
    name: 'Homeless Encampment Mapper',
    category: 'Homeless & Transient Population Intelligence',
    categoryId: 98,
    description: 'Homeless Encampment Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['homeless', 'intelligence', 'analysis'],
  },
  {
    id: 'missing-person-crossref',
    name: 'Missing Person Homeless Cross-Reference',
    category: 'Homeless & Transient Population Intelligence',
    categoryId: 98,
    description: 'Missing Person Homeless Cross-Reference — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['homeless', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 99: PRISON & INCARCERATION INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'inmate-location-search',
    name: 'Inmate Location Database Search',
    category: 'Prison & Incarceration Intelligence',
    categoryId: 99,
    description: 'Inmate Location Database Search — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['prison', 'intelligence', 'analysis'],
  },
  {
    id: 'prison-gang-mapper',
    name: 'Prison Gang Network Mapper',
    category: 'Prison & Incarceration Intelligence',
    categoryId: 99,
    description: 'Prison Gang Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['prison', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 100: FASHION & CLOTHING INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'clothing-brand-identifier',
    name: 'Clothing Brand Identifier',
    category: 'Fashion & Clothing Intelligence',
    categoryId: 100,
    description: 'Clothing Brand Identifier — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['fashion', 'intelligence', 'analysis'],
  },
  {
    id: 'uniform-affiliation-recognizer',
    name: 'Uniform & Affiliation Recognizer',
    category: 'Fashion & Clothing Intelligence',
    categoryId: 100,
    description: 'Uniform & Affiliation Recognizer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['fashion', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 101: FOOD & RESTAURANT INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'restaurant-ownership-mapper',
    name: 'Restaurant Ownership Network Mapper',
    category: 'Food & Restaurant Intelligence',
    categoryId: 101,
    description: 'Restaurant Ownership Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['food', 'intelligence', 'analysis'],
  },
  {
    id: 'health-code-violation-db',
    name: 'Health Code Violation Database',
    category: 'Food & Restaurant Intelligence',
    categoryId: 101,
    description: 'Health Code Violation Database — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['food', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 102: HANDWRITING & DOCUMENT FORENSICS
  // ═══════════════════════════════════════════════
  {
    id: 'handwriting-identification',
    name: 'Handwriting Identification AI',
    category: 'Handwriting & Document Forensics',
    categoryId: 102,
    description: 'Handwriting Identification AI — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['handwriting', 'intelligence', 'analysis'],
  },
  {
    id: 'signature-forgery-detector',
    name: 'Signature Forgery Detector',
    category: 'Handwriting & Document Forensics',
    categoryId: 102,
    description: 'Signature Forgery Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['handwriting', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 103: COLOR & VISUAL PATTERN INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'color-palette-profiler',
    name: 'Color Palette Geographic Profiler',
    category: 'Color & Visual Pattern Intelligence',
    categoryId: 103,
    description: 'Color Palette Geographic Profiler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['color', 'intelligence', 'analysis'],
  },
  {
    id: 'visual-steg-detector',
    name: 'Visual Pattern Steganography Detector',
    category: 'Color & Visual Pattern Intelligence',
    categoryId: 103,
    description: 'Visual Pattern Steganography Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['color', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 104: ARCHITECTURE & BUILDING INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'building-style-identifier',
    name: 'Building Style & Era Identifier',
    category: 'Architecture & Building Intelligence',
    categoryId: 104,
    description: 'Building Style & Era Identifier — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['architecture', 'intelligence', 'analysis'],
  },
  {
    id: 'building-code-violation-tracker',
    name: 'Building Code Violation Tracker',
    category: 'Architecture & Building Intelligence',
    categoryId: 104,
    description: 'Building Code Violation Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['architecture', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 105: VEHICLE & TRANSPORTATION FORENSICS
  // ═══════════════════════════════════════════════
  {
    id: 'vehicle-identifier',
    name: 'Vehicle Make & Model Identifier',
    category: 'Vehicle & Transportation Forensics',
    categoryId: 105,
    description: 'Vehicle Make & Model Identifier — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['vehicle', 'intelligence', 'analysis'],
  },
  {
    id: 'vin-decoder',
    name: 'Vehicle VIN Decoder & History',
    category: 'Vehicle & Transportation Forensics',
    categoryId: 105,
    description: 'Vehicle VIN Decoder & History — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['vehicle', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 106: LANGUAGE EVOLUTION & SLANG TRACKING
  // ═══════════════════════════════════════════════
  {
    id: 'criminal-slang-dictionary',
    name: 'Criminal Slang Dictionary',
    category: 'Language Evolution & Slang Tracking',
    categoryId: 106,
    description: 'Criminal Slang Dictionary — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['language', 'intelligence', 'analysis'],
  },
  {
    id: 'coded-message-detector',
    name: 'Coded Message Pattern Detector',
    category: 'Language Evolution & Slang Tracking',
    categoryId: 106,
    description: 'Coded Message Pattern Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['language', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 107: DREAM & SUBCONSCIOUS PATTERN INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'dream-pattern-analyzer',
    name: 'Dream Journal Pattern Analyzer',
    category: 'Dream & Subconscious Pattern Intelligence',
    categoryId: 107,
    description: 'Dream Journal Pattern Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['dream', 'intelligence', 'analysis'],
  },
  {
    id: 'trauma-pattern-recognizer',
    name: 'Trauma Pattern Recognizer',
    category: 'Dream & Subconscious Pattern Intelligence',
    categoryId: 107,
    description: 'Trauma Pattern Recognizer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['dream', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 108: WASTE & GARBAGE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'dumpster-dive-simulator',
    name: 'Dumpster Dive Intelligence Simulator',
    category: 'Waste & Garbage Intelligence',
    categoryId: 108,
    description: 'Dumpster Dive Intelligence Simulator — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['waste', 'intelligence', 'analysis'],
  },
  {
    id: 'e-waste-trafficking-tracker',
    name: 'E-Waste Trafficking Network Tracker',
    category: 'Waste & Garbage Intelligence',
    categoryId: 108,
    description: 'E-Waste Trafficking Network Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['waste', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 109: UNDERGROUND SPORTS & EXTREME ACTIVITIES
  // ═══════════════════════════════════════════════
  {
    id: 'underground-fight-club-mapper',
    name: 'Underground Fight Club Network Mapper',
    category: 'Underground Sports & Extreme Activities',
    categoryId: 109,
    description: 'Underground Fight Club Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  {
    id: 'illegal-racing-tracker',
    name: 'Illegal Street Racing Network Tracker',
    category: 'Underground Sports & Extreme Activities',
    categoryId: 109,
    description: 'Illegal Street Racing Network Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 110: PARANORMAL & UAP INVESTIGATION INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'uap-sighting-aggregator',
    name: 'UAP Sighting Database Aggregator',
    category: 'Paranormal & UAP Investigation Intelligence',
    categoryId: 110,
    description: 'UAP Sighting Database Aggregator — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['paranormal', 'intelligence', 'analysis'],
  },
  {
    id: 'gov-uap-disclosure-tracker',
    name: 'Government UAP Disclosure Tracker',
    category: 'Paranormal & UAP Investigation Intelligence',
    categoryId: 110,
    description: 'Government UAP Disclosure Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['paranormal', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 111: CULT OF PERSONALITY & IDOL INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'fan-cult-behavior-profiler',
    name: 'Fan Cult Behavior Profiler',
    category: 'Cult of Personality & Idol Intelligence',
    categoryId: 111,
    description: 'Fan Cult Behavior Profiler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['cult', 'intelligence', 'analysis'],
  },
  {
    id: 'parasocial-relationship-scorer',
    name: 'Parasocial Relationship Intensity Scorer',
    category: 'Cult of Personality & Idol Intelligence',
    categoryId: 111,
    description: 'Parasocial Relationship Intensity Scorer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['cult', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 112: ANCIENT & SACRED SITE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'sacred-site-monitor',
    name: 'Sacred Site Threat Monitor',
    category: 'Ancient & Sacred Site Intelligence',
    categoryId: 112,
    description: 'Sacred Site Threat Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['ancient', 'intelligence', 'analysis'],
  },
  {
    id: 'ancient-alignment-analyzer',
    name: 'Ancient Astronomical Alignment Analyzer',
    category: 'Ancient & Sacred Site Intelligence',
    categoryId: 112,
    description: 'Ancient Astronomical Alignment Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['ancient', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 113: UNDERGROUND MEDICAL & PHARMA NETWORKS
  // ═══════════════════════════════════════════════
  {
    id: 'underground-pharma-mapper',
    name: 'Underground Medical Network Mapper',
    category: 'Underground Medical & Pharma Networks',
    categoryId: 113,
    description: 'Underground Medical Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  {
    id: 'medical-tourism-risk-profiler',
    name: 'Medical Tourism Risk Profiler',
    category: 'Underground Medical & Pharma Networks',
    categoryId: 113,
    description: 'Medical Tourism Risk Profiler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 114: MICROBIOME & ENVIRONMENTAL DNA INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'edna-location-identifier',
    name: 'Environmental DNA Location Identifier',
    category: 'Microbiome & Environmental DNA Intelligence',
    categoryId: 114,
    description: 'Environmental DNA Location Identifier — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['microbiome', 'intelligence', 'analysis'],
  },
  {
    id: 'crime-scene-microbiome-analyzer',
    name: 'Crime Scene Microbiome Analyzer',
    category: 'Microbiome & Environmental DNA Intelligence',
    categoryId: 114,
    description: 'Crime Scene Microbiome Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['microbiome', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 115: DIGITAL AFTERLIFE & DECEASED PERSON INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'digital-estate-mapper',
    name: 'Digital Estate Intelligence Mapper',
    category: 'Digital Afterlife & Deceased Person Intelligence',
    categoryId: 115,
    description: 'Digital Estate Intelligence Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['digital', 'intelligence', 'analysis'],
  },
  {
    id: 'posthumous-identity-theft-detector',
    name: 'Posthumous Identity Theft Detector',
    category: 'Digital Afterlife & Deceased Person Intelligence',
    categoryId: 115,
    description: 'Posthumous Identity Theft Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['digital', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 116: HUMAN PSYCHOLOGY & SOCIAL ENGINEERING
  // ═══════════════════════════════════════════════
  {
    id: 'phishing-simulation-profiler',
    name: 'Phishing Simulation Profiler',
    category: 'Human Psychology & Social Engineering',
    categoryId: 116,
    description: 'Phishing Simulation Profiler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['human', 'intelligence', 'analysis'],
  },
  {
    id: 'trust-network-mapper',
    name: 'Trust Network Mapper',
    category: 'Human Psychology & Social Engineering',
    categoryId: 116,
    description: 'Trust Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['human', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 117: GAMING & VIRTUAL WORLDS INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'steam-profile-osint',
    name: 'Steam Profile OSINT',
    category: 'Gaming & Virtual Worlds Intelligence',
    categoryId: 117,
    description: 'Steam Profile OSINT — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['gaming', 'intelligence', 'analysis'],
  },
  {
    id: 'discord-gaming-scanner',
    name: 'Discord Gaming Server Scanner',
    category: 'Gaming & Virtual Worlds Intelligence',
    categoryId: 117,
    description: 'Discord Gaming Server Scanner — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['gaming', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 118: JOURNALISM & MEDIA MONITORING
  // ═══════════════════════════════════════════════
  {
    id: 'journalist-safety-monitor',
    name: 'Journalist Safety Monitor',
    category: 'Journalism & Media Monitoring',
    categoryId: 118,
    description: 'Journalist Safety Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['journalism', 'intelligence', 'analysis'],
  },
  {
    id: 'fake-news-detector',
    name: 'Fake News Detector',
    category: 'Journalism & Media Monitoring',
    categoryId: 118,
    description: 'Fake News Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['journalism', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 119: IMMIGRATION & BORDER INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'migration-pattern-mapper',
    name: 'Migration Pattern Mapper',
    category: 'Immigration & Border Intelligence',
    categoryId: 119,
    description: 'Migration Pattern Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['immigration', 'intelligence', 'analysis'],
  },
  {
    id: 'border-incident-monitor',
    name: 'Border Incident Monitor',
    category: 'Immigration & Border Intelligence',
    categoryId: 119,
    description: 'Border Incident Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['immigration', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 120: FOOD & AGRICULTURE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'crop-pattern-analyzer',
    name: 'Crop Pattern Analyzer',
    category: 'Food & Agriculture Intelligence',
    categoryId: 120,
    description: 'Crop Pattern Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['food', 'intelligence', 'analysis'],
  },
  {
    id: 'food-recall-monitor',
    name: 'Food Recall Monitor',
    category: 'Food & Agriculture Intelligence',
    categoryId: 120,
    description: 'Food Recall Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['food', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 121: ENERGY & UTILITIES INFRASTRUCTURE
  // ═══════════════════════════════════════════════
  {
    id: 'power-grid-mapper',
    name: 'Power Grid Mapper',
    category: 'Energy & Utilities Infrastructure',
    categoryId: 121,
    description: 'Power Grid Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['energy', 'intelligence', 'analysis'],
  },
  {
    id: 'nuclear-facility-monitor',
    name: 'Nuclear Facility Monitor',
    category: 'Energy & Utilities Infrastructure',
    categoryId: 121,
    description: 'Nuclear Facility Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['energy', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 122: SPACE & AEROSPACE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'satellite-launch-tracker',
    name: 'Satellite Launch Tracker',
    category: 'Space & Aerospace Intelligence',
    categoryId: 122,
    description: 'Satellite Launch Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['space', 'intelligence', 'analysis'],
  },
  {
    id: 'space-debris-tracker',
    name: 'Space Debris Monitor',
    category: 'Space & Aerospace Intelligence',
    categoryId: 122,
    description: 'Space Debris Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['space', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 123: CYBERSECURITY THREAT HUNTING
  // ═══════════════════════════════════════════════
  {
    id: 'apt-group-profiler',
    name: 'APT Group Profiler',
    category: 'Cybersecurity Threat Hunting',
    categoryId: 123,
    description: 'APT Group Profiler — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['cybersecurity', 'intelligence', 'analysis'],
  },
  {
    id: 'ioc-scanner',
    name: 'IOC Scanner',
    category: 'Cybersecurity Threat Hunting',
    categoryId: 123,
    description: 'IOC Scanner — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['cybersecurity', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 124: SMELL & TASTE PROFILING INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'wine-origin-fingerprinter',
    name: 'Wine Origin Fingerprinter',
    category: 'Smell & Taste Profiling Intelligence',
    categoryId: 124,
    description: 'Wine Origin Fingerprinter — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['smell', 'intelligence', 'analysis'],
  },
  {
    id: 'food-authenticity-tester',
    name: 'Food Authenticity Chemical Tester',
    category: 'Smell & Taste Profiling Intelligence',
    categoryId: 124,
    description: 'Food Authenticity Chemical Tester — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['smell', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 125: SOIL & TERRAIN FORENSICS
  // ═══════════════════════════════════════════════
  {
    id: 'soil-origin-matcher',
    name: 'Soil Geographic Origin Matcher',
    category: 'Soil & Terrain Forensics',
    categoryId: 125,
    description: 'Soil Geographic Origin Matcher — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['soil', 'intelligence', 'analysis'],
  },
  {
    id: 'clandestine-grave-detector',
    name: 'Clandestine Grave Detector',
    category: 'Soil & Terrain Forensics',
    categoryId: 125,
    description: 'Clandestine Grave Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['soil', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 126: LIGHT & OPTICAL INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'light-pollution-mapper',
    name: 'Light Pollution Activity Mapper',
    category: 'Light & Optical Intelligence',
    categoryId: 126,
    description: 'Light Pollution Activity Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['light', 'intelligence', 'analysis'],
  },
  {
    id: 'shadow-analysis-reconstructor',
    name: 'Shadow Analysis Timeline Reconstructor',
    category: 'Light & Optical Intelligence',
    categoryId: 126,
    description: 'Shadow Analysis Timeline Reconstructor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['light', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 127: TIME CAPSULE & LEGACY DATA INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'internet-archive-miner',
    name: 'Internet Archive Deep Miner',
    category: 'Time Capsule & Legacy Data Intelligence',
    categoryId: 127,
    description: 'Internet Archive Deep Miner — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['time', 'intelligence', 'analysis'],
  },
  {
    id: 'old-social-reconstructor',
    name: 'Old Social Media Profile Reconstructor',
    category: 'Time Capsule & Legacy Data Intelligence',
    categoryId: 127,
    description: 'Old Social Media Profile Reconstructor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['time', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 128: UNDERGROUND RELIGIOUS & SPIRITUAL NETWORKS
  // ═══════════════════════════════════════════════
  {
    id: 'banned-religion-tracker',
    name: 'Banned Religion Activity Tracker',
    category: 'Underground Religious & Spiritual Networks',
    categoryId: 128,
    description: 'Banned Religion Activity Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  {
    id: 'persecution-event-monitor',
    name: 'Persecution Event Monitor',
    category: 'Underground Religious & Spiritual Networks',
    categoryId: 128,
    description: 'Persecution Event Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 129: MICRO-NATION & SOVEREIGN CITIZEN INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'sovereign-citizen-mapper',
    name: 'Sovereign Citizen Network Mapper',
    category: 'Micro-Nation & Sovereign Citizen Intelligence',
    categoryId: 129,
    description: 'Sovereign Citizen Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['micro-nation', 'intelligence', 'analysis'],
  },
  {
    id: 'micro-nation-registry',
    name: 'Micro-Nation Registry Database',
    category: 'Micro-Nation & Sovereign Citizen Intelligence',
    categoryId: 129,
    description: 'Micro-Nation Registry Database — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['micro-nation', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 130: NOMADIC & OFF-GRID COMMUNITY TRACKING
  // ═══════════════════════════════════════════════
  {
    id: 'off-grid-satellite-detector',
    name: 'Off-Grid Settlement Satellite Detector',
    category: 'Nomadic & Off-Grid Community Tracking',
    categoryId: 130,
    description: 'Off-Grid Settlement Satellite Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['nomadic', 'intelligence', 'analysis'],
  },
  {
    id: 'doomsday-prepper-mapper',
    name: 'Doomsday Prepper Community Mapper',
    category: 'Nomadic & Off-Grid Community Tracking',
    categoryId: 130,
    description: 'Doomsday Prepper Community Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['nomadic', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 131: BLACK MARKET ADOPTION & SURROGACY INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'adoption-fraud-mapper',
    name: 'Black Market Adoption Network Mapper',
    category: 'Black Market Adoption & Surrogacy Intelligence',
    categoryId: 131,
    description: 'Black Market Adoption Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['black', 'intelligence', 'analysis'],
  },
  {
    id: 'surrogacy-fraud-tracker',
    name: 'Surrogacy Fraud Network Tracker',
    category: 'Black Market Adoption & Surrogacy Intelligence',
    categoryId: 131,
    description: 'Surrogacy Fraud Network Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['black', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 132: SHADOW BANKING & INFORMAL FINANCE
  // ═══════════════════════════════════════════════
  {
    id: 'shadow-bank-mapper',
    name: 'Shadow Bank Network Mapper',
    category: 'Shadow Banking & Informal Finance',
    categoryId: 132,
    description: 'Shadow Bank Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['shadow', 'intelligence', 'analysis'],
  },
  {
    id: 'pyramid-scheme-tracer',
    name: 'Pyramid Scheme Network Tracer',
    category: 'Shadow Banking & Informal Finance',
    categoryId: 132,
    description: 'Pyramid Scheme Network Tracer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['shadow', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 133: CELEBRITY CLONE & IMPERSONATION NETWORKS
  // ═══════════════════════════════════════════════
  {
    id: 'celebrity-impersonator-mapper',
    name: 'Celebrity Impersonator Network Mapper',
    category: 'Celebrity Clone & Impersonation Networks',
    categoryId: 133,
    description: 'Celebrity Impersonator Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['celebrity', 'intelligence', 'analysis'],
  },
  {
    id: 'voice-clone-fraud-tracker',
    name: 'Voice Clone Fraud Network Tracker',
    category: 'Celebrity Clone & Impersonation Networks',
    categoryId: 133,
    description: 'Voice Clone Fraud Network Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['celebrity', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 134: UNDERGROUND WEAPONSMITH NETWORKS
  // ═══════════════════════════════════════════════
  {
    id: 'ghost-gun-mapper',
    name: 'Ghost Gun Network Mapper',
    category: 'Underground Weaponsmith Networks',
    categoryId: 134,
    description: 'Ghost Gun Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  {
    id: 'illegal-weapon-tracker',
    name: 'Dark Web Weapon Listing Aggregator',
    category: 'Underground Weaponsmith Networks',
    categoryId: 134,
    description: 'Dark Web Weapon Listing Aggregator — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 135: PIRATE RADIO & UNLICENSED BROADCASTING
  // ═══════════════════════════════════════════════
  {
    id: 'pirate-radio-locator',
    name: 'Pirate Radio Station Location Triangulator',
    category: 'Pirate Radio & Unlicensed Broadcasting',
    categoryId: 135,
    description: 'Pirate Radio Station Location Triangulator — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pirate', 'intelligence', 'analysis'],
  },
  {
    id: 'numbers-station-monitor',
    name: 'Numbers Station Activity Monitor',
    category: 'Pirate Radio & Unlicensed Broadcasting',
    categoryId: 135,
    description: 'Numbers Station Activity Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['pirate', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 136: UNDERGROUND PUBLISHING & SAMIZDAT NETWORKS
  // ═══════════════════════════════════════════════
  {
    id: 'samizdat-network-mapper',
    name: 'Samizdat & Underground Press Network Mapper',
    category: 'Underground Publishing & Samizdat Networks',
    categoryId: 136,
    description: 'Samizdat & Underground Press Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  {
    id: 'anonymous-publication-detector',
    name: 'Anonymous Publication Authorship Detector',
    category: 'Underground Publishing & Samizdat Networks',
    categoryId: 136,
    description: 'Anonymous Publication Authorship Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 137: STALKERWARE & DOMESTIC ABUSE TECHNOLOGY
  // ═══════════════════════════════════════════════
  {
    id: 'stalkerware-database',
    name: 'Stalkerware App Database',
    category: 'Stalkerware & Domestic Abuse Technology',
    categoryId: 137,
    description: 'Stalkerware App Database — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['stalkerware', 'intelligence', 'analysis'],
  },
  {
    id: 'digital-abuse-evidence-collector',
    name: 'Digital Abuse Evidence Collector',
    category: 'Stalkerware & Domestic Abuse Technology',
    categoryId: 137,
    description: 'Digital Abuse Evidence Collector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['stalkerware', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 138: INHERITANCE & ESTATE FRAUD NETWORKS
  // ═══════════════════════════════════════════════
  {
    id: 'estate-fraud-mapper',
    name: 'Estate Fraud Network Mapper',
    category: 'Inheritance & Estate Fraud Networks',
    categoryId: 138,
    description: 'Estate Fraud Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['inheritance', 'intelligence', 'analysis'],
  },
  {
    id: 'elder-financial-abuse-detector',
    name: 'Elder Financial Abuse Detector',
    category: 'Inheritance & Estate Fraud Networks',
    categoryId: 138,
    description: 'Elder Financial Abuse Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['inheritance', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 139: DISASTER PROFITEERING & CRISIS FRAUD
  // ═══════════════════════════════════════════════
  {
    id: 'price-gouging-monitor',
    name: 'Price Gouging Monitor',
    category: 'Disaster Profiteering & Crisis Fraud',
    categoryId: 139,
    description: 'Price Gouging Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['disaster', 'intelligence', 'analysis'],
  },
  {
    id: 'fake-relief-org-detector',
    name: 'Fake Relief Organization Detector',
    category: 'Disaster Profiteering & Crisis Fraud',
    categoryId: 139,
    description: 'Fake Relief Organization Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['disaster', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 140: WORKPLACE HARASSMENT & TOXIC CULTURE INTELLIGENCE
  // ═══════════════════════════════════════════════
  {
    id: 'toxic-workplace-identifier',
    name: 'Toxic Workplace Pattern Identifier',
    category: 'Workplace Harassment & Toxic Culture Intelligence',
    categoryId: 140,
    description: 'Toxic Workplace Pattern Identifier — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['workplace', 'intelligence', 'analysis'],
  },
  {
    id: 'serial-harasser-tracker',
    name: 'Serial Harasser Network Tracker',
    category: 'Workplace Harassment & Toxic Culture Intelligence',
    categoryId: 140,
    description: 'Serial Harasser Network Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['workplace', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 141: UNDERGROUND TALENT & ENTERTAINMENT AGENCIES
  // ═══════════════════════════════════════════════
  {
    id: 'fake-talent-agency-mapper',
    name: 'Fake Talent Agency Network Mapper',
    category: 'Underground Talent & Entertainment Agencies',
    categoryId: 141,
    description: 'Fake Talent Agency Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  {
    id: 'exploitation-monitor',
    name: 'Child Performer Exploitation Monitor',
    category: 'Underground Talent & Entertainment Agencies',
    categoryId: 141,
    description: 'Child Performer Exploitation Monitor — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['underground', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 142: FAKE CHARITY & HUMANITARIAN FRAUD
  // ═══════════════════════════════════════════════
  {
    id: 'fake-charity-crossref',
    name: 'Fake Charity Registry Cross-Reference',
    category: 'Fake Charity & Humanitarian Fraud',
    categoryId: 142,
    description: 'Fake Charity Registry Cross-Reference — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['fake', 'intelligence', 'analysis'],
  },
  {
    id: 'aid-diversion-tracker',
    name: 'Humanitarian Aid Diversion Tracker',
    category: 'Fake Charity & Humanitarian Fraud',
    categoryId: 142,
    description: 'Humanitarian Aid Diversion Tracker — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['fake', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 143: INSIDER TRADING & MARKET MANIPULATION
  // ═══════════════════════════════════════════════
  {
    id: 'unusual-options-detector',
    name: 'Unusual Options Activity Detector',
    category: 'Insider Trading & Market Manipulation',
    categoryId: 143,
    description: 'Unusual Options Activity Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['insider', 'intelligence', 'analysis'],
  },
  {
    id: 'pump-dump-detector',
    name: 'Pump & Dump Scheme Detector',
    category: 'Insider Trading & Market Manipulation',
    categoryId: 143,
    description: 'Pump & Dump Scheme Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['insider', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 144: GHOST EMPLOYEE & PAYROLL FRAUD
  // ═══════════════════════════════════════════════
  {
    id: 'ghost-employee-detector',
    name: 'Ghost Employee Pattern Detector',
    category: 'Ghost Employee & Payroll Fraud',
    categoryId: 144,
    description: 'Ghost Employee Pattern Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['ghost', 'intelligence', 'analysis'],
  },
  {
    id: 'payroll-fraud-scanner',
    name: 'Public Sector Payroll Fraud Scanner',
    category: 'Ghost Employee & Payroll Fraud',
    categoryId: 144,
    description: 'Public Sector Payroll Fraud Scanner — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['ghost', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 145: CORPORATE CULT & MLM NETWORK MAPPING
  // ═══════════════════════════════════════════════
  {
    id: 'mlm-pyramid-analyzer',
    name: 'MLM Pyramid Structure Analyzer',
    category: 'Corporate Cult & MLM Network Mapping',
    categoryId: 145,
    description: 'MLM Pyramid Structure Analyzer — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['corporate', 'intelligence', 'analysis'],
  },
  {
    id: 'mlm-income-fraud-detector',
    name: 'MLM Income Claim Fraud Detector',
    category: 'Corporate Cult & MLM Network Mapping',
    categoryId: 145,
    description: 'MLM Income Claim Fraud Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['corporate', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 146: ACADEMIC CHEATING & CONTRACT FRAUD SERVICES
  // ═══════════════════════════════════════════════
  {
    id: 'essay-mill-mapper',
    name: 'Essay Mill Network Mapper',
    category: 'Academic Cheating & Contract Fraud Services',
    categoryId: 146,
    description: 'Essay Mill Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['academic', 'intelligence', 'analysis'],
  },
  {
    id: 'ai-academic-work-detector',
    name: 'AI-Generated Academic Work Detector',
    category: 'Academic Cheating & Contract Fraud Services',
    categoryId: 146,
    description: 'AI-Generated Academic Work Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['academic', 'intelligence', 'analysis'],
  },
  // ═══════════════════════════════════════════════
  // CATEGORY 147: PROFESSIONAL LICENSE FRAUD NETWORKS
  // ═══════════════════════════════════════════════
  {
    id: 'fake-doctor-mapper',
    name: 'Fake Doctor Network Mapper',
    category: 'Professional License Fraud Networks',
    categoryId: 147,
    description: 'Fake Doctor Network Mapper — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['professional', 'intelligence', 'analysis'],
  },
  {
    id: 'license-forgery-detector',
    name: 'Professional License Forgery Detector',
    category: 'Professional License Fraud Networks',
    categoryId: 147,
    description: 'Professional License Forgery Detector — AI-powered intelligence analysis and link-out to specialized databases',
    inputs: [
      {
        name: 'query',
        type: 'text',
        label: 'SEARCH QUERY',
        required: true,
        placeholder: 'Enter search term...',
      }
    ],
    dataSources: [
      { name: 'AI Analysis', type: 'ai_only' },
      { name: 'Specialized Databases', type: 'link_out' }
    ],
    outputType: 'mixed',
    aiEnabled: true,
    aiPrompt: 'Analyze the results and provide: 1) Key findings 2) Risk indicators 3) Recommended next investigative steps',
    linkToTarget: true,
    requiresApiKey: false,
    tags: ['professional', 'intelligence', 'analysis'],
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
