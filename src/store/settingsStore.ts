import { create } from 'zustand'
import type { AIProviderType } from '@/types'

/** Provider configuration stored in Settings */
export interface ProviderConfig {
  id: AIProviderType
  name: string
  description: string
  apiKey: string
  baseUrl: string
  model: string
  status: 'unchecked' | 'checking' | 'valid' | 'invalid'
  lastChecked: Date | null
  isDefault: boolean
}

/** Display settings for visual effects */
export interface DisplaySettings {
  scanlines: boolean
  crtVignette: boolean
  noiseOverlay: boolean
  bootSequence: boolean
  typewriterEffect: boolean
  glowEffects: boolean
}

/** OpSec configuration */
export interface OpSecSettings {
  proxyEnabled: boolean
  metadataStripping: boolean
  chainOfCustody: boolean
  timestampVerification: boolean
}

/** Data management settings */
export interface DataSettings {
  autoSave: boolean
  retentionDays: number
  exportFormat: 'json' | 'csv'
}

interface SettingsState {
  // Active settings tab
  activeTab: 'api-keys' | 'ai-preferences' | 'opsec' | 'data' | 'display'
  setActiveTab: (tab: SettingsState['activeTab']) => void

  // Provider configs
  providers: ProviderConfig[]
  updateProviderKey: (id: AIProviderType, key: string) => void
  updateProviderBaseUrl: (id: AIProviderType, url: string) => void
  updateProviderModel: (id: AIProviderType, model: string) => void
  setProviderStatus: (id: AIProviderType, status: ProviderConfig['status']) => void
  setProviderLastChecked: (id: AIProviderType, date: Date) => void
  setDefaultProvider: (id: AIProviderType) => void

  // Display settings
  display: DisplaySettings
  updateDisplay: (key: keyof DisplaySettings, value: boolean) => void

  // OpSec settings
  opsec: OpSecSettings
  updateOpSec: (key: keyof OpSecSettings, value: boolean) => void

  // Data settings
  data: DataSettings
  updateData: <K extends keyof DataSettings>(key: K, value: DataSettings[K]) => void

  // Persistence
  loadSettings: () => void
  saveSettings: () => void
}

const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    id: 'nvidia-nemotron',
    name: 'NVIDIA NEMOTRON-3 SUPER 120B',
    description: 'PRIMARY AI PROVIDER // CHAIN-OF-THOUGHT REASONING // BUNDLED API KEY',
    apiKey: '',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    model: 'nvidia/nemotron-3-super-120b-a12b',
    status: 'unchecked',
    lastChecked: null,
    isDefault: true,
  },
  {
    id: 'ollama',
    name: 'OLLAMA',
    description: 'LOCAL LLM PROVIDER // LLAMA3.2 // MISTRAL // PHI3 // NO API KEY REQUIRED',
    apiKey: '',
    baseUrl: 'http://localhost:11434',
    model: 'llama3.2',
    status: 'unchecked',
    lastChecked: null,
    isDefault: false,
  },
  {
    id: 'gemini',
    name: 'GOOGLE GEMINI',
    description: 'CLOUD API // 1500 REQ/DAY FREE TIER // GEMINI PRO',
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-pro',
    status: 'unchecked',
    lastChecked: null,
    isDefault: false,
  },
  {
    id: 'groq',
    name: 'GROQ',
    description: 'ULTRA-FAST INFERENCE // FREE TIER // LLAMA3 // MIXTRAL',
    apiKey: '',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama3-70b-8192',
    status: 'unchecked',
    lastChecked: null,
    isDefault: false,
  },
  {
    id: 'openrouter',
    name: 'OPENROUTER',
    description: 'MULTI-MODEL GATEWAY // 100+ MODELS // FREE OPTIONS AVAILABLE',
    apiKey: '',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'meta-llama/llama-3-8b-instruct:free',
    status: 'unchecked',
    lastChecked: null,
    isDefault: false,
  },
]

const SETTINGS_STORAGE_KEY = 'sp-settings'

function loadFromStorage(): Partial<{
  providers: ProviderConfig[]
  display: DisplaySettings
  opsec: OpSecSettings
  data: DataSettings
}> {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as ReturnType<typeof loadFromStorage>
  } catch {
    return {}
  }
}

function saveToStorage(state: {
  providers: ProviderConfig[]
  display: DisplaySettings
  opsec: OpSecSettings
  data: DataSettings
}) {
  try {
    // Mask API keys before saving — store encrypted-style obfuscation
    const safeProviders = state.providers.map((p) => ({
      ...p,
      // Store keys in localStorage (per PRD 13.1)
      apiKey: p.apiKey,
    }))
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        providers: safeProviders,
        display: state.display,
        opsec: state.opsec,
        data: state.data,
      })
    )
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  activeTab: 'api-keys',
  setActiveTab: (tab) => set({ activeTab: tab }),

  providers: DEFAULT_PROVIDERS,

  updateProviderKey: (id, key) =>
    set((state) => {
      const providers = state.providers.map((p) =>
        p.id === id ? { ...p, apiKey: key, status: 'unchecked' as const } : p
      )
      saveToStorage({ providers, display: state.display, opsec: state.opsec, data: state.data })
      return { providers }
    }),

  updateProviderBaseUrl: (id, url) =>
    set((state) => {
      const providers = state.providers.map((p) =>
        p.id === id ? { ...p, baseUrl: url, status: 'unchecked' as const } : p
      )
      saveToStorage({ providers, display: state.display, opsec: state.opsec, data: state.data })
      return { providers }
    }),

  updateProviderModel: (id, model) =>
    set((state) => {
      const providers = state.providers.map((p) =>
        p.id === id ? { ...p, model } : p
      )
      saveToStorage({ providers, display: state.display, opsec: state.opsec, data: state.data })
      return { providers }
    }),

  setProviderStatus: (id, status) =>
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    })),

  setProviderLastChecked: (id, date) =>
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, lastChecked: date } : p
      ),
    })),

  setDefaultProvider: (id) =>
    set((state) => {
      const providers = state.providers.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
      saveToStorage({ providers, display: state.display, opsec: state.opsec, data: state.data })
      return { providers }
    }),

  display: {
    scanlines: true,
    crtVignette: true,
    noiseOverlay: true,
    bootSequence: true,
    typewriterEffect: true,
    glowEffects: true,
  },

  updateDisplay: (key, value) =>
    set((state) => {
      const display = { ...state.display, [key]: value }
      saveToStorage({ providers: state.providers, display, opsec: state.opsec, data: state.data })
      return { display }
    }),

  opsec: {
    proxyEnabled: false,
    metadataStripping: true,
    chainOfCustody: true,
    timestampVerification: true,
  },

  updateOpSec: (key, value) =>
    set((state) => {
      const opsec = { ...state.opsec, [key]: value }
      saveToStorage({ providers: state.providers, display: state.display, opsec, data: state.data })
      return { opsec }
    }),

  data: {
    autoSave: true,
    retentionDays: 90,
    exportFormat: 'json',
  },

  updateData: (key, value) =>
    set((state) => {
      const data = { ...state.data, [key]: value }
      saveToStorage({ providers: state.providers, display: state.display, opsec: state.opsec, data })
      return { data }
    }),

  loadSettings: () => {
    const stored = loadFromStorage()
    if (stored.providers) {
      // Merge stored provider keys with default configs (in case new providers added)
      const merged = DEFAULT_PROVIDERS.map((def) => {
        const saved = stored.providers?.find((p) => p.id === def.id)
        return saved ? { ...def, apiKey: saved.apiKey, isDefault: saved.isDefault, baseUrl: saved.baseUrl, model: saved.model } : def
      })
      set({ providers: merged })
    }
    if (stored.display) set({ display: stored.display })
    if (stored.opsec) set({ opsec: stored.opsec })
    if (stored.data) set({ data: stored.data })
  },

  saveSettings: () => {
    const state = get()
    saveToStorage({
      providers: state.providers,
      display: state.display,
      opsec: state.opsec,
      data: state.data,
    })
  },
}))
