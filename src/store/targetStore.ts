import { create } from 'zustand'
import type { Target } from '@/types'
import { db } from '@/db/db'
import { v4 as uuidv4 } from 'uuid'

interface TargetState {
  targets: Target[]
  loading: boolean
  error: string | null

  loadTargets: () => Promise<void>
  createTarget: (target: Omit<Target, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Target>
  updateTarget: (id: string, updates: Partial<Target>) => Promise<void>
  deleteTarget: (id: string) => Promise<void>
  getTargetById: (id: string) => Target | undefined
}

export const useTargetStore = create<TargetState>()((set, get) => ({
  targets: [],
  loading: false,
  error: null,

  loadTargets: async () => {
    set({ loading: true, error: null })
    try {
      const targets = await db.targets.orderBy('updatedAt').reverse().toArray()
      set({ targets, loading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'DB_ERROR: Failed to load targets',
        loading: false,
      })
    }
  },

  createTarget: async (targetData) => {
    const now = new Date()
    const target: Target = {
      ...targetData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }
    try {
      await db.targets.add(target)
      set((state) => ({ targets: [target, ...state.targets] }))
      return target
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'DB_ERROR: Failed to create target',
      })
      throw err
    }
  },

  updateTarget: async (id, updates) => {
    try {
      const updateData = { ...updates, updatedAt: new Date() }
      await db.targets.update(id, updateData)
      set((state) => ({
        targets: state.targets.map((t) => (t.id === id ? { ...t, ...updateData } : t)),
      }))
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'DB_ERROR: Failed to update target',
      })
    }
  },

  deleteTarget: async (id) => {
    try {
      await db.targets.delete(id)
      set((state) => ({
        targets: state.targets.filter((t) => t.id !== id),
      }))
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'DB_ERROR: Failed to delete target',
      })
    }
  },

  getTargetById: (id) => {
    return get().targets.find((t) => t.id === id)
  },
}))
