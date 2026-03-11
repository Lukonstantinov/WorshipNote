import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, ListMusic, Pencil, Trash2, ChevronRight, Download, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useSetlistStore } from '../store/setlistStore'
import { useSongStore } from '../store/songStore'
import { useChordLibraryStore } from '../store/chordLibraryStore'
import { extractStructure } from '../features/songs/lib/parser'
import { setlistToText, downloadTextFile, openSetlistHTML } from '../shared/lib/exportUtils'
import type { SetlistExportOptions } from '../shared/lib/exportUtils'
import { SongExportModal } from '../features/songs/components/SongExportModal'
import { TabViewer } from '../features/songs/components/TabViewer'
import type { Setlist } from '../store/setlistStore'
import type { Song } from '../features/songs/types'

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

function SetlistExportModal({ setlist, onClose }: { setlist: Setlist; onClose: () => void }) {
  const { t } = useTranslation()
  const { songs } = useSongStore()
  const [includeChords, setIncludeChords] = useState(false)
  const [colored, setColored] = useState(true)

  const exportOpts: SetlistExportOptions = { includeChords, colored }

  const handleTXT = async () => {
    const text = setlistToText(setlist, songs, includeChords)
    await downloadTextFile(text, `${setlist.title}.txt`)
    onClose()
  }

  const handleHTML = async () => {
    await openSetlistHTML(setlist, songs, exportOpts)
    onClose()
  }

  const checkboxStyle: React.CSSProperties = {
    width: 18, height: 18, accentColor: 'var(--color-accent)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
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

        {/* Options */}
        <div className="px-4 py-3 space-y-3">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('exportIncludeStructure')}: ✓ &nbsp; {t('exportIncludeVocalist')}: ✓
          </p>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeChords}
              onChange={() => setIncludeChords((v) => !v)}
              style={checkboxStyle}
            />
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{t('exportIncludeChords')}</span>
          </label>

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
        <div className="flex gap-2 px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={handleTXT}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
          >
            <Download size={14} strokeWidth={2} />
            TXT
          </button>
          <button
            onClick={handleHTML}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)' }}
          >
            <Download size={14} strokeWidth={2} />
            HTML
          </button>
        </div>
      </div>
    </div>
  )
}

function SongTabRows({ song }: { song: Song }) {
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
        <span className="text-xs">{tabRows.length === 1 ? '1 tab' : `${tabRows.length} tabs`}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {tabRows.map((row) => {
            const tab = tabs.find((t) => t.id === row.tabId)
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
    <div className="p-4 pb-28 md:pb-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold tracking-tight">{t('setlists')}</h2>
        <Link
          to="/setlists/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-primary)', minHeight: 44 }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {t('newSetlist')}
        </Link>
      </div>

      {setlists.length === 0 ? (
        <div className="text-center mt-20">
          <ListMusic size={40} strokeWidth={1} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 15 }}>{t('noSetlists')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {setlists.map((sl) => (
            <div key={sl.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
              {/* Setlist header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{sl.title}</h3>
                  {sl.service_date && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                      {sl.service_date}
                    </p>
                  )}
                  {sl.notes && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-tertiary)', whiteSpace: 'pre-wrap' }}>
                      {sl.notes}
                    </p>
                  )}
                </div>

                {/* Download button */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === sl.id ? null : sl.id)}
                    className="flex items-center justify-center rounded-xl transition-all active:scale-95"
                    style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 40, minHeight: 40 }}
                    title="Download"
                  >
                    {openMenuId === sl.id
                      ? <X size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
                      : <Download size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
                    }
                  </button>
                  {openMenuId === sl.id && (
                    <SetlistExportModal setlist={sl} onClose={() => setOpenMenuId(null)} />
                  )}
                </div>

                <Link
                  to={`/setlists/${sl.id}/edit`}
                  className="flex items-center justify-center rounded-xl transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 40, minHeight: 40 }}
                  title={t('edit')}
                >
                  <Pencil size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
                </Link>
                <button
                  onClick={() => {
                    if (confirm(t('confirmDelete'))) deleteSetlist(sl.id)
                  }}
                  className="flex items-center justify-center rounded-xl transition-all active:scale-95"
                  style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 40, minHeight: 40 }}
                  title={t('delete')}
                >
                  <Trash2 size={15} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
                </button>
              </div>

              {/* Song list */}
              {sl.songs.length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                  {sl.songs
                    .slice()
                    .sort((a, b) => a.sort_order - b.sort_order)
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
                          style={{ borderTop: idx > 0 ? '1px solid rgba(44,44,46,0.5)' : undefined }}
                        >
                        <div
                          className="flex items-start gap-3 px-4 py-2.5 transition-all hover-bg"
                        >
                          <Link
                            to={`/songs/${song.id}`}
                            className="flex items-start gap-3 flex-1 min-w-0"
                          >
                            <span
                              className="text-xs font-semibold w-5 text-right flex-shrink-0 mt-1"
                              style={{ color: 'rgba(235,235,245,0.25)' }}
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
                                {song.original_key && (
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                    style={{ backgroundColor: 'rgba(50,215,75,0.1)', color: 'var(--color-chord)' }}
                                  >
                                    {song.original_key}
                                  </span>
                                )}
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
                                          backgroundColor: color + '22',
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
                            title="Download song"
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
