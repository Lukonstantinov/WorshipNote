import { useState, useRef, useEffect } from 'react'
import { Plus, Minus, AlignJustify, X } from 'lucide-react'
import type { GuitarTab, TabColumn, TabInstrument } from '../types'
import {
  STRINGS_BY_INSTRUMENT,
  createEmptyColumn,
  createSeparatorColumn,
  generateAsciiTab,
} from '../lib/tabUtils'
import { generateId } from '../../../shared/lib/storage'

const INSTRUMENT_OPTIONS: { value: TabInstrument; label: string }[] = [
  { value: 'guitar', label: 'Guitar (6-string)' },
  { value: 'bass', label: 'Bass (4-string)' },
  { value: 'ukulele', label: 'Ukulele (4-string)' },
]

interface Props {
  initial?: GuitarTab
  onSave: (tab: Omit<GuitarTab, 'id' | 'createdAt'>) => void
  onCancel: () => void
  folders?: { id: string; name: string; color: string }[]
}

export function TabEditor({ initial, onSave, onCancel, folders = [] }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [instrument, setInstrument] = useState<TabInstrument>(initial?.instrument ?? 'guitar')
  const [columns, setColumns] = useState<TabColumn[]>(initial?.columns ?? [])
  const [description, setDescription] = useState(initial?.description ?? '')
  const [folderId, setFolderId] = useState(initial?.folderId ?? '')
  const [showPreview, setShowPreview] = useState(true)

  const strings = STRINGS_BY_INSTRUMENT[instrument]

  // When instrument changes, adapt columns to new string count
  const handleInstrumentChange = (newInstrument: TabInstrument) => {
    const newStringCount = STRINGS_BY_INSTRUMENT[newInstrument].length
    const oldStringCount = strings.length
    if (newStringCount === oldStringCount) {
      setInstrument(newInstrument)
      return
    }
    if (columns.length > 0) {
      if (!confirm('Changing instrument will reset the tab grid. Continue?')) return
    }
    setInstrument(newInstrument)
    setColumns([])
  }

  const addColumn = () => {
    setColumns((c) => [...c, createEmptyColumn(instrument)])
  }

  const addSeparator = () => {
    setColumns((c) => [...c, createSeparatorColumn()])
  }

  const removeLast = () => {
    setColumns((c) => c.slice(0, -1))
  }

  const setCell = (colIdx: number, strIdx: number, value: string) => {
    setColumns((cols) =>
      cols.map((col, ci) => {
        if (ci !== colIdx) return col
        const newCells = [...col.cells]
        if (value === '') {
          newCells[strIdx] = null
        } else if (/^\d+$/.test(value)) {
          newCells[strIdx] = parseInt(value, 10)
        } else {
          newCells[strIdx] = value
        }
        return { ...col, cells: newCells }
      })
    )
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a tab name.')
      return
    }
    onSave({
      name: name.trim(),
      instrument,
      columns,
      description: description.trim() || undefined,
      folderId: folderId || undefined,
    })
  }

  const draftTab: GuitarTab = {
    id: '', name, instrument, columns, createdAt: '',
  }

  return (
    <div
      className="flex flex-col gap-4 p-4"
      style={{ backgroundColor: 'var(--color-bg)', minHeight: '100%' }}
    >
      {/* Name + instrument row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tab name…"
          className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            backgroundColor: 'var(--color-input-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        <select
          value={instrument}
          onChange={(e) => handleInstrumentChange(e.target.value as TabInstrument)}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            backgroundColor: 'var(--color-input-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          {INSTRUMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={addColumn}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', minHeight: 36 }}
          title="Add note column"
        >
          <Plus size={13} strokeWidth={2.5} />
          Column
        </button>
        <button
          onClick={addSeparator}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', minHeight: 36 }}
          title="Add bar line"
        >
          <AlignJustify size={13} strokeWidth={2} />
          Bar line
        </button>
        <button
          onClick={removeLast}
          disabled={columns.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', minHeight: 36 }}
          title="Remove last column"
        >
          <Minus size={13} strokeWidth={2.5} />
          Remove
        </button>
        <button
          onClick={() => setShowPreview((p) => !p)}
          className="ml-auto px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{
            backgroundColor: showPreview ? 'var(--color-accent-dim)' : 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: showPreview ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            minHeight: 36,
          }}
        >
          Preview
        </button>
      </div>

      {/* Grid */}
      {columns.length === 0 ? (
        <div
          className="flex items-center justify-center py-10 rounded-2xl text-sm"
          style={{ backgroundColor: 'var(--color-card)', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          Add columns to start building your tab
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="border-separate" style={{ borderSpacing: 0 }}>
            <tbody>
              {strings.map((strName, strIdx) => (
                <tr key={strIdx}>
                  {/* String label */}
                  <td
                    className="pr-2 text-right font-mono text-xs font-bold select-none"
                    style={{ color: 'var(--color-chord)', paddingBottom: 2, paddingTop: 2, minWidth: 20 }}
                  >
                    {strName}
                  </td>
                  {/* Cells */}
                  {columns.map((col, colIdx) => {
                    if (col.isSeparator) {
                      return (
                        <td key={col.id} className="text-center px-0.5 font-mono text-sm select-none" style={{ color: 'var(--color-border)', paddingBottom: 2, paddingTop: 2 }}>
                          |
                        </td>
                      )
                    }
                    const cellVal = col.cells[strIdx]
                    const displayVal = cellVal === null ? '' : String(cellVal)
                    return (
                      <td key={col.id} style={{ paddingBottom: 2, paddingTop: 2 }}>
                        <input
                          value={displayVal}
                          onChange={(e) => setCell(colIdx, strIdx, e.target.value)}
                          placeholder="–"
                          maxLength={5}
                          className="text-center font-mono text-xs rounded outline-none transition-colors"
                          style={{
                            width: 36,
                            height: 30,
                            backgroundColor: displayVal ? 'var(--color-accent-dim)' : 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            color: displayVal ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            margin: '0 1px',
                          }}
                          onFocus={(e) => e.target.select()}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ASCII preview */}
      {showPreview && (
        <div
          className="rounded-2xl overflow-x-auto"
          style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}
        >
          <p className="px-4 pt-3 pb-1 text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
            Preview
          </p>
          <pre
            className="px-4 pb-3 text-xs leading-relaxed"
            style={{
              fontFamily: 'JetBrains Mono, Fira Code, Menlo, Courier New, monospace',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'pre',
              margin: 0,
            }}
          >
            {generateAsciiTab(draftTab)}
          </pre>
        </div>
      )}

      {/* Description + folder */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)…"
          className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            backgroundColor: 'var(--color-input-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
        {folders.length > 0 && (
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-input-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="">No folder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
        >
          Save Tab
        </button>
      </div>
    </div>
  )
}
