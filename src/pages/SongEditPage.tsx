import { useParams } from 'react-router-dom'
import { useSongStore } from '../store/songStore'
import { SongEditor } from '../features/songs/components/SongEditor'
import { useTranslation } from 'react-i18next'

export default function SongEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { getSongById } = useSongStore()
  const song = id ? getSongById(id) : undefined

  return (
    <div style={{ backgroundColor: '#0f0f0f', minHeight: '100%' }}>
      <div
        className="px-4 py-3 border-b"
        style={{ backgroundColor: '#1a1a2e', borderColor: '#2d2d4e' }}
      >
        <h1 className="text-lg font-bold text-white">
          {song ? t('edit') : t('newSong')}
        </h1>
      </div>
      <SongEditor song={song} />
    </div>
  )
}
