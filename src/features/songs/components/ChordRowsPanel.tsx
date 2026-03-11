import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Eye, EyeOff, Library, TableProperties } from 'lucide-react'
import { useSettingsStore } from '../../../store/settingsStore'
import { useChordLibraryStore } from '../../../store/chordLibraryStore'
import { GuitarDiagram } from './GuitarDiagram'
import { PianoDiagram } from './PianoDiagram'
import { BassDiagram } from './BassDiagram'
import { TabViewer } from './TabViewer'
import { ProgressionPickerModal } from '../../chordLibrary/components/ProgressionPickerModal'
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

const DOT_COLORS = ['#bf5af2', '#32d74b', '#0a84ff', '#ff9f0a', '#ff453a', '#ffd60a', '#ffffff']

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
  const { tabs } = useChordLibraryStore()

  const [collapsed, setCollapsed] = useState(false)
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [showTabPicker, setShowTabPicker] = useState(false)
  const [tabPickerQuery, setTabPickerQuery] = useState('')

  const instrument = instruments.find((i) => i.id === selectedInstrument)
  const instrType = instrument?.type ?? 'guitar'
  const showPiano = instrType === 'piano' || instrType === 'keyboard'
  const showBass = instrType === 'bass'
  const scale = diagramScale ?? 1
  const diagSz = Math.round(80 * scale)

  const DiagramComp = ({ chord, dotColor }: { chord: string; dotColor?: string }) => {
    const dc = dotColor ?? guitarDotColor
    const hc = dotColor ?? pianoHighlightColor
    if (showPiano) return <PianoDiagram chord={chord} customDiagram={customPianoChords[chord]} size={diagSz} highlightColor={hc} />
    if (showBass) return <BassDiagram chord={chord} customDiagram={customChords[chord]} size={diagSz} dotColor={dc} flipped={guitarFlipped} />
    return <GuitarDiagram chord={chord} customDiagram={customChords[chord]} size={diagSz} dotColor={dc} flipped={guitarFlipped} />
  }

  const addRow = () => {
    const newRow: ChordRow = { id: generateId(), label: '', comment: '', chords: [], color: undefined, visible: true }
    const updated = [...chordRows, newRow]
    onChange(updated)
    setEditingRowId(newRow.id)
  }

  const addFromLibrary = (row: ChordRow) => {
    onChange([...chordRows, { ...row, visible: true }])
  }

  const addTabFromLibrary = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    const newRow: ChordRow = {
      id: generateId(),
      label: tab.name,
      tabId: tab.id,
      chords: [],
      fromLibrary: true,
      visible: true,
    }
    onChange([...chordRows, newRow])
    setShowTabPicker(false)
    setTabPickerQuery('')
  }

  const removeRow = (id: string) => onChange(chordRows.filter((r) => r.id !== id))

  const updateRow = (id: string, patch: Partial<ChordRow>) =>
    onChange(chordRows.map((r) => r.id === id ? { ...r, ...patch } : r))

  const toggleVisibility = (id: string) =>
    onChange(chordRows.map((r) => r.id === id ? { ...r, visible: r.visible === false ? true : false } : r))

  const visibleCount = chordRows.filter((r) => r.visible !== false).length

  // Tabs already used in rows (to exclude from picker)
  const usedTabIds = chordRows.map((r) => r.tabId).filter(Boolean) as string[]
  const availableTabs = tabs.filter((t) => !usedTabIds.includes(t.id))
  const filteredTabs = availableTabs.filter((t) =>
    t.name.toLowerCase().includes(tabPickerQuery.toLowerCase())
  )

  const TabPickerDropdown = () => (
    <div
      className="rounded-2xl overflow-hidden mb-2"
      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card-raised)' }}
    >
      <div className="p-2">
        <input
          autoFocus
          value={tabPickerQuery}
          onChange={(e) => setTabPickerQuery(e.target.value)}
          placeholder="Search tabs…"
          className="w-full px-3 py-2 rounded-xl text-xs outline-none"
          style={{
            backgroundColor: 'var(--color-input-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>
      {filteredTabs.length === 0 ? (
        <p className="px-4 pb-3 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          {availableTabs.length === 0 ? 'No tabs in library yet.' : 'No matching tabs.'}
        </p>
      ) : (
        <div className="max-h-48 overflow-y-auto">
          {filteredTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => addTabFromLibrary(t.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover-bg"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              <TableProperties size={13} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>{t.name}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
              >
                {t.instrument}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  if (chordRows.length === 0 && !collapsed) {
    return (
      <>
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="text-xs flex-1" style={{ color: 'var(--color-text-muted)' }}>Chord rows</span>
          <button
            onClick={() => { setShowTabPicker((p) => !p); setShowPicker(false) }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
          >
            <TableProperties size={12} strokeWidth={2} /> Tab
          </button>
          <button
            onClick={() => { setShowPicker(true); setShowTabPicker(false) }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
          >
            <Library size={12} strokeWidth={2} /> From library
          </button>
          <button
            onClick={addRow}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-tertiary)' }}
          >
            <Plus size={12} strokeWidth={2} /> Add row
          </button>
        </div>
        {showTabPicker && <div className="px-3 pb-1"><TabPickerDropdown /></div>}
        {showPicker && (
          <ProgressionPickerModal
            onSelect={addFromLibrary}
            onClose={() => setShowPicker(false)}
          />
        )}
      </>
    )
  }

  return (
    <div className="border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <button onClick={() => setCollapsed((c) => !c)} className="flex items-center gap-1 flex-1" style={{ color: 'var(--color-text-tertiary)' }}>
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          <span className="text-xs">Chord rows ({visibleCount}/{chordRows.length})</span>
        </button>
        <button
          onClick={() => { setShowTabPicker((p) => !p); setShowPicker(false) }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
        >
          <TableProperties size={12} strokeWidth={2} /> Tab
        </button>
        <button
          onClick={() => { setShowPicker(true); setShowTabPicker(false) }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
        >
          <Library size={12} strokeWidth={2} /> Library
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
          {showTabPicker && <TabPickerDropdown />}
          {chordRows.map((row) => {
            const isEditing = editingRowId === row.id
            const isHidden = row.visible === false
            const isTabRow = !!row.tabId
            const resolvedTab = isTabRow ? tabs.find((t) => t.id === row.tabId) : undefined
            return (
              <div
                key={row.id}
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: row.color && row.color !== 'transparent' ? `1px solid ${row.color}33` : '1px solid var(--color-border-subtle)',
                  opacity: isHidden ? 0.4 : 1,
                }}
              >
                {/* Row header */}
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <GripVertical size={14} style={{ color: 'var(--color-text-muted)' }} />
                  {row.fromLibrary && (
                    isTabRow
                      ? <TableProperties size={11} strokeWidth={2} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                      : <Library size={11} strokeWidth={2} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  )}
                  {row.label ? (
                    <span className="text-xs font-semibold" style={{ color: row.color && row.color !== 'transparent' ? row.color : 'var(--color-text-tertiary)', minWidth: 60 }}>
                      {row.label}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)', minWidth: 60 }}>no label</span>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => toggleVisibility(row.id)}
                    className="p-1 rounded transition-all"
                    style={{ color: isHidden ? 'var(--color-text-muted)' : 'var(--color-text-tertiary)' }}
                    title={isHidden ? 'Show row' : 'Hide row'}
                  >
                    {isHidden ? <EyeOff size={13} strokeWidth={2} /> : <Eye size={13} strokeWidth={2} />}
                  </button>
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
                    {!isTabRow && (
                      <input
                        type="text"
                        placeholder="Chords (e.g. G D Em C)"
                        value={row.chords.join(' ')}
                        onChange={(e) => updateRow(row.id, { chords: parseChordList(e.target.value) })}
                        className="w-full rounded-lg px-2 py-1.5 text-xs outline-none font-mono"
                        style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-chord)', border: 'none' }}
                      />
                    )}
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
                    {/* Dot colour — only for chord rows */}
                    {!isTabRow && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Dots:</span>
                        <button
                          onClick={() => updateRow(row.id, { dotColor: undefined })}
                          className="rounded-full flex-shrink-0 text-xs"
                          style={{ width: 18, height: 18, backgroundColor: 'var(--color-card-raised)', border: !row.dotColor ? '2px solid #fff' : '2px solid transparent', fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}
                          title="Use global setting"
                        >
                          A
                        </button>
                        {DOT_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateRow(row.id, { dotColor: c })}
                            className="rounded-full flex-shrink-0"
                            style={{
                              width: 18, height: 18,
                              backgroundColor: c,
                              border: row.dotColor === c ? '2px solid #fff' : '2px solid transparent',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content */}
                {!isHidden && isTabRow && (
                  resolvedTab
                    ? <div className="px-2 pb-2"><TabViewer tab={resolvedTab} /></div>
                    : <p className="text-xs px-3 pb-2" style={{ color: 'var(--color-text-muted)' }}>Tab was deleted from library.</p>
                )}

                {/* Chord diagrams — scrollable row (only when visible and not a tab row) */}
                {!isHidden && !isTabRow && row.chords.length > 0 && (
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
                          <DiagramComp chord={ch} dotColor={row.dotColor} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isHidden && !isTabRow && row.chords.length === 0 && !isEditing && (
                  <p className="text-xs px-3 pb-2" style={{ color: 'var(--color-text-muted)' }}>
                    Click "edit" to add chords
                  </p>
                )}

                {/* Comment below row */}
                {!isHidden && row.comment && (
                  <p className="text-xs px-3 pb-2" style={{ color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 4 }}>
                    {row.comment}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showPicker && (
        <ProgressionPickerModal
          onSelect={addFromLibrary}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
