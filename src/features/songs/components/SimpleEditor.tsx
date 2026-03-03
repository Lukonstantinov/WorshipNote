import { useState, useRef, useEffect } from 'react'
import { Plus, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { simpleToChordPro, chordProToSimple } from '../lib/simpleConverter'
import type { SimpleSection, ChordedWord } from '../lib/simpleConverter'

import { useTranslation } from 'react-i18next'

interface Props {
  content: string
  onChange: (content: string) => void
}

const SECTION_PRESETS = [
  { label: 'VERSE', display: 'Verse' },
  { label: 'CHORUS', display: 'Chorus' },
  { label: 'PRE-CHORUS', display: 'Pre-Chorus' },
  { label: 'BRIDGE', display: 'Bridge' },
  { label: 'INTRO', display: 'Intro' },
  { label: 'OUTRO', display: 'Outro' },
  { label: 'INTERLUDE', display: 'Interlude' },
  { label: 'SOLO', display: 'Solo' },
  { label: 'TAG', display: 'Tag' },
  { label: 'INSTRUMENTAL', display: 'Instrumental' },
]

const COMMON_CHORDS = [
  'C', 'Cm', 'C7', 'D', 'Dm', 'D7',
  'E', 'Em', 'E7', 'F', 'Fm', 'G',
  'Gm', 'G7', 'A', 'Am', 'A7', 'B', 'Bm',
  'Bb', 'F#m', 'C#m', 'G#m',
]

interface ChordPickerProps {
  onPick: (chord: string) => void
  onClear: () => void
  onClose: () => void
  current?: string
}

function ChordPicker({ onPick, onClear, onClose, current }: ChordPickerProps) {
  const [custom, setCustom] = useState(current ?? '')
  return (
    <div
      className="absolute z-30 rounded-2xl shadow-2xl p-3"
      style={{ backgroundColor: '#2c2c2e', minWidth: 220, top: '100%', left: 0 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="flex-1 bg-transparent text-white text-sm outline-none"
          placeholder="Custom chord…"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && custom.trim()) { onPick(custom.trim()); onClose() }
            if (e.key === 'Escape') onClose()
          }}
        />
        {current && (
          <button onClick={() => { onClear(); onClose() }}>
            <X size={14} strokeWidth={2} style={{ color: '#ff453a' }} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {COMMON_CHORDS.map((ch) => (
          <button
            key={ch}
            onClick={() => { onPick(ch); onClose() }}
            className="py-1 rounded-lg text-xs font-semibold transition-all active:scale-95"
            style={{
              backgroundColor: current === ch ? '#32d74b22' : '#1c1c1e',
              color: current === ch ? '#32d74b' : 'rgba(235,235,245,0.8)',
              border: current === ch ? '1px solid #32d74b44' : '1px solid transparent',
            }}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  )
}

interface WordProps {
  word: ChordedWord
  onChange: (w: ChordedWord) => void
}

function Word({ word, onChange }: WordProps) {
  const [showPicker, setShowPicker] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showPicker) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  return (
    <div ref={ref} className="relative inline-flex flex-col items-center mr-1 mb-1">
      {/* Chord label above */}
      <button
        onClick={() => setShowPicker((p) => !p)}
        className="text-xs font-semibold leading-tight px-1 rounded"
        style={{
          color: word.chord ? '#32d74b' : 'rgba(235,235,245,0.2)',
          fontFamily: 'monospace',
          minHeight: 16,
          backgroundColor: word.chord ? 'rgba(50,215,75,0.1)' : 'transparent',
        }}
      >
        {word.chord ?? '+'}
      </button>
      {/* Word text */}
      <span className="text-sm text-white leading-snug">{word.text}</span>

      {showPicker && (
        <ChordPicker
          current={word.chord}
          onPick={(ch) => onChange({ ...word, chord: ch })}
          onClear={() => onChange({ ...word, chord: undefined })}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

interface SectionBlockProps {
  section: SimpleSection
  index: number
  onChange: (section: SimpleSection) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
  isFirst: boolean
  isLast: boolean
}

function SectionBlock({ section, index: _index, onChange, onDelete, onMove, isFirst, isLast }: SectionBlockProps) {
  const [editing, setEditing] = useState(false)
  const [rawText, setRawText] = useState(() => section.words.map((w) => w.text).join(' '))
  const [editingLabel, setEditingLabel] = useState(false)
  const [customLabel, setCustomLabel] = useState(section.label)
  const { t } = useTranslation()

  const commitText = () => {
    const words = rawText.trim().split(/\s+/).filter(Boolean)
    const merged: ChordedWord[] = words.map((text, i) => ({
      text,
      chord: section.words[i]?.chord,
    }))
    onChange({ ...section, words: merged })
    setEditing(false)
  }

  return (
    <div className="rounded-2xl p-3 mb-3" style={{ backgroundColor: '#1c1c1e' }}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <GripVertical size={14} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.2)' }} />
        {editingLabel ? (
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onBlur={() => {
              if (customLabel.trim()) onChange({ ...section, label: customLabel.trim() })
              setEditingLabel(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (customLabel.trim()) onChange({ ...section, label: customLabel.trim() })
                setEditingLabel(false)
              }
              if (e.key === 'Escape') { setCustomLabel(section.label); setEditingLabel(false) }
            }}
            className="flex-1 bg-transparent text-xs font-semibold outline-none px-1 rounded"
            style={{ color: '#bf5af2', backgroundColor: '#2c2c2e' }}
            placeholder="Custom label..."
            autoFocus
          />
        ) : (
          <select
            value={SECTION_PRESETS.find((p) => p.label === section.label) ? section.label : '__custom__'}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setCustomLabel(section.label)
                setEditingLabel(true)
              } else {
                onChange({ ...section, label: e.target.value })
              }
            }}
            className="flex-1 bg-transparent text-xs font-semibold outline-none"
            style={{ color: '#bf5af2' }}
          >
            {SECTION_PRESETS.map((p) => (
              <option key={p.label} value={p.label} style={{ backgroundColor: '#2c2c2e' }}>{p.display}</option>
            ))}
            {!SECTION_PRESETS.find((p) => p.label === section.label) && (
              <option value="__custom__" style={{ backgroundColor: '#2c2c2e' }}>{section.label}</option>
            )}
            <option value="__custom__" style={{ backgroundColor: '#2c2c2e' }}>Custom...</option>
          </select>
        )}
        <div className="flex items-center gap-1 ml-auto">
          {!isFirst && (
            <button onClick={() => onMove(-1)}>
              <ChevronUp size={14} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.4)' }} />
            </button>
          )}
          {!isLast && (
            <button onClick={() => onMove(1)}>
              <ChevronDown size={14} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.4)' }} />
            </button>
          )}
          <button onClick={onDelete}>
            <X size={14} strokeWidth={2} style={{ color: '#ff453a' }} />
          </button>
        </div>
      </div>

      {/* Words */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={3}
            className="w-full text-sm rounded-xl px-3 py-2 resize-none outline-none text-white font-mono"
            style={{ backgroundColor: '#2c2c2e' }}
            placeholder={t('tapToAddChord')}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={commitText}
              className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: '#bf5af2', color: '#fff' }}
            >
              {t('save')}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.5)' }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {section.words.length === 0 ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-3 rounded-xl text-sm text-center"
              style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.3)', border: '1px dashed #3c3c3e' }}
            >
              {t('tapToAddChord')} ›
            </button>
          ) : (
            <div className="flex flex-wrap" onClick={(e) => {
              // allow clicking the area to edit text
              if ((e.target as HTMLElement).closest('button')) return
            }}>
              {section.words.map((word, wi) => (
                <Word
                  key={wi}
                  word={word}
                  onChange={(updated) => {
                    const newWords = [...section.words]
                    newWords[wi] = updated
                    onChange({ ...section, words: newWords })
                  }}
                />
              ))}
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-2 py-1 rounded-lg ml-1"
                style={{ color: 'rgba(235,235,245,0.3)', backgroundColor: '#2c2c2e' }}
              >
                ✎
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MoreSectionsMenu({ onAdd }: { onAdd: (label: string) => void }) {
  const [open, setOpen] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const extraPresets = SECTION_PRESETS.slice(5)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
        style={{ backgroundColor: '#1c1c1e', color: 'rgba(235,235,245,0.5)', border: '1px dashed #3c3c3e' }}
      >
        <Plus size={12} strokeWidth={2.5} />
        {t('more')}...
      </button>
      {open && (
        <div
          className="absolute bottom-full mb-1 left-0 rounded-xl shadow-2xl z-20 overflow-hidden py-1"
          style={{ backgroundColor: '#2c2c2e', minWidth: 180 }}
        >
          {extraPresets.map((p) => (
            <button
              key={p.label}
              onClick={() => { onAdd(p.label); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-xs font-medium transition-all hover:bg-white/10"
              style={{ color: 'rgba(235,235,245,0.8)' }}
            >
              + {p.display}
            </button>
          ))}
          <div
            className="px-3 py-2 flex gap-2"
            style={{ borderTop: '1px solid #3c3c3e' }}
          >
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-transparent text-white text-xs outline-none"
              placeholder={t('customSection')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customInput.trim()) {
                  onAdd(customInput.trim().toUpperCase())
                  setCustomInput('')
                  setOpen(false)
                }
              }}
            />
            <button
              onClick={() => {
                if (customInput.trim()) {
                  onAdd(customInput.trim().toUpperCase())
                  setCustomInput('')
                  setOpen(false)
                }
              }}
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ color: customInput.trim() ? '#32d74b' : 'rgba(235,235,245,0.3)' }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function SimpleEditor({ content, onChange }: Props) {
  const { t } = useTranslation()
  const [sections, setSections] = useState<SimpleSection[]>(() => chordProToSimple(content))

  const commit = (updated: SimpleSection[]) => {
    setSections(updated)
    onChange(simpleToChordPro(updated))
  }

  const addSection = (preset = SECTION_PRESETS[0]) => {
    commit([...sections, { label: preset.label, words: [] }])
  }

  const updateSection = (i: number, sec: SimpleSection) => {
    const next = [...sections]
    next[i] = sec
    commit(next)
  }

  const deleteSection = (i: number) => {
    commit(sections.filter((_, idx) => idx !== i))
  }

  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...sections]
    const target = i + dir
    if (target < 0 || target >= next.length) return
    ;[next[i], next[target]] = [next[target], next[i]]
    commit(next)
  }

  return (
    <div>
      {sections.map((sec, i) => (
        <SectionBlock
          key={i}
          section={sec}
          index={i}
          onChange={(updated) => updateSection(i, updated)}
          onDelete={() => deleteSection(i)}
          onMove={(dir) => moveSection(i, dir)}
          isFirst={i === 0}
          isLast={i === sections.length - 1}
        />
      ))}

      {/* Add section buttons */}
      <div className="flex flex-wrap gap-2 mt-2">
        {SECTION_PRESETS.slice(0, 5).map((preset) => (
          <button
            key={preset.label}
            onClick={() => addSection(preset)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ backgroundColor: '#1c1c1e', color: 'rgba(235,235,245,0.5)', border: '1px dashed #3c3c3e' }}
          >
            <Plus size={12} strokeWidth={2.5} />
            {t(`add${preset.display.replace(/\s/g, '')}` as 'addVerse') ?? preset.display}
          </button>
        ))}
        {/* More presets dropdown */}
        <MoreSectionsMenu onAdd={(label) => commit([...sections, { label, words: [] }])} />
      </div>
    </div>
  )
}
