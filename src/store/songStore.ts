import { create } from 'zustand'
import type { Song } from '../features/songs/types'

interface SongStore {
  songs: Song[]
  setSongs: (songs: Song[]) => void
  addSong: (song: Song) => void
  updateSong: (id: string, updates: Partial<Song>) => void
  deleteSong: (id: string) => void
  getSongById: (id: string) => Song | undefined
}

export const useSongStore = create<SongStore>((set, get) => ({
  songs: [],
  setSongs: (songs) => set({ songs }),
  addSong: (song) => set((state) => ({ songs: [...state.songs, song] })),
  updateSong: (id, updates) =>
    set((state) => ({
      songs: state.songs.map((s) =>
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      ),
    })),
  deleteSong: (id) =>
    set((state) => ({ songs: state.songs.filter((s) => s.id !== id) })),
  getSongById: (id) => get().songs.find((s) => s.id === id),
}))
