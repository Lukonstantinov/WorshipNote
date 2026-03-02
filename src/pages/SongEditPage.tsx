import { useParams, useNavigate } from 'react-router-dom'
import { useSongStore } from '../store/songStore'
import { SongEditor } from '../features/songs/components/SongEditor'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'

export default function SongEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getSongById } = useSongStore()
  const song = id ? getSongById(id) : undefined

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100%' }}>
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ backgroundColor: '#111111', borderColor: '#2c2c2e' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-xl transition-all"
          style={{ color: '#bf5af2', minWidth: 44, minHeight: 44 }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-base font-semibold text-white">
          {song ? t('edit') : t('newSong')}
        </h1>
      </div>
      <SongEditor song={song} />
    </div>
  )
}
