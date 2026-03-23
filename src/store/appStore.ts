import { create } from 'zustand'
import type { AppView, AIProviderType } from '@/types'

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
}))
