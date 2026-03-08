import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { useSettingsStore } from '../../../store/settingsStore'
import { GuitarDiagram } from './GuitarDiagram'
import { PianoDiagram } from './PianoDiagram'
import { BassDiagram } from './BassDiagram'
import type { ChordRow } from '../types'
import { generateId } from '../../../shared/lib/storage'

interface Props {
  songId: string
  chordRows: ChordRow[]
  onChange: (rows: ChordRow[]) => void
}

const ROW_COLORS = [
  'var(--color-chord)', 'var(--color-info)', 'var(--color-warning)', 'var(--color-accent)', 'var(--color-error)', 'var(--color-info)', '#ffd60a', 'transparent',
]

function parseChordList(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0)
}

export function ChordRowsPanel({ songId: _songId, chordRows, onChange }: Props) {
  const {
    selectedInstrument, instruments,
    customChords, customPianoChords,
    guitarDotColor, pianoHighlightColor, guitarFlipped, diagramScale,
  } = useSettingsStore()

  const [collapsed, setCollapsed] = useState(false)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)

  const instrument = instruments.find((i) => i.id === selectedInstrument)
  const instrType = instrument?.type ?? 'guitar'
  const showPiano = instrType === 'piano' || instrType === 'keyboard'
  const showBass = instrType === 'bass'
  const scale = diagramScale ?? 1
  const diagSz = Math.round(80 * scale)

  const DiagramComp = ({ chord }: { chord: string }) => {
    if (showPiano) return <PianoDiagram chord={chord} customDiagram={customPianoChords[chord]} size={diagSz} highlightColor={pianoHighlightColor} />
    if (showBass) return <BassDiagram chord={chord} customDiagram={customChords[chord]} size={diagSz} dotColor={guitarDotColor} flipped={guitarFlipped} />
    return <GuitarDiagram chord={chord} customDiagram={customChords[chord]} size={diagSz} dotColor={guitarDotColor} flipped={guitarFlipped} />
  }

  const addRow = () => {
    const newRow: ChordRow = { id: generateId(), label: '', comment: '', chords: [], color: undefined }
    const updated = [...chordRows, newRow]
    onChange(updated)
    setEditingRowId(newRow.id)
  }

  const removeRow = (id: string) => onChange(chordRows.filter((r) => r.id !== id))

  const updateRow = (id: string, patch: Partial<ChordRow>) =>
    onChange(chordRows.map((r) => r.id === id ? { ...r, ...patch } : r))

  if (chordRows.length === 0 && !collapsed) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-xs flex-1" style={{ color: 'var(--color-text-muted)' }}>Chord rows</span>
        <button
          onClick={addRow}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-tertiary)' }}
        >
          <Plus size={12} strokeWidth={2} /> Add row
        </button>
      </div>
    )
  }

  return (
    <div className="border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <button onClick={() => setCollapsed((c) => !c)} className="flex items-center gap-1 flex-1" style={{ color: 'var(--color-text-tertiary)' }}>
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          <span className="text-xs">Chord rows ({chordRows.length})</span>
        </button>
        <button
          onClick={addRow}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-chord)' }}
        >
          <Plus size={12} strokeWidth={2} /> Add row
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-2 p-2">
          {chordRows.map((row) => {
            const isEditing = editingRowId === row.id
            return (
              <div
                key={row.id}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: 'var(--color-bg)', border: row.color && row.color !== 'transparent' ? `1px solid ${row.color}33` : '1px solid #1c1c1e' }}
              >
                {/* Row header */}
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <GripVertical size={14} style={{ color: 'var(--color-text-muted)' }} />
                  {row.label ? (
                    <span className="text-xs font-semibold" style={{ color: row.color && row.color !== 'transparent' ? row.color : 'var(--color-text-tertiary)', minWidth: 60 }}>
                      {row.label}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)', minWidth: 60 }}>no label</span>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => setEditingRowId(isEditing ? null : row.id)}
                    className="text-xs px-2 py-0.5 rounded transition-all"
                    style={{ backgroundColor: isEditing ? '#32d74b22' : 'transparent', color: isEditing ? 'var(--color-chord)' : 'var(--color-text-muted)' }}
                  >
                    {isEditing ? 'done' : 'edit'}
                  </button>
                  <button onClick={() => removeRow(row.id)} style={{ color: 'var(--color-error)', opacity: 0.6 }}>
                    <Trash2 size={12} strokeWidth={2} />
                  </button>
                </div>

                {/* Edit fields */}
                {isEditing && (
                  <div className="px-2 pb-2 space-y-1.5" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <input
                      type="text" placeholder="Label (e.g. Verse, Chorus...)" value={row.label ?? ''}
                      onChange={(e) => updateRow(row.id, { label: e.target.value })}
                      className="w-full rounded-lg px-2 py-1.5 text-xs outline-none"
                      style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-primary)', border: 'none' }}
                    />
                    <input
                      type="text"
                      placeholder="Chords (e.g. G D Em C)"
                      value={row.chords.join(' ')}
                      onChange={(e) => updateRow(row.id, { chords: parseChordList(e.target.value) })}
                      className="w-full rounded-lg px-2 py-1.5 text-xs outline-none font-mono"
                      style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-chord)', border: 'none' }}
                    />
                    <input
                      type="text" placeholder="Comment (below row)..." value={row.comment ?? ''}
                      onChange={(e) => updateRow(row.id, { comment: e.target.value })}
                      className="w-full rounded-lg px-2 py-1.5 text-xs outline-none"
                      style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-secondary)', border: 'none' }}
                    />
                    {/* Row colour */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Colour:</span>
                      {ROW_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateRow(row.id, { color: c })}
                          className="rounded-full flex-shrink-0"
                          style={{
                            width: 18, height: 18,
                            backgroundColor: c === 'transparent' ? 'var(--color-card-raised)' : c,
                            border: row.color === c ? '2px solid #fff' : '2px solid transparent',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Chord diagrams — scrollable row */}
                {row.chords.length > 0 && (
                  <div className="flex gap-0 overflow-x-auto scrollbar-none">
                    {/* Left side label for display */}
                    {row.label && !isEditing && (
                      <div
                        className="flex-shrink-0 flex items-center justify-center px-2 writing-mode-vertical"
                        style={{ minWidth: 28, backgroundColor: 'var(--color-bg-secondary)', borderRight: '1px solid var(--color-border-subtle)' }}
                      >
                        <span
                          className="text-xs font-semibold"
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: row.color && row.color !== 'transparent' ? row.color : 'var(--color-text-muted)' }}
                        >
                          {row.label}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-1 p-2 overflow-x-auto scrollbar-none" style={{ flex: 1 }}>
                      {row.chords.map((ch, ci) => (
                        <div key={`${ch}-${ci}`} className="flex-shrink-0">
                          <DiagramComp chord={ch} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {row.chords.length === 0 && !isEditing && (
                  <p className="text-xs px-3 pb-2" style={{ color: 'var(--color-text-muted)' }}>
                    Click "edit" to add chords
                  </p>
                )}

                {/* Comment below row */}
                {row.comment && (
                  <p className="text-xs px-3 pb-2" style={{ color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 4 }}>
                    {row.comment}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
