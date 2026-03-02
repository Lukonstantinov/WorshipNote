import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSongStore } from '../store/songStore'
import type { Song } from '../features/songs/types'

export default function HomePage() {
  const { t } = useTranslation()
  const { songs } = useSongStore()
  const [query, setQuery] = useState('')

  const filtered = songs.filter((s) => {
    const q = query.toLowerCase()
    return (
      s.title.toLowerCase().includes(q) ||
      s.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      (s.original_key?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className="p-4 pb-24 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{t('library')}</h2>
        <Link
          to="/songs/new"
          className="px-4 py-2 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: '#a78bfa', color: '#fff', minHeight: 44, display: 'flex', alignItems: 'center' }}
        >
          + {t('newSong')}
        </Link>
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 rounded-xl text-white mb-4 outline-none"
        style={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d4e', minHeight: 44 }}
        placeholder={`🔍 ${t('search')}...`}
      />

      {/* Song list */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-4xl mb-4">🎵</p>
          <p>{t('noSongs')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  )
}

function SongCard({ song }: { song: Song }) {
  const { t } = useTranslation()
  return (
    <Link
      to={`/songs/${song.id}`}
      className="block p-4 rounded-xl transition-colors hover:opacity-90"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{song.title}</h3>
        <div className="flex gap-2 text-xs">
          {song.original_key && (
            <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#2d2d4e', color: '#4ade80' }}>
              {song.original_key}
            </span>
          )}
          {song.bpm && (
            <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#2d2d4e', color: '#9ca3af' }}>
              {song.bpm} {t('bpm')}
            </span>
          )}
        </div>
      </div>
      {song.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {song.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#0f0f0f', color: '#9ca3af' }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
