import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, ListMusic, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useSetlistStore } from '../store/setlistStore'
import { useSongStore } from '../store/songStore'
import { extractStructure } from '../features/songs/lib/parser'

// Maps section label to a short abbreviation for display
function abbreviateLabel(lbl: string): string {
  const u = lbl.toUpperCase()
  if (u.startsWith('VERSE') || u.startsWith('КУПЛЕТ') || u.startsWith('POSM')) return 'V'
  if (u.startsWith('CHORUS') || u.startsWith('ПРИПЕВ') || u.startsWith('REF')) return 'C'
  if (u.startsWith('BRIDGE') || u.startsWith('МОСТ')) return 'B'
  if (u.startsWith('INTRO')) return 'I'
  if (u.startsWith('OUTRO')) return 'O'
  if (u.startsWith('PRE')) return 'P'
  if (u.startsWith('TAG')) return 'T'
  if (u.startsWith('SOLO')) return 'S'
  return lbl.slice(0, 1).toUpperCase()
}

// Color per section type
function sectionColor(abbr: string): string {
  switch (abbr) {
    case 'V': return 'var(--color-info)'
    case 'C': return 'var(--color-accent)'
    case 'B': return 'var(--color-warning)'
    case 'I': return 'var(--color-chord)'
    case 'O': return 'var(--color-info)'
    case 'P': return 'var(--color-error)'
    default: return 'var(--color-text-tertiary)'
  }
}

export default function SetlistPage() {
  const { t } = useTranslation()
  const { setlists, deleteSetlist } = useSetlistStore()
  const { getSongById } = useSongStore()

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

                      // Extract song structure
                      const { labels } = extractStructure(song.structure ? song.structure + '\n' + song.content : song.content)
                      const structureChips = labels.map(abbreviateLabel)

                      return (
                        <Link
                          key={ss.id}
                          to={`/songs/${song.id}`}
                          className="flex items-start gap-3 px-4 py-2.5 transition-all hover:bg-white/5"
                          style={{ borderTop: idx > 0 ? '1px solid rgba(44,44,46,0.5)' : undefined }}
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
                                {structureChips.map((chip, i) => (
                                  <span
                                    key={i}
                                    className="text-xs px-1.5 py-0.5 rounded font-bold"
                                    style={{
                                      backgroundColor: sectionColor(chip) + '22',
                                      color: sectionColor(chip),
                                      fontSize: 10,
                                    }}
                                  >
                                    {chip}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 4 }} />
                        </Link>
                      )
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
