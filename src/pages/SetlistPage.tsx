import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, ListMusic, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useSetlistStore } from '../store/setlistStore'
import { useSongStore } from '../store/songStore'

export default function SetlistPage() {
  const { t } = useTranslation()
  const { setlists, deleteSetlist } = useSetlistStore()
  const { getSongById } = useSongStore()

  return (
    <div className="p-4 pb-28 md:pb-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-white tracking-tight">{t('setlists')}</h2>
        <Link
          to="/setlists/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
          style={{ backgroundColor: '#bf5af2', color: '#fff', minHeight: 44 }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {t('newSetlist')}
        </Link>
      </div>

      {setlists.length === 0 ? (
        <div className="text-center mt-20">
          <ListMusic size={40} strokeWidth={1} style={{ color: 'rgba(235,235,245,0.15)', margin: '0 auto 12px' }} />
          <p style={{ color: 'rgba(235,235,245,0.35)', fontSize: 15 }}>{t('noSetlists')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {setlists.map((sl) => (
            <div key={sl.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
              {/* Setlist header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{sl.title}</h3>
                  {sl.service_date && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(235,235,245,0.35)' }}>
                      {sl.service_date}
                    </p>
                  )}
                  {sl.notes && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgba(235,235,245,0.5)', whiteSpace: 'pre-wrap' }}>
                      {sl.notes}
                    </p>
                  )}
                </div>
                <Link
                  to={`/setlists/${sl.id}/edit`}
                  className="flex items-center justify-center rounded-xl transition-all active:scale-95"
                  style={{ backgroundColor: '#2c2c2e', minWidth: 40, minHeight: 40 }}
                  title={t('edit')}
                >
                  <Pencil size={15} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.6)' }} />
                </Link>
                <button
                  onClick={() => {
                    if (confirm(t('confirmDelete'))) deleteSetlist(sl.id)
                  }}
                  className="flex items-center justify-center rounded-xl transition-all active:scale-95"
                  style={{ backgroundColor: '#2c2c2e', minWidth: 40, minHeight: 40 }}
                  title={t('delete')}
                >
                  <Trash2 size={15} strokeWidth={1.5} style={{ color: '#ff453a' }} />
                </button>
              </div>

              {/* Song list */}
              {sl.songs.length > 0 && (
                <div style={{ borderTop: '1px solid #2c2c2e' }}>
                  {sl.songs
                    .slice()
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((ss, idx) => {
                      const song = getSongById(ss.song_id)
                      if (!song) return null
                      return (
                        <Link
                          key={ss.id}
                          to={`/songs/${song.id}`}
                          className="flex items-center gap-3 px-4 py-2.5 transition-all hover:bg-white/5"
                          style={{ borderTop: idx > 0 ? '1px solid rgba(44,44,46,0.5)' : undefined }}
                        >
                          <span
                            className="text-xs font-semibold w-5 text-right flex-shrink-0"
                            style={{ color: 'rgba(235,235,245,0.25)' }}
                          >
                            {idx + 1}
                          </span>
                          <span className="flex-1 text-sm" style={{ color: '#ffffff' }}>
                            {ss.vocalist && (
                              <span
                                className="font-semibold mr-1"
                                style={{ color: ss.vocalColor ?? '#0a84ff', fontSize: 11 }}
                              >
                                ({ss.vocalist})
                              </span>
                            )}
                            {song.title}
                          </span>
                          {song.original_key && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                              style={{ backgroundColor: 'rgba(50,215,75,0.12)', color: '#32d74b' }}
                            >
                              {song.original_key}
                            </span>
                          )}
                          <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.2)', flexShrink: 0 }} />
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
