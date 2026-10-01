import { create } from 'zustand'
import type { Song } from '../features/songs/types'
import { loadSongs, saveSongs } from '../shared/lib/storage'
import { SEED_SONGS } from '../shared/lib/seedData'

function initialSongs(): Song[] {
  const stored = loadSongs()
  if (stored) return stored
  saveSongs(SEED_SONGS)
  return SEED_SONGS
}

interface SongStore {
  songs: Song[]
  setSongs: (songs: Song[]) => void
  addSong: (song: Song) => void
  updateSong: (id: string, updates: Partial<Song>) => void
  deleteSong: (id: string) => void
  getSongById: (id: string) => Song | undefined
  deleteSongs: (ids: string[]) => void
  moveSongsToFolder: (ids: string[], folderId: string | undefined) => void
}

export const useSongStore = create<SongStore>((set, get) => ({
  // Load synchronously so the first render already has the library.
  // Seed only on the very first launch — not when the user deleted every song.
  songs: initialSongs(),
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
  deleteSongs: (ids) =>
    set((state) => ({ songs: state.songs.filter((s) => !ids.includes(s.id)) })),
  moveSongsToFolder: (ids, folderId) =>
    set((state) => ({
      songs: state.songs.map((s) =>
        ids.includes(s.id) ? { ...s, folderId, updated_at: new Date().toISOString() } : s
      ),
    })),
}))

// Persist every change
useSongStore.subscribe((state, prev) => {
  if (state.songs !== prev.songs) saveSongs(state.songs)
})
