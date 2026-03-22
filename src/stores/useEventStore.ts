import { create } from 'zustand'
import { db } from '../db'
import type { EventType, EventLog } from '../types'

interface EventState {
  eventTypes: EventType[]

  loadEventTypes: () => Promise<void>
  addEventType: (name: string, color: string) => Promise<void>
  updateEventType: (id: string, name: string, color: string) => Promise<void>
  deleteEventType: (id: string) => Promise<void>
  logEvent: (eventTypeId: string) => Promise<void>
}

export const useEventStore = create<EventState>((set, get) => ({
  eventTypes: [],

  loadEventTypes: async () => {
    const eventTypes = await db.eventTypes.orderBy('createdAt').toArray()
    set({ eventTypes })
  },

  addEventType: async (name, color) => {
    const id = crypto.randomUUID()
    await db.eventTypes.add({
      id,
      name,
      color,
      createdAt: Date.now(),
    })
    await get().loadEventTypes()
  },

  updateEventType: async (id, name, color) => {
    await db.eventTypes.update(id, { name, color })
    await get().loadEventTypes()
  },

  deleteEventType: async (id) => {
    await db.eventTypes.delete(id)
    await get().loadEventTypes()
  },

  logEvent: async (eventTypeId) => {
    const log: EventLog = {
      eventTypeId,
      occurredAt: Date.now(),
    }
    await db.eventLogs.add(log)
  },
}))
