import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft, ChevronRight, Pencil, Trash2, ChevronDown, ChevronUp, Guitar, Piano, Music2, Drum,
  EyeOff, Eye, Download, MoreHorizontal, UserRound, Check, ListMusic,
} from 'lucide-react'
import { useSongStore } from '../store/songStore'
import { useSetlistStore } from '../store/setlistStore'
import { parseSong, extractStructure } from '../features/songs/lib/parser'
import { transposeSong, transposeKey } from '../features/songs/lib/transposer'
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
import { useChordLibraryStore } from '../store/chordLibraryStore'
import { useRoleCapabilities } from '../features/songs/lib/useRoleCapabilities'
import { generateId } from '../shared/lib/storage'
import { alpha, keyColor } from '../shared/lib/color'
import { useClickOutside } from '../shared/lib/useClickOutside'
import { sortedSetlistSongs, setlistSongPath } from '../shared/lib/setlistNav'
import type { Role } from '../store/settingsStore'
import type { ChordRow, Instrument } from '../features/songs/types'

const INSTRUMENT_ICONS: Record<Instrument['type'], React.ReactNode> = {
  guitar:   <Guitar size={14} strokeWidth={1.75} />,
  piano:    <Piano size={14} strokeWidth={1.75} />,
  keyboard: <Piano size={14} strokeWidth={1.75} />,
  bass:     <Guitar size={14} strokeWidth={1.75} />,
  ukulele:  <Music2 size={14} strokeWidth={1.75} />,
  drums:    <Drum size={14} strokeWidth={1.75} />,
  other:    <Music2 size={14} strokeWidth={1.75} />,
}

const BUILT_IN_ROLES: Role[] = ['musician', 'singer', 'congregation']

/** Re-mount the page per song/setlist position so transpose state never leaks between songs. */
export default function SongPageRoute() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  return <SongPage key={`${id}?${params.toString()}`} id={id!} params={params} />
}

function SongPage({ id, params }: { id: string; params: URLSearchParams }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const song = useSongStore((s) => s.songs.find((x) => x.id === id))
  const { deleteSong, updateSong } = useSongStore()
  const songs = useSongStore((s) => s.songs)
  const { tabs: libraryTabs } = useChordLibraryStore()
  const {
    role, setRole,
    instruments, selectedInstrument, setSelectedInstrument,
    chordDisplayPosition,
    roleLabels, customRoles,
  } = useSettingsStore()
  const capabilities = useRoleCapabilities()

  // Opened from a setlist? → use its transposition and offer prev / next
  const setlistId = params.get('setlist')
  const setlistIndex = Number(params.get('i') ?? -1)
  const setlist = useSetlistStore((s) => (setlistId ? s.setlists.find((sl) => sl.id === setlistId) : undefined))
  const setlistEntries = useMemo(() => (setlist ? sortedSetlistSongs(setlist) : []), [setlist])
  const setlistEntry = setlistEntries[setlistIndex]?.song_id === id ? setlistEntries[setlistIndex] : undefined

  const [steps, setSteps] = useState(setlistEntry?.transpose_steps ?? 0)
  const [capo, setCapo] = useState(setlistEntry?.capo_fret ?? 0)
  const [showInstrumentMenu, setShowInstrumentMenu] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [hideMainChords, setHideMainChords] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const roleMenuRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const instrMenuRef = useRef<HTMLDivElement>(null)
  const instrPopRef = useRef<HTMLDivElement>(null)
  useClickOutside(roleMenuRef, showRoleMenu, useCallback(() => setShowRoleMenu(false), []))
  useClickOutside(moreMenuRef, showMore, useCallback(() => setShowMore(false), []))
  useClickOutside([instrMenuRef, instrPopRef], showInstrumentMenu, useCallback(() => setShowInstrumentMenu(false), []))

  const soundingKey = song?.original_key ? transposeKey(song.original_key, steps) : undefined
  // With a capo, guitarists read the chord *shapes* — show those instead of sounding chords
  const shapeKey = soundingKey && capo > 0 ? transposeKey(soundingKey, -capo) : undefined

  const displayedContent = useMemo(() => {
    if (!song) return ''
    const sounding = transposeSong(song.content, steps, song.original_key)
    return capo > 0 ? transposeSong(sounding, -capo, soundingKey) : sounding
  }, [song, steps, capo, soundingKey])

  const parsed = useMemo(() => parseSong(displayedContent), [displayedContent])

  const { labels: structureLabels, pattern: structurePattern } = useMemo(
    () => (song ? extractStructure(song.content) : { labels: [], pattern: '' }),
    [song]
  )

  const goBack = useCallback(() => {
    // Opened directly (no in-app history) → go to a sensible parent instead of leaving the app
    if (location.key === 'default') navigate(setlistId ? '/setlists' : '/library')
    else navigate(-1)
  }, [location.key, navigate, setlistId])

  // Keyboard shortcuts: ←/→ transpose, Esc back (only when nothing is open)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowRight') { e.preventDefault(); setSteps((s) => s + 1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setSteps((s) => s - 1) }
      else if (e.key === 'Escape' && !showExport && !showMore && !showRoleMenu && !showInstrumentMenu) goBack()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goBack, showExport, showMore, showRoleMenu, showInstrumentMenu])

  // Migrate legacy song.tabIds → ChordRow entries with tabId
  useEffect(() => {
    if (!song?.tabIds?.length) return
    const tabRows: ChordRow[] = song.tabIds.map((tabId) => ({
      id: generateId(),
      label: libraryTabs.find((t) => t.id === tabId)?.name ?? 'Tab',
      tabId,
      chords: [],
      fromLibrary: true,
      visible: true,
    }))
    updateSong(song.id, {
      chordRows: [...(song.chordRows ?? []), ...tabRows],
      tabIds: [],
    })
  }, [song?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!song) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4 mt-16">
        <Music2 size={40} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
        <p style={{ color: 'var(--color-text-tertiary)' }}>{t('songNotFound')}</p>
        <Link to="/library" className="btn-primary">{t('backToLibrary')}</Link>
      </div>
    )
  }

  const allRoles: { id: string; label: string }[] = [
    ...BUILT_IN_ROLES.map((r) => ({ id: r, label: roleLabels[r] || t(r) })),
    ...customRoles.map((cr) => ({ id: cr.id, label: cr.name })),
  ]
  const roleLabel = allRoles.find((r) => r.id === role)?.label ?? String(role)

  const activeInstrument = instruments.find((i) => i.id === selectedInstrument)
  const showChordDiagrams = capabilities.showDiagrams && chordDisplayPosition !== 'none'
  const kc = keyColor(soundingKey ?? song.original_key)

  const prevEntry = setlistEntry ? setlistEntries[setlistIndex - 1] : undefined
  const nextEntry = setlistEntry ? setlistEntries[setlistIndex + 1] : undefined
  const titleOf = (songId: string) => songs.find((s) => s.id === songId)?.title ?? '—'

  const handleDelete = () => {
    setShowMore(false)
    if (confirm(t('confirmDelete'))) {
      deleteSong(song.id)
      navigate('/library', { replace: true })
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-2 py-2 border-b flex-shrink-0"
        style={{
          background: `linear-gradient(90deg, ${alpha(kc, 16)} 0%, var(--color-bg-secondary) 55%)`,
          borderColor: 'var(--color-border)',
        }}
      >
        <button onClick={goBack} className="flex items-center justify-center rounded-xl active:scale-95" style={{ color: kc, minWidth: 44, minHeight: 44 }} title={t('back')} aria-label={t('back')}>
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base truncate leading-tight">{song.title}</h1>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {soundingKey && (
              <span className="px-1.5 rounded-md font-bold" style={{ backgroundColor: kc, color: '#fff' }}>{soundingKey}</span>
            )}
            {shapeKey && <span style={{ color: 'var(--color-info)' }}>{t('playAs')} {shapeKey}</span>}
            {song.bpm ? <span>♩ {song.bpm}</span> : null}
            {setlist && (
              <span className="flex items-center gap-1 truncate" style={{ color: 'var(--sec-setlists)' }}>
                <ListMusic size={11} strokeWidth={2} />
                <span className="truncate">{setlist.title}</span>
              </span>
            )}
          </div>
        </div>

        {/* Role switcher */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setShowRoleMenu((p) => !p)}
            className="flex items-center gap-1 px-2.5 rounded-xl text-xs font-semibold active:scale-95"
            style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)', minHeight: 40, maxWidth: 130 }}
            title={`${t('role')}: ${roleLabel}`}
            aria-label={`${t('role')}: ${roleLabel}`}
            aria-expanded={showRoleMenu}
          >
            <UserRound size={14} strokeWidth={2} style={{ flexShrink: 0, color: 'var(--color-accent)' }} />
            <span className="truncate hidden sm:inline">{roleLabel}</span>
          </button>
          {showRoleMenu && (
            <div className="absolute right-0 top-12 rounded-xl shadow-xl z-30 overflow-hidden py-1" style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 170, border: '1px solid var(--color-border)' }}>
              {allRoles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setShowRoleMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover-bg text-left"
                  style={{ color: role === r.id ? 'var(--color-accent)' : 'var(--color-text-secondary)', fontWeight: role === r.id ? 600 : 400 }}
                >
                  <span className="flex-1">{r.label}</span>
                  {role === r.id && <Check size={14} strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <Link to={`/songs/${song.id}/edit`} className="btn-icon" style={{ minWidth: 40, minHeight: 40 }} title={t('edit')} aria-label={t('edit')}>
          <Pencil size={16} strokeWidth={1.75} />
        </Link>

        {/* More menu */}
        <div className="relative" ref={moreMenuRef}>
          <button onClick={() => setShowMore((p) => !p)} className="btn-icon" style={{ minWidth: 40, minHeight: 40 }} title={t('more')} aria-label={t('more')} aria-expanded={showMore}>
            <MoreHorizontal size={18} strokeWidth={2} />
          </button>
          {showMore && (
            <div className="absolute right-0 top-12 rounded-xl shadow-xl z-30 overflow-hidden py-1" style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 180, border: '1px solid var(--color-border)' }}>
              <button onClick={() => { setShowMore(false); setShowExport(true) }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover-bg text-left" style={{ color: 'var(--color-text-secondary)' }}>
                <Download size={15} strokeWidth={1.75} /> {t('downloadSong')}
              </button>
              <button onClick={handleDelete} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover-bg text-left" style={{ color: 'var(--color-error)' }}>
                <Trash2 size={15} strokeWidth={1.75} /> {t('delete')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Toolbar (always visible, scrolls sideways on small screens) ── */}
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-none flex-shrink-0 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        {capabilities.showChords && (
          <TransposeControls
            steps={steps}
            originalKey={song.original_key}
            capoFret={capo}
            onStepsChange={setSteps}
            onCapoChange={setCapo}
          />
        )}
        <span className="flex-1" />
        {song.bpm ? <Metronome bpm={song.bpm} /> : null}
        <FontSizeSlider />
        <AutoScroller scrollRef={scrollRef as React.RefObject<HTMLElement | null>} />
        {capabilities.showDiagrams && instruments.length > 0 && (
          <div className="relative flex-shrink-0" ref={instrMenuRef}>
            <button
              onClick={() => setShowInstrumentMenu((p) => !p)}
              className="flex items-center gap-1.5 px-3 rounded-xl text-xs font-medium"
              style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)', minHeight: 40 }}
              title={t('instrument')}
              aria-expanded={showInstrumentMenu}
            >
              {activeInstrument && <span style={{ color: 'var(--color-chord)' }}>{INSTRUMENT_ICONS[activeInstrument.type]}</span>}
              <span>{activeInstrument?.name ?? t('instrument')}</span>
              <ChevronDown size={12} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
      {/* Instrument menu is rendered outside the horizontally scrolling toolbar so it isn't clipped */}
      {showInstrumentMenu && (
        <div className="relative z-30" ref={instrPopRef}>
          <div className="absolute right-3 top-1 rounded-xl shadow-xl overflow-hidden py-1" style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 160, border: '1px solid var(--color-border)' }}>
            {instruments.map((inst) => (
              <button
                key={inst.id}
                onClick={() => { setSelectedInstrument(inst.id); setShowInstrumentMenu(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover-bg"
                style={{ color: selectedInstrument === inst.id ? 'var(--color-chord)' : 'var(--color-text-secondary)' }}
              >
                <span style={{ opacity: 0.8 }}>{INSTRUMENT_ICONS[inst.type]}</span>
                <span className="flex-1 text-left">{inst.name}</span>
                {selectedInstrument === inst.id && <Check size={14} strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {capo > 0 && capabilities.showChords && (
        <div className="px-4 py-1.5 text-xs font-medium flex-shrink-0" style={{ backgroundColor: 'var(--color-info-dim)', color: 'var(--color-info)' }}>
          {t('capoShapesHint', { fret: capo })}
        </div>
      )}

      {/* Chord diagrams — top position (also used on mobile when 'side' is selected) */}
      {showChordDiagrams && (chordDisplayPosition === 'top' || chordDisplayPosition === 'side') && (
        <div className={`flex-shrink-0${chordDisplayPosition === 'side' ? ' md:hidden' : ''}`}>
          <div className="flex items-center">
            <div className="flex-1 overflow-hidden">
              {!hideMainChords && <ChordDiagramPanel parsed={parsed} position="top" />}
            </div>
            <button
              onClick={() => setHideMainChords((p) => !p)}
              className="flex items-center justify-center px-2 flex-shrink-0"
              style={{ color: 'var(--color-text-muted)', minHeight: 36, minWidth: 36 }}
              title={t('showDiagrams')}
              aria-pressed={!hideMainChords}
            >
              {hideMainChords ? <Eye size={15} strokeWidth={2} /> : <EyeOff size={15} strokeWidth={2} />}
            </button>
          </div>
        </div>
      )}

      {/* Chord rows */}
      {capabilities.showDiagrams && (
        <ChordRowsPanel
          chordRows={song.chordRows ?? []}
          onChange={(rows) => updateSong(song.id, { chordRows: rows })}
        />
      )}

      {/* ABAC structure bar */}
      {capabilities.showCues && (structureLabels.length > 0 || song.structure) && (
        <SongStructure labels={structureLabels} pattern={structurePattern} manualStructure={song.structure} />
      )}

      {/* Main area: content + optional side chord panel */}
      <div className="flex flex-1 min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-4xl">
            <SongViewer parsed={parsed} />
          </div>
          {capabilities.showChords && (
            <BarProgressions
              progressions={song.barProgressions ?? []}
              onChange={(progs) => updateSong(song.id, { barProgressions: progs })}
            />
          )}
          {capabilities.showDiagrams && (
            <ChordRowsPanel
              placement="bottom"
              chordRows={song.chordRows ?? []}
              onChange={(rows) => updateSong(song.id, { chordRows: rows })}
            />
          )}
          <MusicianComment
            value={song.musicianComment ?? ''}
            onChange={(v) => updateSong(song.id, { musicianComment: v })}
          />
        </div>

        {showChordDiagrams && chordDisplayPosition === 'side' && (
          <div className="hidden md:flex">
            <ChordDiagramPanel parsed={parsed} position="side" />
          </div>
        )}
      </div>

      {/* ── Setlist prev / next ── */}
      {setlist && setlistEntry && (
        <div className="flex items-stretch gap-2 px-3 py-2 border-t flex-shrink-0" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
          <SetlistNavButton
            to={prevEntry ? setlistSongPath(setlist.id, setlistIndex - 1, prevEntry) : undefined}
            label={t('prevSong')}
            title={prevEntry ? titleOf(prevEntry.song_id) : ''}
            dir="prev"
          />
          <div className="flex flex-col items-center justify-center px-2 text-xs font-semibold" style={{ color: 'var(--sec-setlists)' }}>
            {t('songOfTotal', { current: setlistIndex + 1, total: setlistEntries.length })}
          </div>
          <SetlistNavButton
            to={nextEntry ? setlistSongPath(setlist.id, setlistIndex + 1, nextEntry) : undefined}
            label={t('nextSong')}
            title={nextEntry ? titleOf(nextEntry.song_id) : ''}
            dir="next"
          />
        </div>
      )}

      {showExport && <SongExportModal song={song} onClose={() => setShowExport(false)} />}
    </div>
  )
}

function SetlistNavButton({ to, label, title, dir }: { to?: string; label: string; title: string; dir: 'prev' | 'next' }) {
  const navigate = useNavigate()
  const inner = (
    <>
      {dir === 'prev' && <ChevronLeft size={20} strokeWidth={2.5} className="flex-shrink-0" />}
      <span className={`flex flex-col min-w-0 flex-1 ${dir === 'next' ? 'items-end text-right' : 'items-start text-left'}`}>
        <span className="text-[10px] uppercase tracking-wide font-semibold opacity-80">{label}</span>
        <span className="text-sm font-semibold truncate max-w-full">{title}</span>
      </span>
      {dir === 'next' && <ChevronRight size={20} strokeWidth={2.5} className="flex-shrink-0" />}
    </>
  )
  if (!to) return <div className="flex-1" />
  return (
    <button
      // replace: prev/next shouldn't pile up history entries — Back returns to the setlist
      onClick={() => navigate(to, { replace: true })}
      className="flex-1 min-w-0 flex items-center gap-1 px-3 py-1.5 rounded-xl active:scale-[0.98] transition-transform"
      style={dir === 'next'
        ? { background: 'linear-gradient(135deg, var(--sec-setlists), var(--sec-setlists-2))', color: '#fff' }
        : { backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)' }}
    >
      {inner}
    </button>
  )
}

function MusicianComment({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation()
  const [localVal, setLocalVal] = useState(value)
  const [expanded, setExpanded] = useState(!!value)

  useEffect(() => {
    setLocalVal(value)
    if (value) setExpanded(true)
  }, [value])

  return (
    <div className="mx-4 mb-6 mt-2 max-w-3xl">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-2 text-xs font-semibold mb-2 px-2 py-1 rounded-lg"
        style={{ color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-dim)' }}
        aria-expanded={expanded}
      >
        {expanded ? <ChevronUp size={13} strokeWidth={2} /> : <ChevronDown size={13} strokeWidth={2} />}
        {t('myNotes')}
      </button>
      {expanded && (
        <textarea
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={() => { if (localVal !== value) onChange(localVal) }}
          rows={3}
          placeholder={t('myNotesPlaceholder')}
          className="w-full rounded-xl px-3 py-2.5 text-sm resize-y outline-none"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-warning-border)',
            color: 'var(--color-text-secondary)',
          }}
        />
      )}
    </div>
  )
}
