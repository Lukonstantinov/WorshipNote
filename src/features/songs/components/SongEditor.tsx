import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, FolderOpen, Columns2, AlignLeft, Camera, RotateCcw, Sparkles, Copy } from 'lucide-react'
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
  const { defaultSongTemplate, songPresets } = useSettingsStore()

  const [title, setTitle] = useState(song?.title ?? '')
  const [originalKey, setOriginalKey] = useState(song?.original_key ?? '')
  const [bpm, setBpm] = useState<string>(song?.bpm?.toString() ?? '')
  const defaultPreset = songPresets.find((p) => p.isDefault)
  const [content, setContent] = useState(song?.content ?? defaultPreset?.content ?? defaultSongTemplate)
  const [vocalist, setVocalist] = useState(song?.vocalist ?? '')
  const [tags, setTags] = useState(song?.tags?.join(', ') ?? '')
  const [folderId, setFolderId] = useState<string>(song?.folderId ?? '')
  const [structure, setStructure] = useState(song?.structure ?? '')
  const [showPreview, setShowPreview] = useState(false)
  const [editorMode, setEditorMode] = useState<'simple' | 'advanced'>('advanced')
  const [snapshotMsg, setSnapshotMsg] = useState<string | null>(null)
  const [showPresetDialog, setShowPresetDialog] = useState(false)
  const [presetName, setPresetName] = useState('')

  const parsed = useMemo(() => parseSong(content), [content])

  const handleSave = () => {
    const now = new Date().toISOString()
    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean)
    const fields = {
      title,
      original_key: originalKey || undefined,
      bpm: bpm ? parseInt(bpm) : undefined,
      vocalist: vocalist.trim() || undefined,
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

  const handleCreatePreset = () => {
    if (!song || !presetName.trim()) return
    const now = new Date().toISOString()
    const newSong: Song = {
      ...song,
      id: generateId(),
      title: `${song.title} (${presetName.trim()})`,
      isPreset: true,
      snapshotContent: undefined,
      snapshotSavedAt: undefined,
      created_at: now,
      updated_at: now,
    }
    addSong(newSong)
    setShowPresetDialog(false)
    setPresetName('')
    navigate(`/songs/${newSong.id}/edit`)
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    minHeight: 44,
    borderRadius: 12,
    outline: 'none',
    width: '100%',
    padding: '8px 12px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
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
        {/* Preset picker — only for new songs */}
        {!song && songPresets.length > 0 && (
          <div>
            <label style={labelStyle}>
              <Sparkles size={10} strokeWidth={2} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              {t('presets')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {songPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setContent(preset.content)
                    if (preset.key) setOriginalKey(preset.key)
                    if (preset.bpm) setBpm(String(preset.bpm))
                    if (preset.tags?.length) setTags(preset.tags.join(', '))
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                  style={{
                    backgroundColor: `${preset.color}22`,
                    color: preset.color,
                    border: `1px solid ${preset.color}44`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
                  {preset.name}
                  {preset.isDefault && (
                    <span className="text-[9px] opacity-60 ml-0.5">*</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

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

        {/* Vocalist */}
        <div>
          <label style={labelStyle}>{t('vocalist') || 'Vocalist'}</label>
          <input
            value={vocalist}
            onChange={(e) => setVocalist(e.target.value)}
            style={inputStyle}
            placeholder="Main vocalist name"
          />
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
              <option value="" style={{ backgroundColor: 'var(--color-card)' }}>— {t('noFolder')} —</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id} style={{ backgroundColor: 'var(--color-card)' }}>
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
              <div className="flex rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
                <button
                  onClick={() => setEditorMode('simple')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: editorMode === 'simple' ? 'var(--color-card-raised)' : 'transparent',
                    color: editorMode === 'simple' ? '#fff' : 'var(--color-text-tertiary)',
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
                    backgroundColor: editorMode === 'advanced' ? 'var(--color-card-raised)' : 'transparent',
                    color: editorMode === 'advanced' ? '#fff' : 'var(--color-text-tertiary)',
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
                    backgroundColor: showPreview ? 'var(--color-accent)' : 'var(--color-card-raised)',
                    color: showPreview ? '#fff' : 'var(--color-text-tertiary)',
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
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSaveSnapshot}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-card)', color: snapshotMsg ? 'var(--color-chord)' : 'var(--color-text-tertiary)', border: '1px solid var(--color-border)' }}
              title="Save current content as the 'original' you can restore to"
            >
              <Camera size={13} strokeWidth={1.5} />
              {snapshotMsg ?? 'Save as original'}
            </button>
            {song.snapshotContent && (
              <button
                onClick={handleRestoreSnapshot}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-warning)', border: '1px solid var(--color-border)' }}
                title={`Restore to snapshot saved on ${song.snapshotSavedAt ? new Date(song.snapshotSavedAt).toLocaleDateString() : 'unknown date'}`}
              >
                <RotateCcw size={13} strokeWidth={1.5} />
                Restore original
              </button>
            )}
            <button
              onClick={() => { setShowPresetDialog((p) => !p); setPresetName('') }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}
              title="Create a preset copy of this psalm"
            >
              <Copy size={13} strokeWidth={1.5} />
              Create new preset
            </button>
          </div>
        )}

        {/* Preset name dialog */}
        {showPresetDialog && song && (
          <div
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{ backgroundColor: 'var(--color-card-raised)', border: '1px solid var(--color-accent)44' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Preset name — will create: <em style={{ color: 'var(--color-accent)' }}>{song.title} ({presetName || '…'})</em>
            </p>
            <div className="flex gap-2">
              <input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePreset() }}
                autoFocus
                placeholder="e.g. Fast version, Key of D…"
                className="flex-1 text-xs px-3 py-2 rounded-xl outline-none"
                style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
              <button
                onClick={handleCreatePreset}
                disabled={!presetName.trim()}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
              >
                Create
              </button>
              <button
                onClick={() => setShowPresetDialog(false)}
                className="px-3 py-2 rounded-xl text-xs transition-all"
                style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-border)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-accent)', minHeight: 44 }}
          >
            {t('save')}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-tertiary)', minHeight: 44 }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>

      {/* Right: live preview (desktop, advanced mode only) */}
      {showPreview && editorMode === 'advanced' && (
        <div
          className="hidden md:flex flex-col flex-1 border-l overflow-auto"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        >
          <div
            className="px-4 py-2.5 border-b text-xs font-semibold tracking-widest"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-secondary)' }}
          >
            PREVIEW
          </div>
          <div className="p-6 flex-1">
            {title && (
              <h2 className="font-bold mb-1" style={{ fontSize: 18 }}>{title}</h2>
            )}
            {originalKey && (
              <p className="text-xs mb-4" style={{ color: 'var(--color-chord)' }}>
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
