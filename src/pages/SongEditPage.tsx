import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSongStore } from '../store/songStore'
import { SongEditor } from '../features/songs/components/SongEditor'
import { SongExportModal } from '../features/songs/components/SongExportModal'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Download } from 'lucide-react'

export default function SongEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getSongById } = useSongStore()
  const song = id ? getSongById(id) : undefined
  const [showExport, setShowExport] = useState(false)

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100%' }}>
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-xl transition-all"
          style={{ color: 'var(--color-accent)', minWidth: 44, minHeight: 44 }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-base font-semibold flex-1">
          {song ? t('edit') : t('newSong')}
        </h1>
        {song && (
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 44, minHeight: 44 }}
            title={t('downloadSong')}
          >
            <Download size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        )}
      </div>
      <SongEditor song={song} />
      {showExport && song && <SongExportModal song={song} onClose={() => setShowExport(false)} />}
    </div>
  )
}
