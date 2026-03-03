import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { generateId } from '../../../shared/lib/storage'

export interface BarProgression {
  id: string
  name: string
  bars: BarCell[][]
  beatsPerBar: number
}

export interface BarCell {
  chord: string
}

interface Props {
  progressions: BarProgression[]
  onChange: (progressions: BarProgression[]) => void
}

export function BarProgressions({ progressions, onChange }: Props) {
  const { t } = useTranslation()
  const [expandedId, setExpandedId] = useState<string | null>(
    progressions.length > 0 ? progressions[0].id : null
  )
  const [editingCellId, setEditingCellId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const addProgression = () => {
    const newProg: BarProgression = {
      id: generateId(),
      name: t('progressionDefault', { n: progressions.length + 1 }),
      bars: [[{ chord: '' }, { chord: '' }, { chord: '' }, { chord: '' }]],
      beatsPerBar: 4,
    }
    onChange([...progressions, newProg])
    setExpandedId(newProg.id)
  }

  const deleteProgression = (id: string) => {
    onChange(progressions.filter((p) => p.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const updateProgression = (id: string, updates: Partial<BarProgression>) => {
    onChange(progressions.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const addBar = (progId: string) => {
    const prog = progressions.find((p) => p.id === progId)
    if (!prog) return
    const beats = prog.beatsPerBar
    const newBar: BarCell[] = Array.from({ length: beats }, () => ({ chord: '' }))
    updateProgression(progId, { bars: [...prog.bars, newBar] })
  }

  const deleteBar = (progId: string, barIdx: number) => {
    const prog = progressions.find((p) => p.id === progId)
    if (!prog || prog.bars.length <= 1) return
    updateProgression(progId, { bars: prog.bars.filter((_, i) => i !== barIdx) })
  }

  const updateCell = (progId: string, barIdx: number, beatIdx: number, chord: string) => {
    const prog = progressions.find((p) => p.id === progId)
    if (!prog) return
    const newBars = prog.bars.map((bar, bi) =>
      bi === barIdx
        ? bar.map((cell, ci) => (ci === beatIdx ? { ...cell, chord } : cell))
        : bar
    )
    updateProgression(progId, { bars: newBars })
  }

  const cellId = (progId: string, barIdx: number, beatIdx: number) =>
    `${progId}-${barIdx}-${beatIdx}`

  return (
    <div className="border-t" style={{ borderColor: '#1c1c1e' }}>
      <div className="px-4 py-3 flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t('barProgressions')}
        </p>
        <button
          onClick={addProgression}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95"
          style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.6)' }}
        >
          <Plus size={12} strokeWidth={2.5} />
          {t('addProgression')}
        </button>
      </div>

      {progressions.map((prog) => {
        const isExpanded = expandedId === prog.id
        return (
          <div key={prog.id} className="mx-4 mb-3 rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : prog.id)}
              className="w-full flex items-center gap-2 px-4 py-3 transition-all hover:bg-white/5"
            >
              <GripVertical size={14} style={{ color: 'rgba(235,235,245,0.2)' }} />
              <input
                value={prog.name}
                onChange={(e) => updateProgression(prog.id, { name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent text-sm font-medium text-white outline-none"
              />
              <button
                onClick={(e) => { e.stopPropagation(); deleteProgression(prog.id) }}
                className="p-1"
              >
                <Trash2 size={13} style={{ color: '#ff453a' }} />
              </button>
              {isExpanded ? (
                <ChevronUp size={14} style={{ color: 'rgba(235,235,245,0.4)' }} />
              ) : (
                <ChevronDown size={14} style={{ color: 'rgba(235,235,245,0.4)' }} />
              )}
            </button>

            {/* Expanded grid */}
            {isExpanded && (
              <div className="px-4 pb-4">
                {/* Beats per bar selector */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs" style={{ color: 'rgba(235,235,245,0.4)' }}>
                    {t('beatsPerBar')}
                  </span>
                  <div className="flex gap-1">
                    {[2, 3, 4, 6, 8].map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          const newBars = prog.bars.map((bar) => {
                            if (bar.length === b) return bar
                            if (bar.length < b) return [...bar, ...Array.from({ length: b - bar.length }, () => ({ chord: '' }))]
                            return bar.slice(0, b)
                          })
                          updateProgression(prog.id, { beatsPerBar: b, bars: newBars })
                        }}
                        className="px-2 py-1 rounded text-xs font-semibold transition-all"
                        style={{
                          backgroundColor: prog.beatsPerBar === b ? '#0a84ff' : '#2c2c2e',
                          color: prog.beatsPerBar === b ? '#fff' : 'rgba(235,235,245,0.4)',
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bar grid */}
                <div className="space-y-2">
                  {prog.bars.map((bar, barIdx) => (
                    <div key={barIdx} className="flex items-center gap-1">
                      <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: 'rgba(235,235,245,0.2)' }}>
                        {barIdx + 1}
                      </span>
                      <div
                        className="flex-1 grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${bar.length}, 1fr)` }}
                      >
                        {bar.map((cell, beatIdx) => {
                          const cId = cellId(prog.id, barIdx, beatIdx)
                          const isEditing = editingCellId === cId
                          return (
                            <div
                              key={beatIdx}
                              className="rounded-lg flex items-center justify-center transition-all cursor-pointer"
                              style={{
                                backgroundColor: cell.chord ? '#32d74b15' : '#2c2c2e',
                                border: isEditing ? '1px solid #32d74b' : '1px solid transparent',
                                minHeight: 40,
                              }}
                              onClick={() => {
                                setEditingCellId(cId)
                                setEditingValue(cell.chord)
                              }}
                            >
                              {isEditing ? (
                                <input
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onBlur={() => {
                                    updateCell(prog.id, barIdx, beatIdx, editingValue.trim())
                                    setEditingCellId(null)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateCell(prog.id, barIdx, beatIdx, editingValue.trim())
                                      setEditingCellId(null)
                                    }
                                    if (e.key === 'Escape') setEditingCellId(null)
                                    if (e.key === 'Tab') {
                                      e.preventDefault()
                                      updateCell(prog.id, barIdx, beatIdx, editingValue.trim())
                                      // Move to next cell
                                      const nextBeat = beatIdx + 1
                                      const nextBar = barIdx + (nextBeat >= bar.length ? 1 : 0)
                                      const nextBeatIdx = nextBeat >= bar.length ? 0 : nextBeat
                                      if (nextBar < prog.bars.length) {
                                        const nId = cellId(prog.id, nextBar, nextBeatIdx)
                                        setEditingCellId(nId)
                                        setEditingValue(prog.bars[nextBar][nextBeatIdx].chord)
                                      } else {
                                        setEditingCellId(null)
                                      }
                                    }
                                  }}
                                  className="w-full h-full bg-transparent text-center text-sm font-semibold outline-none"
                                  style={{ color: '#32d74b' }}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: cell.chord ? '#32d74b' : 'rgba(235,235,245,0.15)' }}
                                >
                                  {cell.chord || '·'}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <button
                        onClick={() => deleteBar(prog.id, barIdx)}
                        className="p-1 flex-shrink-0 opacity-30 hover:opacity-100 transition-opacity"
                        disabled={prog.bars.length <= 1}
                      >
                        <Trash2 size={11} style={{ color: '#ff453a' }} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add bar button */}
                <button
                  onClick={() => addBar(prog.id)}
                  className="w-full mt-2 py-2 rounded-xl text-xs font-medium transition-all active:scale-95"
                  style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.4)' }}
                >
                  <Plus size={12} strokeWidth={2.5} className="inline mr-1" style={{ verticalAlign: 'middle' }} />
                  {t('addBar')}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
