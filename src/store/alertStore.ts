import { create } from 'zustand'
import type { Alert } from '@/types'
import { db } from '@/db/db'
import { v4 as uuidv4 } from 'uuid'

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  loading: boolean
  error: string | null

  loadAlerts: () => Promise<void>
  createAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'read'>) => Promise<Alert>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  dismissAlert: (id: string) => Promise<void>
}

export const useAlertStore = create<AlertState>()((set) => ({
  alerts: [],
  unreadCount: 0,
  loading: false,
  error: null,

  loadAlerts: async () => {
    set({ loading: true, error: null })
    try {
      const alerts = await db.alerts.orderBy('createdAt').reverse().toArray()
      const unreadCount = alerts.filter((a) => !a.read).length
      set({ alerts, unreadCount, loading: false })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'DB_ERROR: Failed to load alerts',
        loading: false,
      })
    }
  },

  createAlert: async (alertData) => {
    const alert: Alert = {
      ...alertData,
      id: uuidv4(),
      read: false,
      createdAt: new Date(),
    }
    try {
      await db.alerts.add(alert)
      set((state) => ({
        alerts: [alert, ...state.alerts],
        unreadCount: state.unreadCount + 1,
      }))
      return alert
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'DB_ERROR: Failed to create alert',
      })
      throw err
    }
  },

  markRead: async (id) => {
    try {
      await db.alerts.update(id, { read: true })
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'DB_ERROR: Failed to update alert',
      })
    }
  },

  markAllRead: async () => {
    try {
      await db.alerts.toCollection().modify({ read: true })
      set((state) => ({
        alerts: state.alerts.map((a) => ({ ...a, read: true })),
        unreadCount: 0,
      }))
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'DB_ERROR: Failed to update alerts',
      })
    }
  },

  dismissAlert: async (id) => {
    try {
      await db.alerts.delete(id)
      set((state) => {
        const alert = state.alerts.find((a) => a.id === id)
        return {
          alerts: state.alerts.filter((a) => a.id !== id),
          unreadCount: alert && !alert.read ? state.unreadCount - 1 : state.unreadCount,
        }
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'DB_ERROR: Failed to dismiss alert',
      })
    }
  },
}))
