import { create } from 'zustand'
import { db } from '../db'
import type { Activity, ActivityLog } from '../types'

interface ActivityState {
  activities: Activity[]
  currentLog: ActivityLog | null
  isTracking: boolean

  loadActivities: () => Promise<void>
  addActivity: (name: string, color: string) => Promise<void>
  updateActivity: (id: string, name: string, color: string) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  reorderActivities: (activities: Activity[]) => Promise<void>

  switchActivity: (activityId: string) => Promise<void>
  stopTracking: () => Promise<void>
  loadCurrentLog: () => Promise<void>
  syncOnResume: () => Promise<void>
  updateCurrentMemo: (memo: string) => Promise<void>
  updateLog: (id: number, data: { startedAt?: number; endedAt?: number; memo?: string }) => Promise<void>
  deleteLog: (id: number) => Promise<void>
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  currentLog: null,
  isTracking: false,

  loadActivities: async () => {
    const activities = await db.activities.orderBy('order').toArray()
    set({ activities })
  },

  addActivity: async (name, color) => {
    const { activities } = get()
    const id = crypto.randomUUID()
    const activity: Activity = {
      id,
      name,
      color,
      order: activities.length,
      createdAt: Date.now(),
    }
    await db.activities.add(activity)
    await get().loadActivities()
  },

  updateActivity: async (id, name, color) => {
    await db.activities.update(id, { name, color })
    await get().loadActivities()
  },

  deleteActivity: async (id) => {
    await db.activities.delete(id)
    await get().loadActivities()
  },

  reorderActivities: async (activities) => {
    const updates = activities.map((a, i) => ({ ...a, order: i }))
    await db.activities.bulkPut(updates)
    set({ activities: updates })
  },

  switchActivity: async (activityId) => {
    const now = Date.now()
    const { currentLog } = get()

    // 현재 진행중인 로그 종료 (10초 미만이면 삭제 — 빠른 탭 스킵)
    if (currentLog?.id) {
      if (now - currentLog.startedAt < 10000) {
        await db.activityLogs.delete(currentLog.id)
      } else {
        await db.activityLogs.update(currentLog.id, { endedAt: now })
      }
    }

    // 새 로그 시작
    const newLog: ActivityLog = {
      activityId,
      startedAt: now,
    }
    const id = await db.activityLogs.add(newLog)
    set({
      currentLog: { ...newLog, id: id as number },
      isTracking: true,
    })
  },

  stopTracking: async () => {
    const { currentLog } = get()
    if (currentLog?.id) {
      await db.activityLogs.update(currentLog.id, { endedAt: Date.now() })
    }
    set({ currentLog: null, isTracking: false })
  },

  loadCurrentLog: async () => {
    const lastLog = await db.activityLogs
      .orderBy('startedAt')
      .reverse()
      .first()

    if (lastLog && !lastLog.endedAt) {
      set({ currentLog: lastLog, isTracking: true })
    }
  },

  updateCurrentMemo: async (memo) => {
    const { currentLog } = get()
    if (currentLog?.id) {
      await db.activityLogs.update(currentLog.id, { memo })
      set({ currentLog: { ...currentLog, memo } })
    }
  },

  updateLog: async (id, data) => {
    await db.activityLogs.update(id, data)
  },

  deleteLog: async (id) => {
    const { currentLog } = get()
    await db.activityLogs.delete(id)
    if (currentLog?.id === id) {
      set({ currentLog: null, isTracking: false })
    }
  },

  // 백그라운드에서 복귀할 때 DB에서 최신 상태 동기화
  syncOnResume: async () => {
    const lastLog = await db.activityLogs
      .orderBy('startedAt')
      .reverse()
      .first()

    if (lastLog && !lastLog.endedAt) {
      set({ currentLog: lastLog, isTracking: true })
    } else {
      set({ currentLog: null, isTracking: false })
    }
  },
}))

// 백그라운드 복귀 시 자동 동기화
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      useActivityStore.getState().syncOnResume()
    }
  })

  window.addEventListener('focus', () => {
    useActivityStore.getState().syncOnResume()
  })
}
