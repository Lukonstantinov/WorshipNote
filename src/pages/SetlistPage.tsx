import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, ListMusic, Pencil, Trash2, ChevronRight, Download, X, ChevronDown, ChevronUp, Play, CalendarDays } from 'lucide-react'
import { PageHeader, sectionButtonStyle } from '../shared/components/PageHeader'
import { keyColor } from '../shared/lib/color'
import { transposeKey } from '../features/songs/lib/transposer'
import { sortedSetlistSongs, setlistSongPath } from '../shared/lib/setlistNav'
import { useSetlistStore } from '../store/setlistStore'
import { useSongStore } from '../store/songStore'
import { useFolderStore } from '../store/folderStore'
import { useChordLibraryStore } from '../store/chordLibraryStore'
import { extractStructure } from '../features/songs/lib/parser'
import { setlistToText, downloadTextFile, downloadHTMLFile, openSetlistHTML, buildSetlistHTMLString } from '../shared/lib/exportUtils'
import type { SetlistExportOptions } from '../shared/lib/exportUtils'
import { exportSongsAsJSON } from '../features/songs/lib/exportImport'
import { downloadFile } from '../features/songs/lib/exportImport'
import { SongExportModal } from '../features/songs/components/SongExportModal'
import { TabViewer } from '../features/songs/components/TabViewer'
import type { Setlist } from '../store/setlistStore'
import type { Song } from '../features/songs/types'
import { alpha } from '../shared/lib/color'

// Colour by section position index (A, B, C, D, E, F…)
const POSITION_COLORS = [
  'var(--color-accent)',
  'var(--color-info)',
  'var(--color-warning)',
  'var(--color-chord)',
  'var(--color-error)',
  '#bf5af2',
  '#ff6482',
  '#64d2ff',
  '#ffd60a',
  '#5ac8fa',
]

function positionColor(letter: string): string {
  const idx = letter.charCodeAt(0) - 65 // 'A'=0, 'B'=1, …
  return POSITION_COLORS[idx] ?? 'var(--color-text-tertiary)'
}

function collapseRepeats(chips: string[]): { label: string; count: number }[] {
  const result: { label: string; count: number }[] = []
  for (const chip of chips) {
    if (result.length && result[result.length - 1].label === chip) {
      result[result.length - 1].count++
    } else {
      result.push({ label: chip, count: 1 })
    }
  }
  return result
}

type ExportLevel = 'structure' | 'chords' | 'full'

const EXPORT_LEVEL_OPTIONS: { value: ExportLevel; label: string; desc: string }[] = [
  { value: 'structure', label: 'levelStructure', desc: 'levelStructureDesc' },
  { value: 'chords', label: 'levelChords', desc: 'levelChordsDesc' },
  { value: 'full', label: 'levelFull', desc: 'levelFullDesc' },
]

function SetlistExportModal({ setlist, onClose }: { setlist: Setlist; onClose: () => void }) {
  const { t } = useTranslation()
  const { songs } = useSongStore()
  const { folders } = useFolderStore()
  const { tabs } = useChordLibraryStore()
  const [level, setLevel] = useState<ExportLevel>('structure')
  const [colored, setColored] = useState(true)

  const exportOpts: SetlistExportOptions = {
    includeChords: level !== 'structure',
    includeExtras: level === 'full',
    colored,
  }

  const handleTXT = async () => {
    const text = setlistToText(setlist, songs, exportOpts.includeChords, exportOpts.includeExtras, tabs)
    await downloadTextFile(text, `${setlist.title}.txt`)
    onClose()
  }

  const handleDownloadHTML = async () => {
    const html = buildSetlistHTMLString(setlist, songs, exportOpts, tabs)
    await downloadHTMLFile(html, `${setlist.title}.html`)
    onClose()
  }

  const handleViewHTML = async () => {
    await openSetlistHTML(setlist, songs, exportOpts, tabs)
    onClose()
  }

  const handleDownloadJSON = async () => {
    const setlistSongIds = new Set(setlist.songs.map((ss) => ss.song_id))
    const setlistSongs = songs.filter((s) => setlistSongIds.has(s.id))
    const json = exportSongsAsJSON(setlistSongs, folders)
    const dateStr = new Date().toISOString().slice(0, 10)
    await downloadFile(json, `${setlist.title}-songs-${dateStr}.json`, 'application/json')
    onClose()
  }

  const checkboxStyle: React.CSSProperties = {
    width: 18, height: 18, accentColor: 'var(--color-accent)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--color-overlay)' }}>
      <div
        className="rounded-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-semibold text-sm">{t('export')}</h3>
          <button onClick={onClose} style={{ color: 'var(--color-text-tertiary)' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Export level selector */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('contentLevel')}
          </p>
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            {EXPORT_LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLevel(opt.value)}
                className="flex-1 flex flex-col items-center py-2 px-1 text-xs font-medium transition-all"
                style={{
                  backgroundColor: level === opt.value ? 'var(--color-accent)' : 'var(--color-card-raised)',
                  color: level === opt.value ? '#fff' : 'var(--color-text-tertiary)',
                  borderRight: opt.value !== 'full' ? '1px solid var(--color-border)' : undefined,
                }}
              >
                <span className="font-semibold">{t(opt.label)}</span>
                <span className="text-[10px] opacity-70">{t(opt.desc)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color toggle */}
        <div className="px-4 py-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={colored}
              onChange={() => setColored((v) => !v)}
              style={checkboxStyle}
            />
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{t('exportColored')}</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 px-4 pb-4 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={handleViewHTML}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
          >
            {t('viewHtml')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleTXT}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)' }}
            >
              <Download size={14} strokeWidth={2} />
              TXT
            </button>
            <button
              onClick={handleDownloadHTML}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)' }}
            >
              <Download size={14} strokeWidth={2} />
              HTML
            </button>
          </div>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border-subtle)', marginTop: 2 }}
            title={t('exportJsonHint')}
          >
            <Download size={14} strokeWidth={2} />
            JSON ({t('songsCount', { count: setlist.songs.length })})
          </button>
        </div>
      </div>
    </div>
  )
}

function SongTabRows({ song }: { song: Song }) {
  const { t } = useTranslation()
  const { tabs } = useChordLibraryStore()
  const [expanded, setExpanded] = useState(false)

  const tabRows = (song.chordRows ?? []).filter((r) => r.tabId && r.visible !== false)
  if (tabRows.length === 0) return null

  return (
    <div style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-2 w-full px-4 py-1.5 text-left transition-all"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {expanded ? <ChevronUp size={11} strokeWidth={2} /> : <ChevronDown size={11} strokeWidth={2} />}
        <span className="text-xs">{t('tabsCount', { count: tabRows.length })}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {tabRows.map((row) => {
            const tab = tabs.find((tb) => tb.id === row.tabId)
            if (!tab) return null
            return <TabViewer key={row.id} tab={tab} />
          })}
        </div>
      )}
    </div>
  )
}

export default function SetlistPage() {
  const { t } = useTranslation()
  const { setlists, deleteSetlist } = useSetlistStore()
  const { getSongById } = useSongStore()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [exportSong, setExportSong] = useState<Song | null>(null)

  return (
    <div className="p-4 pb-8">
      <PageHeader
        title={t('setlists')}
        subtitle={t('setlistsSubtitle')}
        Icon={ListMusic}
        color="setlists"
        actions={
          <Link to="/setlists/new" className="btn-primary" style={sectionButtonStyle('setlists')} title={t('newSetlist')}>
            <Plus size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">{t('newSetlist')}</span>
          </Link>
        }
      />

      {setlists.length === 0 ? (
        <div className="text-center mt-16 flex flex-col items-center gap-3">
          <span className="flex items-center justify-center rounded-3xl" style={{ width: 72, height: 72, background: 'var(--color-info-dim)', color: 'var(--sec-setlists)' }}>
            <ListMusic size={34} strokeWidth={1.5} />
          </span>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>{t('noSetlists')}</p>
          <Link to="/setlists/new" className="btn-primary" style={sectionButtonStyle('setlists')}>
            <Plus size={18} strokeWidth={2.5} />
            {t('newSetlist')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {setlists.map((sl) => (
            <div key={sl.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border-subtle)' }}>
              {/* Setlist header */}
              <div className="px-3 pt-3 pb-2" style={{ background: 'linear-gradient(90deg, var(--color-info-dim), transparent 70%)' }}>
                <div className="flex items-center gap-3">
                  <DateBadge date={sl.service_date} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold leading-snug">{sl.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                      {t('songsCount', { count: sl.songs.length })}
                    </p>
                  </div>
                  {sl.songs.length > 0 && (
                    <Link
                      to={setlistSongPath(sl.id, 0, sortedSetlistSongs(sl)[0])}
                      className="btn-primary px-4"
                      style={sectionButtonStyle('setlists')}
                      title={t('startSetlist')}
                    >
                      <Play size={15} strokeWidth={2.5} fill="currentColor" />
                      {t('startSetlist')}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <p className="flex-1 min-w-0 text-xs leading-relaxed" style={{ color: 'var(--color-text-tertiary)', whiteSpace: 'pre-wrap' }}>
                    {sl.notes}
                  </p>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === sl.id ? null : sl.id)}
                    className="btn-icon"
                    style={{ minWidth: 36, minHeight: 36 }}
                    title={t('export')}
                    aria-label={t('export')}
                  >
                    <Download size={15} strokeWidth={1.75} />
                  </button>
                  {openMenuId === sl.id && (
                    <SetlistExportModal setlist={sl} onClose={() => setOpenMenuId(null)} />
                  )}
                  <Link to={`/setlists/${sl.id}/edit`} className="btn-icon" style={{ minWidth: 36, minHeight: 36 }} title={t('edit')} aria-label={t('edit')}>
                    <Pencil size={15} strokeWidth={1.75} />
                  </Link>
                  <button
                    onClick={() => { if (confirm(t('confirmDelete'))) deleteSetlist(sl.id) }}
                    className="btn-icon"
                    style={{ minWidth: 36, minHeight: 36, color: 'var(--color-error)' }}
                    title={t('delete')}
                    aria-label={t('delete')}
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {/* Song list */}
              {sl.songs.length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                  {sortedSetlistSongs(sl)
                    .map((ss, idx) => {
                      const song = getSongById(ss.song_id)
                      if (!song) return null

                      // Use manual structure if set, otherwise extract from content
                      let structureParts: string[] = []
                      if (song.structure) {
                        const hasSpaces = /\s/.test(song.structure)
                        structureParts = hasSpaces
                          ? song.structure.split(/\s+/).filter(Boolean)
                          : song.structure.split('').filter((c) => /[A-Za-z]/.test(c))
                      } else {
                        const { pattern } = extractStructure(song.content)
                        if (pattern) structureParts = pattern.split(' ')
                      }
                      const structureChips = collapseRepeats(structureParts)

                      return (
                        <div
                          key={ss.id}
                          style={{ borderTop: idx > 0 ? '1px solid var(--color-border-subtle)' : undefined }}
                        >
                        <div
                          className="flex items-start gap-3 px-4 py-2.5 transition-all hover-bg"
                        >
                          <Link
                            to={setlistSongPath(sl.id, idx, ss)}
                            className="flex items-start gap-3 flex-1 min-w-0"
                          >
                            <span
                              className="text-xs font-bold w-5 text-right flex-shrink-0 mt-1"
                              style={{ color: 'var(--sec-setlists)' }}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {ss.vocalist && (
                                  <span
                                    className="font-semibold"
                                    style={{ color: ss.vocalColor ?? 'var(--color-info)', fontSize: 11 }}
                                  >
                                    ({ss.vocalist})
                                  </span>
                                )}
                                <span className="text-sm">{song.title}</span>
                                {song.original_key && (() => {
                                  const k = transposeKey(song.original_key, ss.transpose_steps)
                                  return (
                                    <span
                                      className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                                      style={{ backgroundColor: keyColor(k), color: '#fff' }}
                                    >
                                      {k}
                                    </span>
                                  )
                                })()}
                              </div>
                              {/* Song structure chips */}
                              {structureChips.length > 0 && (
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  {structureChips.map(({ label, count }, i) => {
                                    const color = positionColor(label)
                                    return (
                                      <span
                                        key={i}
                                        className="text-xs px-1.5 py-0.5 rounded font-bold"
                                        style={{
                                          backgroundColor: alpha(color, 13),
                                          color,
                                          fontSize: 10,
                                        }}
                                      >
                                        {count > 1 ? `${label}×${count}` : label}
                                      </span>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                            <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 4 }} />
                          </Link>
                          {/* Per-song export */}
                          <button
                            onClick={() => setExportSong(song)}
                            className="flex-shrink-0 p-1.5 rounded-lg transition-all hover-bg"
                            style={{ color: 'var(--color-text-muted)' }}
                            title={t('downloadSong')}
                          >
                            <Download size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                        <SongTabRows song={song} />
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Close dropdown on outside click */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Song export modal */}
      {exportSong && <SongExportModal song={exportSong} onClose={() => setExportSong(null)} />}
    </div>
  )
}

function DateBadge({ date }: { date?: string }) {
  const { i18n } = useTranslation()
  const d = date ? new Date(date + 'T00:00:00') : null
  const valid = d && !isNaN(d.getTime())
  return (
    <span
      className="flex flex-col items-center justify-center rounded-2xl flex-shrink-0 leading-none"
      style={{ width: 46, height: 46, background: 'linear-gradient(135deg, var(--sec-setlists), var(--sec-setlists-2))', color: '#fff' }}
    >
      {valid ? (
        <>
          <span className="text-[10px] font-semibold uppercase opacity-90">{d!.toLocaleDateString(i18n.language, { month: 'short' }).replace('.', '')}</span>
          <span className="text-lg font-bold">{d!.getDate()}</span>
        </>
      ) : (
        <CalendarDays size={20} strokeWidth={2} />
      )}
    </span>
  )
}
