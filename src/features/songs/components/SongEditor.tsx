import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, FolderOpen, Columns2, AlignLeft, Camera, RotateCcw } from 'lucide-react'
import type { Song } from '../types'
import { useSongStore } from '../../../store/songStore'
import { useFolderStore } from '../../../store/folderStore'
import { useSettingsStore } from '../../../store/settingsStore'
import { generateId } from '../../../shared/lib/storage'
import { parseSong } from '../lib/parser'
import { SongViewer } from './SongViewer'
import { SimpleEditor } from './SimpleEditor'

interface Props {
  song?: Song
}

export function SongEditor({ song }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addSong, updateSong } = useSongStore()
  const { folders } = useFolderStore()
  const { defaultSongTemplate } = useSettingsStore()

  const [title, setTitle] = useState(song?.title ?? '')
  const [originalKey, setOriginalKey] = useState(song?.original_key ?? '')
  const [bpm, setBpm] = useState<string>(song?.bpm?.toString() ?? '')
  const [content, setContent] = useState(song?.content ?? (song ? '' : defaultSongTemplate))
  const [tags, setTags] = useState(song?.tags?.join(', ') ?? '')
  const [folderId, setFolderId] = useState<string>(song?.folderId ?? '')
  const [structure, setStructure] = useState(song?.structure ?? '')
  const [showPreview, setShowPreview] = useState(false)
  const [editorMode, setEditorMode] = useState<'simple' | 'advanced'>('advanced')
  const [snapshotMsg, setSnapshotMsg] = useState<string | null>(null)

  const parsed = useMemo(() => parseSong(content), [content])

  const handleSave = () => {
    const now = new Date().toISOString()
    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean)
    const fields = {
      title,
      original_key: originalKey || undefined,
      bpm: bpm ? parseInt(bpm) : undefined,
      content,
      tags: parsedTags,
      folderId: folderId || undefined,
      structure: structure.trim() || undefined,
    }
    if (song) {
      updateSong(song.id, fields)
      navigate(`/songs/${song.id}`)
    } else {
      const newSong: Song = {
        id: generateId(),
        ...fields,
        created_at: now,
        updated_at: now,
      }
      addSong(newSong)
      navigate(`/songs/${newSong.id}`)
    }
  }

  const handleSaveSnapshot = () => {
    if (!song) return
    updateSong(song.id, { snapshotContent: content, snapshotSavedAt: new Date().toISOString() })
    setSnapshotMsg('Saved as original')
    setTimeout(() => setSnapshotMsg(null), 2000)
  }

  const handleRestoreSnapshot = () => {
    if (!song?.snapshotContent) return
    if (confirm('Restore to saved original? Current content will be replaced.')) {
      setContent(song.snapshotContent)
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
            placeholder="Song title"
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
            placeholder="praise, lent, communion"
          />
        </div>

        {/* Folder picker */}
        {folders.length > 0 && (
          <div>
            <label style={labelStyle}>
              <FolderOpen size={10} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
              {t('folder')}
            </label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="" style={{ backgroundColor: '#1c1c1e' }}>— {t('noFolder')} —</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id} style={{ backgroundColor: '#1c1c1e' }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Structure override */}
        <div>
          <label style={labelStyle}>{t('structure')} ({t('autoStructure')})</label>
          <input
            value={structure}
            onChange={(e) => setStructure(e.target.value)}
            style={inputStyle}
            placeholder="A B A B C B  (leave blank to auto-detect)"
          />
        </div>

        {/* Content: mode toggle + editor */}
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <label style={{ ...labelStyle, marginBottom: 0 }}>{t('content')}</label>
            <div className="flex items-center gap-1.5">
              {/* Mode toggle */}
              <div className="flex rounded-xl overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
                <button
                  onClick={() => setEditorMode('simple')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: editorMode === 'simple' ? '#2c2c2e' : 'transparent',
                    color: editorMode === 'simple' ? '#fff' : 'rgba(235,235,245,0.4)',
                    minHeight: 32,
                  }}
                >
                  <Columns2 size={12} strokeWidth={1.5} />
                  {t('simpleMode')}
                </button>
                <button
                  onClick={() => setEditorMode('advanced')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: editorMode === 'advanced' ? '#2c2c2e' : 'transparent',
                    color: editorMode === 'advanced' ? '#fff' : 'rgba(235,235,245,0.4)',
                    minHeight: 32,
                  }}
                >
                  <AlignLeft size={12} strokeWidth={1.5} />
                  {t('advancedMode')}
                </button>
              </div>

              {editorMode === 'advanced' && (
                <button
                  onClick={() => setShowPreview((p) => !p)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all"
                  style={{
                    backgroundColor: showPreview ? '#bf5af2' : '#2c2c2e',
                    color: showPreview ? '#fff' : 'rgba(235,235,245,0.5)',
                  }}
                >
                  {showPreview ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
                  {t('preview')}
                </button>
              )}
            </div>
          </div>

          {editorMode === 'simple' ? (
            <SimpleEditor content={content} onChange={setContent} />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={showPreview ? 14 : 20}
              className="font-mono text-sm resize-none"
              style={{ ...inputStyle, minHeight: 'unset', lineHeight: 1.7 }}
              placeholder={`[! INTRO: GUITAR]\n[G] Glory to[Em] You, Lord\n[C] For You are[D] great.`}
            />
          )}
        </div>

        {/* Snapshot actions (only for existing songs) */}
        {song && (
          <div className="flex gap-2">
            <button
              onClick={handleSaveSnapshot}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{ backgroundColor: '#1c1c1e', color: snapshotMsg ? '#32d74b' : 'rgba(235,235,245,0.5)', border: '1px solid #2c2c2e' }}
              title="Save current content as the 'original' you can restore to"
            >
              <Camera size={13} strokeWidth={1.5} />
              {snapshotMsg ?? 'Save as original'}
            </button>
            {song.snapshotContent && (
              <button
                onClick={handleRestoreSnapshot}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{ backgroundColor: '#1c1c1e', color: '#ff9f0a', border: '1px solid #2c2c2e' }}
                title={`Restore to snapshot saved on ${song.snapshotSavedAt ? new Date(song.snapshotSavedAt).toLocaleDateString() : 'unknown date'}`}
              >
                <RotateCcw size={13} strokeWidth={1.5} />
                Restore original
              </button>
            )}
          </div>
        )}

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

      {/* Right: live preview (desktop, advanced mode only) */}
      {showPreview && editorMode === 'advanced' && (
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
