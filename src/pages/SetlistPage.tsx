import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, ListMusic, Pencil, Trash2, ChevronRight, Download, X } from 'lucide-react'
import { useSetlistStore } from '../store/setlistStore'
import { useSongStore } from '../store/songStore'
import { extractStructure } from '../features/songs/lib/parser'
import { songToText, setlistToText, downloadTextFile, openPrintableHTML } from '../shared/lib/exportUtils'
import type { Setlist } from '../store/setlistStore'

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

function DownloadMenu({ setlist, onClose }: { setlist: Setlist; onClose: () => void }) {
  const { songs } = useSongStore()

  const handleDownloadAll = async () => {
    const text = setlistToText(setlist, songs)
    await downloadTextFile(text, `${setlist.title}.txt`)
    onClose()
  }

  const handleOpenHTML = () => {
    const text = setlistToText(setlist, songs)
    openPrintableHTML(setlist.title, text)
    onClose()
  }

  return (
    <div
      className="absolute right-0 top-10 z-50 rounded-2xl overflow-hidden shadow-lg"
      style={{ backgroundColor: 'var(--color-card-raised)', border: '1px solid var(--color-border)', minWidth: 200 }}
    >
      <button
        onClick={handleDownloadAll}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-all hover-bg"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <Download size={14} strokeWidth={1.5} />
        Download as text (.txt)
      </button>
      <button
        onClick={handleOpenHTML}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-all hover-bg"
        style={{ borderTop: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
      >
        <Download size={14} strokeWidth={1.5} />
        Open printable page
      </button>
    </div>
  )
}

export default function SetlistPage() {
  const { t } = useTranslation()
  const { setlists, deleteSetlist } = useSetlistStore()
  const { getSongById } = useSongStore()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

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
                    <DownloadMenu setlist={sl} onClose={() => setOpenMenuId(null)} />
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

                      // Extract song structure using parser's A/B/C/D pattern
                      const { pattern } = extractStructure(song.structure ? song.structure + '\n' + song.content : song.content)
                      const structureChips = collapseRepeats(pattern ? pattern.split(' ') : [])

                      return (
                        <div
                          key={ss.id}
                          className="flex items-start gap-3 px-4 py-2.5 transition-all hover-bg"
                          style={{ borderTop: idx > 0 ? '1px solid rgba(44,44,46,0.5)' : undefined }}
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
                          {/* Per-song download */}
                          <button
                            onClick={async () => {
                              const text = songToText(song)
                              await downloadTextFile(text, `${song.title}.txt`)
                            }}
                            className="flex-shrink-0 p-1.5 rounded-lg transition-all hover-bg"
                            style={{ color: 'var(--color-text-muted)' }}
                            title="Download song"
                          >
                            <Download size={13} strokeWidth={1.5} />
                          </button>
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
    </div>
  )
}
