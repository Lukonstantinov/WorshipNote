import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import type { Song } from '../types'
import { useSongStore } from '../../../store/songStore'
import { generateId } from '../../../shared/lib/storage'
import { parseSong } from '../lib/parser'
import { SongViewer } from './SongViewer'

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
  const [showPreview, setShowPreview] = useState(false)

  const parsed = useMemo(() => parseSong(content), [content])

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

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#1c1c1e',
    border: '1px solid #2c2c2e',
    color: '#ffffff',
    minHeight: 44,
    borderRadius: 12,
    outline: 'none',
    width: '100%',
    padding: '8px 12px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    color: 'rgba(235,235,245,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
  }

  return (
    <div className="flex h-full" style={{ minHeight: 0 }}>
      {/* Left: form */}
      <div
        className="flex flex-col p-4 space-y-4 overflow-auto pb-24 md:pb-6"
        style={{ flex: 1, minWidth: 0 }}
      >
        {/* Title */}
        <div>
          <label style={labelStyle}>{t('title')}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="Название песни"
          />
        </div>

        {/* Key + BPM */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label style={labelStyle}>{t('key')}</label>
            <input
              value={originalKey}
              onChange={(e) => setOriginalKey(e.target.value)}
              style={inputStyle}
              placeholder="G, Am, Bb…"
            />
          </div>
          <div className="flex-1">
            <label style={labelStyle}>{t('bpm')}</label>
            <input
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              type="number"
              style={inputStyle}
              placeholder="120"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={labelStyle}>{t('tags')}</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={inputStyle}
            placeholder="великий пост, хвала, причастие"
          />
        </div>

        {/* Content + preview toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label style={{ ...labelStyle, marginBottom: 0 }}>{t('content')}</label>
            <button
              onClick={() => setShowPreview((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all"
              style={{
                backgroundColor: showPreview ? '#bf5af2' : '#2c2c2e',
                color: showPreview ? '#fff' : 'rgba(235,235,245,0.5)',
              }}
              title="Live preview"
            >
              {showPreview
                ? <EyeOff size={13} strokeWidth={1.5} />
                : <Eye size={13} strokeWidth={1.5} />
              }
              {t('preview')}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={showPreview ? 14 : 20}
            className="font-mono text-sm resize-none"
            style={{
              ...inputStyle,
              minHeight: 'unset',
              lineHeight: 1.7,
            }}
            placeholder={`[! ИНТРО: ГИТАРА]\n[G] Слава Те[Em]бе, Боже\n[C] Ибо Ты ве[D]лик.`}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#bf5af2', minHeight: 44 }}
          >
            {t('save')}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.5)', minHeight: 44 }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>

      {/* Right: live preview (desktop only) */}
      {showPreview && (
        <div
          className="hidden md:flex flex-col flex-1 border-l overflow-auto"
          style={{ borderColor: '#2c2c2e', backgroundColor: '#000000' }}
        >
          <div
            className="px-4 py-2.5 border-b text-xs font-semibold tracking-widest"
            style={{ borderColor: '#2c2c2e', color: 'rgba(235,235,245,0.2)', backgroundColor: '#111111' }}
          >
            PREVIEW
          </div>
          <div className="p-6 flex-1">
            {title && (
              <h2 className="font-bold text-white mb-1" style={{ fontSize: 18 }}>{title}</h2>
            )}
            {originalKey && (
              <p className="text-xs mb-4" style={{ color: '#32d74b' }}>
                {originalKey}{bpm ? ` · ${bpm} bpm` : ''}
              </p>
            )}
            <SongViewer parsed={parsed} />
          </div>
        </div>
      )}
    </div>
  )
}
