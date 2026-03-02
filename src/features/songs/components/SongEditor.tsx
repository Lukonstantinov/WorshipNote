import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Song } from '../types'
import { useSongStore } from '../../../store/songStore'
import { generateId } from '../../../shared/lib/storage'

interface Props {
  song?: Song
}

export function SongEditor({ song }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addSong, updateSong } = useSongStore()

  const [title, setTitle] = useState(song?.title ?? '')
  const [originalKey, setOriginalKey] = useState(song?.original_key ?? '')
  const [bpm, setBpm] = useState<string>(song?.bpm?.toString() ?? '')
  const [content, setContent] = useState(song?.content ?? '')
  const [tags, setTags] = useState(song?.tags?.join(', ') ?? '')

  const handleSave = () => {
    const now = new Date().toISOString()
    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean)
    if (song) {
      updateSong(song.id, {
        title,
        original_key: originalKey || undefined,
        bpm: bpm ? parseInt(bpm) : undefined,
        content,
        tags: parsedTags,
      })
      navigate(`/songs/${song.id}`)
    } else {
      const newSong: Song = {
        id: generateId(),
        title,
        original_key: originalKey || undefined,
        bpm: bpm ? parseInt(bpm) : undefined,
        content,
        tags: parsedTags,
        created_at: now,
        updated_at: now,
      }
      addSong(newSong)
      navigate(`/songs/${newSong.id}`)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Title */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('title')}</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-white outline-none focus:ring-2"
          style={{
            backgroundColor: '#1a1a2e',
            border: '1px solid #2d2d4e',
            minHeight: 44,
          }}
          placeholder="Название песни"
        />
      </div>

      {/* Key + BPM */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">{t('key')}</label>
          <input
            value={originalKey}
            onChange={(e) => setOriginalKey(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-white outline-none"
            style={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d4e', minHeight: 44 }}
            placeholder="G, Am, Bb..."
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">{t('bpm')}</label>
          <input
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            type="number"
            className="w-full px-3 py-2 rounded-lg text-white outline-none"
            style={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d4e', minHeight: 44 }}
            placeholder="120"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('tags')}</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-white outline-none"
          style={{ backgroundColor: '#1a1a2e', border: '1px solid #2d2d4e', minHeight: 44 }}
          placeholder="великий пост, хвала, причастие"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">{t('content')}</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full px-3 py-2 rounded-lg text-white outline-none resize-none font-mono text-sm"
          style={{
            backgroundColor: '#1a1a2e',
            border: '1px solid #2d2d4e',
            lineHeight: 1.7,
          }}
          placeholder={`[! ИНТРО: ГИТАРА]
[G] Слава Те[Em]бе, Боже
[C] Ибо Ты ве[D]лик.`}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl font-semibold text-white"
          style={{ backgroundColor: '#a78bfa', minHeight: 44 }}
        >
          {t('save')}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-3 rounded-xl font-semibold"
          style={{ backgroundColor: '#2d2d4e', color: '#9ca3af', minHeight: 44 }}
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}
