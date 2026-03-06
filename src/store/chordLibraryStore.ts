import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '../shared/lib/storage'

export interface ChordLibraryFolder {
  id: string
  name: string
  color: string
}

/** A named chord progression, e.g. "Worship Chorus: Am–F–C–G" */
export interface ChordProgression {
  id: string
  name: string
  /** Musical key for Roman numeral analysis, e.g. "C", "Am" */
  key?: string
  /** Ordered chord names in the progression, e.g. ["Am", "F", "C", "G"] */
  chords: string[]
  description?: string
  folderId?: string
  createdAt: string
}

interface ChordLibraryStore {
  progressions: ChordProgression[]
  folders: ChordLibraryFolder[]
  addProgression: (data: Omit<ChordProgression, 'id' | 'createdAt'>) => ChordProgression
  updateProgression: (id: string, updates: Partial<ChordProgression>) => void
  deleteProgression: (id: string) => void
  deleteProgressions: (ids: string[]) => void
  moveProgressionsToFolder: (ids: string[], folderId: string | undefined) => void
  addFolder: (name: string, color: string) => ChordLibraryFolder
  updateFolder: (id: string, updates: Partial<Pick<ChordLibraryFolder, 'name' | 'color'>>) => void
  deleteFolder: (id: string) => void
}

export const useChordLibraryStore = create<ChordLibraryStore>()(
  persist(
    (set) => ({
      progressions: [],
      folders: [],
      addProgression: (data) => {
        const progression: ChordProgression = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ progressions: [...s.progressions, progression] }))
        return progression
      },
      updateProgression: (id, updates) =>
        set((s) => ({
          progressions: s.progressions.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteProgression: (id) =>
        set((s) => ({ progressions: s.progressions.filter((p) => p.id !== id) })),
      deleteProgressions: (ids) =>
        set((s) => ({ progressions: s.progressions.filter((p) => !ids.includes(p.id)) })),
      moveProgressionsToFolder: (ids, folderId) =>
        set((s) => ({
          progressions: s.progressions.map((p) =>
            ids.includes(p.id) ? { ...p, folderId } : p
          ),
        })),
      addFolder: (name, color) => {
        const folder: ChordLibraryFolder = { id: generateId(), name, color }
        set((s) => ({ folders: [...s.folders, folder] }))
        return folder
      },
      updateFolder: (id, updates) =>
        set((s) => ({
          folders: s.folders.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        })),
      deleteFolder: (id) =>
        set((s) => ({
          folders: s.folders.filter((f) => f.id !== id),
          progressions: s.progressions.map((p) => (p.folderId === id ? { ...p, folderId: undefined } : p)),
        })),
    }),
    { name: 'worshiphub:chord-library' }
  )
)
