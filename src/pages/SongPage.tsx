import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
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

  // Keyboard shortcuts
  const handleKey = useCallback((e: KeyboardEvent) => {
    // Don't fire if user is typing in an input
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      setSteps((s) => s + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      setSteps((s) => s - 1)
    } else if (e.key === 'Escape') {
      navigate(-1)
    }
  }, [navigate])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!song) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: 'rgba(235,235,245,0.4)' }}>Песня не найдена</p>
        <Link to="/library" className="mt-4 block" style={{ color: '#bf5af2' }}>← Библиотека</Link>
      </div>
    )
  }

  const ROLES: Role[] = ['musician', 'singer', 'congregation']

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#000000' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0"
        style={{ backgroundColor: '#111111', borderColor: '#2c2c2e' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ color: '#bf5af2', minWidth: 44, minHeight: 44 }}
          title="Назад (Esc)"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-white text-base truncate leading-tight">{song.title}</h1>
          {song.original_key && (
            <p className="text-xs" style={{ color: '#32d74b' }}>
              {song.original_key}{song.bpm ? ` · ${song.bpm} bpm` : ''}
            </p>
          )}
        </div>
        <Link
          to={`/songs/${song.id}/edit`}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#2c2c2e', minWidth: 44, minHeight: 44 }}
          title={t('edit')}
        >
          <Pencil size={16} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.7)' }} />
        </Link>
        <button
          onClick={() => {
            if (confirm(t('confirmDelete'))) {
              deleteSong(song.id)
              navigate('/library')
            }
          }}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#2c2c2e', minWidth: 44, minHeight: 44 }}
          title={t('delete')}
        >
          <Trash2 size={16} strokeWidth={1.5} style={{ color: '#ff453a' }} />
        </button>
      </div>

      {/* Controls bar */}
      <div
        className="px-3 py-2 space-y-2 flex-shrink-0 border-b"
        style={{ backgroundColor: '#000000', borderColor: '#1c1c1e' }}
      >
        <TransposeControls
          steps={steps}
          originalKey={song.original_key}
          capoFret={capo}
          onStepsChange={setSteps}
          onCapoChange={setCapo}
        />
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: role === r ? '#2c2c2e' : 'transparent',
                  color: role === r ? '#ffffff' : 'rgba(235,235,245,0.4)',
                  minHeight: 44,
                  borderRadius: 10,
                }}
              >
                {t(r)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <FontSizeSlider />
            <AutoScroller />
          </div>
        </div>
      </div>

      {/* Keyboard hint (desktop only) */}
      <div
        className="hidden md:flex items-center gap-4 px-4 py-1.5 border-b text-xs"
        style={{ borderColor: '#1c1c1e', color: 'rgba(235,235,245,0.2)' }}
      >
        <span>← → Transpose</span>
        <span>Esc Back</span>
        <span>Space Scroll</span>
      </div>

      {/* Song content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <SongViewer parsed={parsed} />
      </div>
    </div>
  )
}
