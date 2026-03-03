import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Pencil, Trash2, ChevronDown, Guitar, Piano, Music2, Drum } from 'lucide-react'
import { useSongStore } from '../store/songStore'
import { parseSong, extractStructure } from '../features/songs/lib/parser'
import { transposeSong } from '../features/songs/lib/transposer'
import { SongViewer } from '../features/songs/components/SongViewer'
import { TransposeControls } from '../features/songs/components/TransposeControls'
import { AutoScroller } from '../shared/components/AutoScroller'
import { FontSizeSlider } from '../shared/components/FontSizeSlider'
import { Metronome } from '../features/songs/components/Metronome'
import { SongStructure } from '../features/songs/components/SongStructure'
import { ChordDiagramPanel } from '../features/songs/components/ChordDiagramPanel'
import { ChordRowsPanel } from '../features/songs/components/ChordRowsPanel'
import { useSettingsStore } from '../store/settingsStore'
import type { Role } from '../store/settingsStore'
import type { Instrument } from '../features/songs/types'

const INSTRUMENT_ICONS: Record<Instrument['type'], React.ReactNode> = {
  guitar:   <Guitar size={14} strokeWidth={1.5} />,
  piano:    <Piano size={14} strokeWidth={1.5} />,
  keyboard: <Piano size={14} strokeWidth={1.5} />,
  bass:     <Guitar size={14} strokeWidth={1.5} />,
  ukulele:  <Music2 size={14} strokeWidth={1.5} />,
  drums:    <Drum size={14} strokeWidth={1.5} />,
  other:    <Music2 size={14} strokeWidth={1.5} />,
}

const BUILT_IN_DEFAULTS: Record<string, { showChords: boolean; showCues: boolean; showDiagrams: boolean }> = {
  musician: { showChords: true, showCues: true, showDiagrams: true },
  singer: { showChords: true, showCues: false, showDiagrams: false },
  congregation: { showChords: false, showCues: false, showDiagrams: false },
}

export default function SongPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getSongById, deleteSong, updateSong } = useSongStore()
  const {
    role, setRole,
    instruments, selectedInstrument, setSelectedInstrument,
    chordDisplayPosition,
    roleLabels, customRoles,
  } = useSettingsStore()

  const [steps, setSteps] = useState(0)
  const [capo, setCapo] = useState(0)
  const [showInstrumentMenu, setShowInstrumentMenu] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  const song = getSongById(id!)

  const transposedContent = useMemo(() => {
    if (!song) return ''
    return transposeSong(song.content, steps)
  }, [song, steps])

  const parsed = useMemo(() => parseSong(transposedContent), [transposedContent])

  const { labels: structureLabels, pattern: structurePattern } = useMemo(
    () => (song ? extractStructure(song.content) : { labels: [], pattern: '' }),
    [song]
  )

  // Resolve capabilities for the active role
  const capabilities = useMemo(() => {
    const customRole = customRoles.find((cr) => cr.id === role)
    if (customRole) {
      return { showChords: customRole.showChords, showCues: customRole.showCues, showDiagrams: customRole.showDiagrams }
    }
    return BUILT_IN_DEFAULTS[role as string] ?? BUILT_IN_DEFAULTS.musician
  }, [role, customRoles])

  // Keyboard shortcuts
  const handleKey = useCallback((e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault(); setSteps((s) => s + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault(); setSteps((s) => s - 1)
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
        <p style={{ color: 'rgba(235,235,245,0.4)' }}>Song not found</p>
        <Link to="/library" className="mt-4 block" style={{ color: '#bf5af2' }}>← Library</Link>
      </div>
    )
  }

  // Build combined role list: built-in + custom
  const BUILT_IN_ROLES: Role[] = ['musician', 'singer', 'congregation']
  const allRoles: { id: string; label: string }[] = [
    ...BUILT_IN_ROLES.map((r) => ({ id: r, label: roleLabels[r] || t(r) })),
    ...customRoles.map((cr) => ({ id: cr.id, label: cr.name })),
  ]

  const activeInstrument = instruments.find((i) => i.id === selectedInstrument)
  const showChordDiagrams = capabilities.showDiagrams && chordDisplayPosition !== 'none'

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
          title="Back (Esc)"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-white text-base truncate leading-tight">{song.title}</h1>
          {song.original_key && (
            <p className="text-xs" style={{ color: '#32d74b' }}>
              {song.original_key}{song.bpm ? ` · ${song.bpm} BPM` : ''}
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
          <div className="flex rounded-xl overflow-hidden flex-wrap" style={{ backgroundColor: '#1c1c1e' }}>
            {allRoles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className="px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: role === r.id ? '#2c2c2e' : 'transparent',
                  color: role === r.id ? '#ffffff' : 'rgba(235,235,245,0.4)',
                  minHeight: 44,
                  borderRadius: 10,
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Instrument picker (when diagrams are shown) */}
          {capabilities.showDiagrams && instruments.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowInstrumentMenu((p) => !p)}
                className="flex items-center gap-1.5 px-3 rounded-xl text-xs font-medium transition-all"
                style={{
                  backgroundColor: '#1c1c1e',
                  color: 'rgba(235,235,245,0.7)',
                  minHeight: 44,
                  border: '1px solid #2c2c2e',
                }}
              >
                {activeInstrument && <span style={{ opacity: 0.7 }}>{INSTRUMENT_ICONS[activeInstrument.type]}</span>}
                <span>{activeInstrument?.name ?? t('instrument')}</span>
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              {showInstrumentMenu && (
                <div
                  className="absolute top-12 left-0 rounded-xl shadow-xl z-20 overflow-hidden"
                  style={{ backgroundColor: '#2c2c2e', minWidth: 140 }}
                >
                  {instruments.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => { setSelectedInstrument(inst.id); setShowInstrumentMenu(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-all hover:bg-white/10"
                      style={{ color: selectedInstrument === inst.id ? '#32d74b' : 'rgba(235,235,245,0.8)' }}
                    >
                      <span style={{ opacity: 0.7 }}>{INSTRUMENT_ICONS[inst.type]}</span>
                      {inst.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {song.bpm && <Metronome bpm={song.bpm} />}
            <FontSizeSlider />
            <AutoScroller scrollRef={scrollRef as React.RefObject<HTMLElement | null>} />
          </div>
        </div>
      </div>

      {/* Chord diagrams — top position */}
      {showChordDiagrams && chordDisplayPosition === 'top' && (
        <ChordDiagramPanel parsed={parsed} position="top" />
      )}

      {/* ABAC structure bar */}
      {capabilities.showCues && (structureLabels.length > 0 || song.structure) && (
        <SongStructure
          labels={structureLabels}
          pattern={structurePattern}
          manualStructure={song.structure}
        />
      )}

      {/* Main area: content + optional side chord panel */}
      <div className="flex flex-1 min-h-0">
        {/* Song content */}
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <SongViewer parsed={parsed} />
          </div>
          {/* Chord rows panel */}
          {capabilities.showDiagrams && (
            <ChordRowsPanel
              songId={song.id}
              chordRows={song.chordRows ?? []}
              onChange={(rows) => updateSong(song.id, { chordRows: rows })}
            />
          )}
        </div>

        {/* Chord diagrams — side position (desktop) */}
        {showChordDiagrams && chordDisplayPosition === 'side' && (
          <div className="hidden md:flex">
            <ChordDiagramPanel parsed={parsed} position="side" />
          </div>
        )}
      </div>
    </div>
  )
}
