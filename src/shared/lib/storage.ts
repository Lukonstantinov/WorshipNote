import type { Song } from '../../features/songs/types'
import type { Setlist } from '../../store/setlistStore'

const SONGS_KEY = 'worshiphub:songs'
const SETLISTS_KEY = 'worshiphub:setlists'

export function loadSongs(): Song[] {
  try {
    const raw = localStorage.getItem(SONGS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSongs(songs: Song[]): void {
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs))
}

export function loadSetlists(): Setlist[] {
  try {
    const raw = localStorage.getItem(SETLISTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSetlists(setlists: Setlist[]): void {
  localStorage.setItem(SETLISTS_KEY, JSON.stringify(setlists))
}

export function generateId(): string {
  return crypto.randomUUID()
}
