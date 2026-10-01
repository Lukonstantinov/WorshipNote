import type { Song } from '../../features/songs/types'
import type { Setlist } from '../../store/setlistStore'

const SONGS_KEY = 'worshiphub:songs'
const SETLISTS_KEY = 'worshiphub:setlists'

/** Returns `null` when nothing has ever been stored (first launch). */
function loadArray<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveArray<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    // Quota exceeded or storage unavailable — keep the app running.
    console.error(`Failed to save ${key}`, err)
  }
}

export function loadSongs(): Song[] | null {
  return loadArray<Song>(SONGS_KEY)
}

export function saveSongs(songs: Song[]): void {
  saveArray(SONGS_KEY, songs)
}

export function loadSetlists(): Setlist[] | null {
  return loadArray<Setlist>(SETLISTS_KEY)
}

export function saveSetlists(setlists: Setlist[]): void {
  saveArray(SETLISTS_KEY, setlists)
}

export function generateId(): string {
  return crypto.randomUUID()
}
