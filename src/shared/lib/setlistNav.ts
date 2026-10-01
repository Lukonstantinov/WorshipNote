import type { Setlist, SetlistSong } from '../../store/setlistStore'

export function sortedSetlistSongs(setlist: Setlist): SetlistSong[] {
  return setlist.songs.slice().sort((a, b) => a.sort_order - b.sort_order)
}

/** Link to a song opened from a setlist; the song page reads the setlist's transpose/capo and offers prev/next. */
export function setlistSongPath(setlistId: string, index: number, ss: SetlistSong): string {
  return `/songs/${ss.song_id}?setlist=${encodeURIComponent(setlistId)}&i=${index}`
}
