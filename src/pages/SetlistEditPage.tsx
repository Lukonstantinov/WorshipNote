import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSetlistStore } from '../store/setlistStore'
import { useSongStore } from '../store/songStore'
import { generateId } from '../shared/lib/storage'
import type { SetlistSong } from '../store/setlistStore'

export default function SetlistEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getSetlistById, addSetlist, updateSetlist } = useSetlistStore()
  const { songs } = useSongStore()

  const existing = id ? getSetlistById(id) : undefined

  const [title, setTitle] = useState(existing?.title ?? '')
  const [date, setDate] = useState(existing?.service_date ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [selectedSongs, setSelectedSongs] = useState<SetlistSong[]>(existing?.songs ?? [])

  const addSongToSetlist = (songId: string) => {
    if (selectedSongs.find((s) => s.song_id === songId)) return
    setSelectedSongs((prev) => [
      ...prev,
      {
        id: generateId(),
        song_id: songId,
        sort_order: prev.length,
        transpose_steps: 0,
        capo_fret: 0,
      },
    ])
  }

  const removeSong = (id: string) => {
    setSelectedSongs((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, sort_order: i })))
  }

  const handleSave = () => {
    const now = new Date().toISOString()
    if (existing) {
      updateSetlist(existing.id, { title, service_date: date, notes, songs: selectedSongs })
      navigate('/setlists')
    } else {
      addSetlist({
        id: generateId(),
        title,
        service_date: date || undefined,
        notes: notes || undefined,
        songs: selectedSongs,
        created_at: now,
        updated_at: now,
      })
      navigate('/setlists')
    }
  }

  const unusedSongs = songs.filter((s) => !selectedSongs.find((ss) => ss.song_id === s.id))

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100%' }}>
      <div className="px-4 py-3 border-b" style={{ backgroundColor: '#1a1a2e', borderColor: '#2d2d4e' }}>
        <h1 className="text-lg font-bold text-white">{existing ? t('edit') : t('newSetlist')}</h1>
      </div>

      <div className="p-4 space-y-4 pb-24 max-w-2xl mx-auto">
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('title')}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-white outline-none"
            style={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d4e', minHeight: 44 }}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('date')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-white outline-none"
            style={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d4e', minHeight: 44, colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">{t('notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-white outline-none resize-none"
            style={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d4e' }}
          />
        </div>

        {/* Selected songs */}
        <div>
          <h3 className="text-sm text-gray-400 mb-2">Песни в служении ({selectedSongs.length})</h3>
          {selectedSongs.length === 0 ? (
            <p className="text-gray-600 text-sm">Добавьте песни из списка ниже</p>
          ) : (
            <div className="space-y-2">
              {selectedSongs.sort((a, b) => a.sort_order - b.sort_order).map((ss, i) => {
                const song = songs.find((s) => s.id === ss.song_id)
                if (!song) return null
                return (
                  <div key={ss.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#1a1a2e' }}>
                    <span className="text-gray-500 text-sm">{i + 1}.</span>
                    <span className="flex-1 text-white text-sm">{song.title}</span>
                    {song.original_key && (
                      <span className="text-xs px-2 rounded" style={{ backgroundColor: '#2d2d4e', color: '#4ade80' }}>{song.original_key}</span>
                    )}
                    <button
                      onClick={() => removeSong(ss.id)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ backgroundColor: '#2d2d4e', color: '#f87171', minHeight: 44, minWidth: 44 }}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add songs */}
        {unusedSongs.length > 0 && (
          <div>
            <h3 className="text-sm text-gray-400 mb-2">{t('addSong')}</h3>
            <div className="space-y-1">
              {unusedSongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => addSongToSetlist(song.id)}
                  className="w-full text-left p-3 rounded-lg flex items-center gap-3"
                  style={{ backgroundColor: '#1a1a2e', minHeight: 44 }}
                >
                  <span className="text-green-400">+</span>
                  <span className="text-white text-sm flex-1">{song.title}</span>
                  {song.original_key && (
                    <span className="text-xs px-2 rounded" style={{ backgroundColor: '#2d2d4e', color: '#4ade80' }}>{song.original_key}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: '#a78bfa', minHeight: 44 }}
          >
            {t('save')}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl font-semibold"
            style={{ backgroundColor: '#2d2d4e', color: '#9ca3af', minHeight: 44 }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
