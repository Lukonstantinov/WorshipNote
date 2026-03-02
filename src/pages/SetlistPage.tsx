import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSetlistStore } from '../store/setlistStore'
import { useSongStore } from '../store/songStore'

export default function SetlistPage() {
  const { t } = useTranslation()
  const { setlists, deleteSetlist } = useSetlistStore()
  const { getSongById } = useSongStore()

  return (
    <div className="p-4 pb-24 md:pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{t('setlists')}</h2>
        <Link
          to="/setlists/new"
          className="px-4 py-2 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: '#a78bfa', color: '#fff', minHeight: 44, display: 'flex', alignItems: 'center' }}
        >
          + {t('newSetlist')}
        </Link>
      </div>

      {setlists.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">
          <p className="text-4xl mb-4">📋</p>
          <p>{t('noSetlists')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {setlists.map((sl) => (
            <div key={sl.id} className="p-4 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{sl.title}</h3>
                  {sl.service_date && (
                    <p className="text-xs text-gray-400">{sl.service_date}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/setlists/${sl.id}/edit`}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: '#2d2d4e', color: '#a78bfa', minHeight: 44, display: 'flex', alignItems: 'center' }}
                  >
                    {t('edit')}
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(t('confirmDelete'))) deleteSetlist(sl.id)
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: '#2d2d4e', color: '#f87171', minHeight: 44 }}
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {sl.songs.sort((a, b) => a.sort_order - b.sort_order).map((ss) => {
                  const song = getSongById(ss.song_id)
                  if (!song) return null
                  return (
                    <Link
                      key={ss.id}
                      to={`/songs/${song.id}`}
                      className="flex items-center gap-2 text-sm py-1"
                      style={{ color: '#f5f5f5' }}
                    >
                      <span className="text-gray-500">{ss.sort_order + 1}.</span>
                      <span>{song.title}</span>
                      {song.original_key && (
                        <span className="text-xs px-1.5 rounded" style={{ backgroundColor: '#2d2d4e', color: '#4ade80' }}>
                          {song.original_key}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
