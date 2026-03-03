import { create } from 'zustand'

export interface SetlistSong {
  id: string
  song_id: string
  sort_order: number
  transpose_steps: number
  capo_fret: number
  /** vocalist name shown in brackets before the song title */
  vocalist?: string
  /** hex colour for the vocalist label */
  vocalColor?: string
}

export interface Setlist {
  id: string
  title: string
  service_date?: string
  notes?: string
  songs: SetlistSong[]
  created_at: string
  updated_at: string
}

interface SetlistStore {
  setlists: Setlist[]
  setSetlists: (setlists: Setlist[]) => void
  addSetlist: (setlist: Setlist) => void
  updateSetlist: (id: string, updates: Partial<Setlist>) => void
  deleteSetlist: (id: string) => void
  getSetlistById: (id: string) => Setlist | undefined
}

export const useSetlistStore = create<SetlistStore>((set, get) => ({
  setlists: [],
  setSetlists: (setlists) => set({ setlists }),
  addSetlist: (setlist) => set((state) => ({ setlists: [...state.setlists, setlist] })),
  updateSetlist: (id, updates) =>
    set((state) => ({
      setlists: state.setlists.map((sl) =>
        sl.id === id ? { ...sl, ...updates, updated_at: new Date().toISOString() } : sl
      ),
    })),
  deleteSetlist: (id) =>
    set((state) => ({ setlists: state.setlists.filter((sl) => sl.id !== id) })),
  getSetlistById: (id) => get().setlists.find((sl) => sl.id === id),
}))
