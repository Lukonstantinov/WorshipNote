import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Pencil, Trash2, ChevronDown, Guitar, Piano, Music2, Drum, ChevronUp, EyeOff, Eye, Download } from 'lucide-react'
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
import { BarProgressions } from '../features/songs/components/BarProgressions'
import { SongExportModal } from '../features/songs/components/SongExportModal'
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
  const [showControls, setShowControls] = useState(false)
  const [hideMainChords, setHideMainChords] = useState(false)
  const [showExport, setShowExport] = useState(false)
  // Show role selector overlay on first open
  const [showRoleSelector, setShowRoleSelector] = useState(true)

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
      if (showRoleSelector) { setShowRoleSelector(false); return }
      navigate(-1)
    }
  }, [navigate, showRoleSelector])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!song) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: 'var(--color-text-tertiary)' }}>Song not found</p>
        <Link to="/library" className="mt-4 block" style={{ color: 'var(--color-accent)' }}>← Library</Link>
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

  // Role selector overlay
  if (showRoleSelector) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0"
          style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ color: 'var(--color-accent)', minWidth: 44, minHeight: 44 }}
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base truncate leading-tight">{song.title}</h1>
            {song.original_key && (
              <p className="text-xs" style={{ color: 'var(--color-chord)' }}>
                {song.original_key}{song.bpm ? ` · ${song.bpm} BPM` : ''}
              </p>
            )}
          </div>
          <Link
            to={`/songs/${song.id}/edit`}
            className="flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 44, minHeight: 44 }}
            title={t('edit')}
          >
            <Pencil size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <button
            onClick={() => {
              if (confirm(t('confirmDelete'))) {
                deleteSong(song.id)
                navigate('/library')
              }
            }}
            className="flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 44, minHeight: 44 }}
            title={t('delete')}
          >
            <Trash2 size={16} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
          </button>
        </div>

        {/* Role selector */}
        <div className="flex flex-col items-center justify-center flex-1 px-6 gap-4">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('selectRole') || 'Select your role'}
          </p>
          {allRoles.map((r) => (
            <button
              key={r.id}
              onClick={() => { setRole(r.id); setShowRoleSelector(false) }}
              className="w-full max-w-xs py-4 rounded-2xl text-lg font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: role === r.id ? 'var(--color-accent)' : 'var(--color-card)',
                color: role === r.id ? '#fff' : 'var(--color-text-secondary)',
                border: `1px solid ${role === r.id ? 'var(--color-accent)' : 'var(--color-card-raised)'}`,
              }}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={() => setShowRoleSelector(false)}
            className="mt-2 py-3 px-8 rounded-2xl text-base font-medium transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)' }}
          >
            {t('continue') || 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0"
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ color: 'var(--color-accent)', minWidth: 44, minHeight: 44 }}
          title="Back (Esc)"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-base truncate leading-tight">{song.title}</h1>
          {song.original_key && (
            <p className="text-xs" style={{ color: 'var(--color-chord)' }}>
              {song.original_key}{song.bpm ? ` · ${song.bpm} BPM` : ''}
            </p>
          )}
        </div>
        {/* Role badge — tap to change role */}
        <button
          onClick={() => setShowRoleSelector(true)}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)', minHeight: 44 }}
          title="Change role"
        >
          {allRoles.find((r) => r.id === role)?.label ?? role}
        </button>
        {/* Controls toggle */}
        <button
          onClick={() => setShowControls((p) => !p)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 44, minHeight: 44 }}
          title="Controls"
        >
          {showControls
            ? <ChevronUp size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
            : <ChevronDown size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
          }
        </button>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 44, minHeight: 44 }}
          title={t('downloadSong')}
        >
          <Download size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <Link
          to={`/songs/${song.id}/edit`}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 44, minHeight: 44 }}
          title={t('edit')}
        >
          <Pencil size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <button
          onClick={() => {
            if (confirm(t('confirmDelete'))) {
              deleteSong(song.id)
              navigate('/library')
            }
          }}
          className="flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 44, minHeight: 44 }}
          title={t('delete')}
        >
          <Trash2 size={16} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
        </button>
      </div>

      {/* Collapsible controls bar */}
      {showControls && (
        <div
          className="px-3 py-2 space-y-2 flex-shrink-0 border-b"
          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border-subtle)' }}
        >
          <TransposeControls
            steps={steps}
            originalKey={song.original_key}
            capoFret={capo}
            onStepsChange={setSteps}
            onCapoChange={setCapo}
          />
          <div className="flex items-center gap-2 flex-wrap">
            {/* Instrument picker (when diagrams are shown) */}
            {capabilities.showDiagrams && instruments.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowInstrumentMenu((p) => !p)}
                  className="flex items-center gap-1.5 px-3 rounded-xl text-xs font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    color: 'var(--color-text-secondary)',
                    minHeight: 44,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {activeInstrument && <span style={{ opacity: 0.7 }}>{INSTRUMENT_ICONS[activeInstrument.type]}</span>}
                  <span>{activeInstrument?.name ?? t('instrument')}</span>
                  <ChevronDown size={12} strokeWidth={2} />
                </button>
                {showInstrumentMenu && (
                  <div
                    className="absolute top-12 left-0 rounded-xl shadow-xl z-20 overflow-hidden"
                    style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 140 }}
                  >
                    {instruments.map((inst) => (
                      <button
                        key={inst.id}
                        onClick={() => { setSelectedInstrument(inst.id); setShowInstrumentMenu(false) }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-all hover-bg"
                        style={{ color: selectedInstrument === inst.id ? 'var(--color-chord)' : 'var(--color-text-secondary)' }}
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
      )}

      {/* Chord diagrams — top position (with hide toggle) */}
      {showChordDiagrams && chordDisplayPosition === 'top' && (
        <div className="flex-shrink-0">
          <div className="flex items-center">
            <div className="flex-1 overflow-hidden">
              {!hideMainChords && <ChordDiagramPanel parsed={parsed} position="top" />}
            </div>
            <button
              onClick={() => setHideMainChords((p) => !p)}
              className="flex items-center justify-center px-2 flex-shrink-0"
              style={{ color: 'var(--color-text-muted)', minHeight: 36 }}
              title={hideMainChords ? t('showDiagrams') : t('showDiagrams')}
            >
              {hideMainChords ? <Eye size={14} strokeWidth={2} /> : <EyeOff size={14} strokeWidth={2} />}
            </button>
          </div>
        </div>
      )}

      {/* Chord rows — right under chords, above structure */}
      {capabilities.showDiagrams && (
        <ChordRowsPanel
          songId={song.id}
          chordRows={song.chordRows ?? []}
          onChange={(rows) => updateSong(song.id, { chordRows: rows })}
        />
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
          {/* Bar progressions */}
          {capabilities.showChords && (
            <BarProgressions
              progressions={song.barProgressions ?? []}
              onChange={(progs) => updateSong(song.id, { barProgressions: progs })}
            />
          )}
          {/* Musician comment */}
          <MusicianComment
            value={song.musicianComment ?? ''}
            onChange={(v) => updateSong(song.id, { musicianComment: v })}
          />
        </div>

        {/* Chord diagrams — side position (desktop) */}
        {showChordDiagrams && chordDisplayPosition === 'side' && (
          <div className="hidden md:flex">
            <ChordDiagramPanel parsed={parsed} position="side" />
          </div>
        )}
      </div>

      {/* Export modal */}
      {showExport && <SongExportModal song={song} onClose={() => setShowExport(false)} />}
    </div>
  )
}

// Inline musician comment component
function MusicianComment({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [localVal, setLocalVal] = useState(value)
  const [expanded, setExpanded] = useState(!!value)

  useEffect(() => {
    setLocalVal(value)
    if (value) setExpanded(true)
  }, [value])

  return (
    <div className="mx-4 mb-6 mt-2">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-2 text-xs font-medium mb-2 transition-all"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {expanded ? <ChevronUp size={13} strokeWidth={2} /> : <ChevronDown size={13} strokeWidth={2} />}
        My notes
      </button>
      {expanded && (
        <textarea
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={() => onChange(localVal)}
          rows={3}
          placeholder="Write your notes here…"
          className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        />
      )}
    </div>
  )
}
