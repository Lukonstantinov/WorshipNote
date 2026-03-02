import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSongStore } from '../store/songStore'
import { parseSong } from '../features/songs/lib/parser'
import { transposeSong } from '../features/songs/lib/transposer'
import { SongViewer } from '../features/songs/components/SongViewer'
import { TransposeControls } from '../features/songs/components/TransposeControls'
import { AutoScroller } from '../shared/components/AutoScroller'
import { FontSizeSlider } from '../shared/components/FontSizeSlider'
import { useSettingsStore } from '../store/settingsStore'
import type { Role } from '../store/settingsStore'

export default function SongPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getSongById, deleteSong } = useSongStore()
  const { role, setRole } = useSettingsStore()

  const [steps, setSteps] = useState(0)
  const [capo, setCapo] = useState(0)

  const song = getSongById(id!)

  const transposedContent = useMemo(() => {
    if (!song) return ''
    return transposeSong(song.content, steps)
  }, [song, steps])

  const parsed = useMemo(() => parseSong(transposedContent), [transposedContent])

  if (!song) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Песня не найдена</p>
        <Link to="/library" className="text-purple-400 mt-4 block">← Библиотека</Link>
      </div>
    )
  }

  const ROLES: Role[] = ['musician', 'singer', 'congregation']

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#0f0f0f' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
        style={{ backgroundColor: '#1a1a2e', borderColor: '#2d2d4e' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white p-1 mr-1"
          style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white text-base truncate">{song.title}</h1>
          {song.original_key && (
            <p className="text-xs" style={{ color: '#4ade80' }}>
              {song.original_key}{song.bpm ? ` · ${song.bpm} bpm` : ''}
            </p>
          )}
        </div>
        <Link
          to={`/songs/${song.id}/edit`}
          className="text-sm px-3 py-2 rounded-lg"
          style={{ backgroundColor: '#2d2d4e', color: '#a78bfa', minHeight: 44, display: 'flex', alignItems: 'center' }}
        >
          {t('edit')}
        </Link>
        <button
          onClick={() => {
            if (confirm(t('confirmDelete'))) {
              deleteSong(song.id)
              navigate('/library')
            }
          }}
          className="text-sm px-3 py-2 rounded-lg"
          style={{ backgroundColor: '#2d2d4e', color: '#f87171', minHeight: 44, display: 'flex', alignItems: 'center' }}
        >
          {t('delete')}
        </button>
      </div>

      {/* Controls bar */}
      <div
        className="px-4 py-2 space-y-2 flex-shrink-0 border-b"
        style={{ backgroundColor: '#0f0f0f', borderColor: '#2d2d4e' }}
      >
        <TransposeControls
          steps={steps}
          originalKey={song.original_key}
          capoFret={capo}
          onStepsChange={setSteps}
          onCapoChange={setCapo}
        />
        <div className="flex items-center gap-3 flex-wrap">
          {/* Role toggle */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#2d2d4e' }}>
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="px-3 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor: role === r ? '#a78bfa' : '#1a1a2e',
                  color: role === r ? '#fff' : '#9ca3af',
                  minHeight: 44,
                }}
              >
                {t(r)}
              </button>
            ))}
          </div>
          <FontSizeSlider />
          <AutoScroller />
        </div>
      </div>

      {/* Song content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <SongViewer parsed={parsed} />
      </div>
    </div>
  )
}
