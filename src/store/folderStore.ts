import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Folder } from '../features/songs/types'
import { generateId } from '../shared/lib/storage'

interface FolderStore {
  folders: Folder[]
  addFolder: (name: string, color: string) => Folder
  updateFolder: (id: string, updates: Partial<Pick<Folder, 'name' | 'color'>>) => void
  deleteFolder: (id: string) => void
  getFolderById: (id: string) => Folder | undefined
}

export const useFolderStore = create<FolderStore>()(
  persist(
    (set, get) => ({
      folders: [],
      addFolder: (name, color) => {
        const folder: Folder = { id: generateId(), name, color }
        set((s) => ({ folders: [...s.folders, folder] }))
        return folder
      },
      updateFolder: (id, updates) =>
        set((s) => ({
          folders: s.folders.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        })),
      deleteFolder: (id) =>
        set((s) => ({ folders: s.folders.filter((f) => f.id !== id) })),
      getFolderById: (id) => get().folders.find((f) => f.id === id),
    }),
    { name: 'worshiphub:folders' }
  )
)
