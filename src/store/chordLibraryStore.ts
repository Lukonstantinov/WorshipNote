import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '../shared/lib/storage'

export interface ChordLibraryFolder {
  id: string
  name: string
  color: string
}

export interface ChordLibraryEntry {
  id: string
  chordName: string
  instrument: 'guitar' | 'piano'
  folderId?: string
  /** Guitar: fret numbers per string (-1=muted, 0=open, 1-24=fret) */
  frets?: number[]
  fingers?: number[]
  baseFret?: number
  /** Piano: note names e.g. ['C','E','G'] */
  notes?: string[]
  comment?: string
  createdAt: string
}

interface ChordLibraryStore {
  entries: ChordLibraryEntry[]
  folders: ChordLibraryFolder[]
  addEntry: (entry: Omit<ChordLibraryEntry, 'id' | 'createdAt'>) => ChordLibraryEntry
  updateEntry: (id: string, updates: Partial<ChordLibraryEntry>) => void
  deleteEntry: (id: string) => void
  addFolder: (name: string, color: string) => ChordLibraryFolder
  updateFolder: (id: string, updates: Partial<Pick<ChordLibraryFolder, 'name' | 'color'>>) => void
  deleteFolder: (id: string) => void
}

export const useChordLibraryStore = create<ChordLibraryStore>()(
  persist(
    (set) => ({
      entries: [],
      folders: [],
      addEntry: (data) => {
        const entry: ChordLibraryEntry = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ entries: [...s.entries, entry] }))
        return entry
      },
      updateEntry: (id, updates) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
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
          entries: s.entries.map((e) => (e.folderId === id ? { ...e, folderId: undefined } : e)),
        })),
    }),
    { name: 'worshiphub:chord-library' }
  )
)
