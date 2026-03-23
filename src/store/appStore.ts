import { create } from 'zustand'
import type { AppView, AIProviderType } from '@/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * Globe layer visibility state.
 * Each key corresponds to a toggleable layer on the Mission Control globe.
 * Layers not yet built (cctvMesh, weatherRadar, earthquakeActivity) are
 * defined here for UI completeness — their toggles show as disabled.
 */
export interface GlobeLayerVisibility {
  targetMarkers: boolean
  flightPaths: boolean
  satelliteOrbits: boolean
  threatHeatmap: boolean
  investigationSpotlight: boolean
  cctvMesh: boolean
  weatherRadar: boolean
  earthquakeActivity: boolean
}

export type GlobeLayerKey = keyof GlobeLayerVisibility

export type ToastSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Toast {
  id: string
  message: string
  severity: ToastSeverity
  createdAt: Date
}

const DEFAULT_LAYER_VISIBILITY: GlobeLayerVisibility = {
  targetMarkers: true,
  flightPaths: true,
  satelliteOrbits: true,
  threatHeatmap: true,
  investigationSpotlight: true,
  cctvMesh: false,
  weatherRadar: false,
  earthquakeActivity: false,
}

interface AppState {
  // Navigation
  currentView: AppView
  setCurrentView: (view: AppView) => void

  // Panels
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  setLeftPanelOpen: (open: boolean) => void
  setRightPanelOpen: (open: boolean) => void

  // Active target
  activeTargetId: string | null
  setActiveTargetId: (id: string | null) => void

  // Active tool
  activeToolId: string | null
  setActiveToolId: (id: string | null) => void

  // AI Provider
  activeProvider: AIProviderType
  setActiveProvider: (provider: AIProviderType) => void

  // Boot sequence
  bootComplete: boolean
  setBootComplete: (complete: boolean) => void

  // System uptime
  startTime: Date

  // Global search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Globe layers
  globeLayers: GlobeLayerVisibility
  toggleGlobeLayer: (layer: GlobeLayerKey) => void
  setGlobeLayerVisible: (layer: GlobeLayerKey, visible: boolean) => void
  resetGlobeLayers: () => void

  // Toast notifications
  toasts: Toast[]
  addToast: (message: string, severity: ToastSeverity) => void
  removeToast: (id: string) => void
}

export const useAppStore = create<AppState>()((set) => ({
  // Navigation
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),

  // Panels
  leftPanelOpen: true,
  rightPanelOpen: false,
  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

  // Active target
  activeTargetId: null,
  setActiveTargetId: (id) => set({ activeTargetId: id }),

  // Active tool
  activeToolId: null,
  setActiveToolId: (id) => set({ activeToolId: id }),

  // AI Provider
  activeProvider: 'nvidia-nemotron',
  setActiveProvider: (provider) => set({ activeProvider: provider }),

  // Boot sequence
  bootComplete: false,
  setBootComplete: (complete) => set({ bootComplete: complete }),

  // System uptime
  startTime: new Date(),

  // Global search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Globe layers
  globeLayers: { ...DEFAULT_LAYER_VISIBILITY },
  toggleGlobeLayer: (layer) =>
    set((state) => ({
      globeLayers: {
        ...state.globeLayers,
        [layer]: !state.globeLayers[layer],
      },
    })),
  setGlobeLayerVisible: (layer, visible) =>
    set((state) => ({
      globeLayers: {
        ...state.globeLayers,
        [layer]: visible,
      },
    })),
  resetGlobeLayers: () => set({ globeLayers: { ...DEFAULT_LAYER_VISIBILITY } }),

  // Toast notifications
  toasts: [],
  addToast: (message, severity) => {
    const toast: Toast = {
      id: uuidv4(),
      message,
      severity,
      createdAt: new Date(),
    }
    set((state) => ({ toasts: [...state.toasts, toast] }))
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
