import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useEffect } from 'react'
import { useSongStore } from '../../store/songStore'
import { useSetlistStore } from '../../store/setlistStore'
import { loadSongs, saveSongs, loadSetlists, saveSetlists } from '../lib/storage'
import { SEED_SONGS } from '../lib/seedData'

export function Layout() {
  const { songs, setSongs } = useSongStore()
  const { setlists, setSetlists } = useSetlistStore()

  // Load from localStorage on mount; seed if empty
  useEffect(() => {
    const storedSongs = loadSongs()
    if (storedSongs.length > 0) {
      setSongs(storedSongs)
    } else {
      setSongs(SEED_SONGS)
    }
    const storedSetlists = loadSetlists()
    if (storedSetlists.length > 0) {
      setSetlists(storedSetlists)
    }
  }, [])

  // Persist songs to localStorage
  useEffect(() => {
    saveSongs(songs)
  }, [songs])

  // Persist setlists to localStorage
  useEffect(() => {
    saveSetlists(setlists)
  }, [setlists])

  return (
    <div className="flex h-full" style={{ backgroundColor: '#000000' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ backgroundColor: '#000000' }}>
        <Outlet />
      </main>
    </div>
  )
}
