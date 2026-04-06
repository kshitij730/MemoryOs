'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Space } from '@/lib/types'
import { spacesApi } from '@/lib/api'

interface SpaceState {
    spaces: Space[]
    activeSpace: Space | null
    isLoading: boolean
    error: string | null
    fetchSpaces: () => Promise<void>
    setActiveSpace: (space: Space | null) => void
    createSpace: (name: string, description?: string, icon?: string, color?: string) => Promise<void>
    deleteSpace: (id: string) => Promise<void>
}

export const useSpaceStore = create<SpaceState>()(
    persist(
        (set, get) => ({
            spaces: [],
            activeSpace: null,
            isLoading: false,
            error: null,

            fetchSpaces: async () => {
                set({ isLoading: true, error: null })
                try {
                    const spaces = await spacesApi.list()
                    set({ spaces })

                    const currentActive = get().activeSpace
                    if (!currentActive || !spaces.find(s => s.id === currentActive.id)) {
                        const def = spaces.find(s => s.is_default) || spaces[0] || null
                        set({ activeSpace: def })
                    }
                } catch (e: any) {
                    set({ error: e.message })
                } finally {
                    set({ isLoading: false })
                }
            },

            setActiveSpace: (space: Space | null) => set({ activeSpace: space }),

            createSpace: async (name: string, description?: string, icon?: string, color?: string) => {
                try {
                    const newSpace = await spacesApi.create({ name, description, icon, color })
                    set(state => ({ spaces: [...state.spaces, newSpace], activeSpace: newSpace }))
                } catch (e: any) {
                    set({ error: e.message })
                    throw e
                }
            },

            deleteSpace: async (id: string) => {
                try {
                    await spacesApi.delete(id)
                    const newSpaces = get().spaces.filter(s => s.id !== id)
                    const nextActive = newSpaces.find(s => s.is_default) || newSpaces[0] || null
                    set({ spaces: newSpaces, activeSpace: nextActive })
                } catch (e: any) {
                    set({ error: e.message })
                    throw e
                }
            }
        }),
        {
            name: 'memory-os-space-storage',
            partialize: (state: SpaceState) => ({ activeSpace: state.activeSpace }),
        }
    )
)
