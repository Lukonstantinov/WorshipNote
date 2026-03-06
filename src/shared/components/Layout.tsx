import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useEffect } from 'react'
import { useSongStore } from '../../store/songStore'
import { useSetlistStore } from '../../store/setlistStore'
import { useSettingsStore } from '../../store/settingsStore'
import { loadSongs, saveSongs, loadSetlists, saveSetlists } from '../lib/storage'
import { SEED_SONGS } from '../lib/seedData'
import '../../shared/styles/themes.css'

export function Layout() {
  const { songs, setSongs } = useSongStore()
  const { setlists, setSetlists } = useSetlistStore()
  const { theme } = useSettingsStore()

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

  // Apply theme class to <html>
  useEffect(() => {
    const html = document.documentElement
    html.className = html.className.replace(/theme-\w+/g, '').trim()
    html.classList.add(`theme-${theme}`)
  }, [theme])

  const bgColor = theme === 'light' ? '#f2f2f7' : theme === 'midnight' ? '#080c14' : theme === 'forest' ? '#0a1a0e' : '#000000'

  return (
    <div className="flex h-full" style={{ backgroundColor: bgColor }}>
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ backgroundColor: bgColor }}>
        <Outlet />
      </main>
    </div>
  )
}
