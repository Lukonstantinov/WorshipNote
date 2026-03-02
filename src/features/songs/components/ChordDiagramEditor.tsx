import { useState } from 'react'
import { X, Save, Trash2 } from 'lucide-react'
import { useSettingsStore } from '../../../store/settingsStore'
import type { CustomChordDiagram } from '../types'
import { useTranslation } from 'react-i18next'

interface Props {
  chordName: string
  onClose: () => void
}

const STRING_COUNT = 6
const FRET_COUNT = 5

export function ChordDiagramEditor({ chordName, onClose }: Props) {
  const { t } = useTranslation()
  const { customChords, setCustomChord, deleteCustomChord } = useSettingsStore()
  const existing = customChords[chordName]

  const [frets, setFrets] = useState<number[]>(
    existing?.frets ?? Array(STRING_COUNT).fill(0)
  )
  const [fingers] = useState<number[]>(
    existing?.fingers ?? Array(STRING_COUNT).fill(0)
  )
  const [baseFret, setBaseFret] = useState(existing?.baseFret ?? 1)

  const toggleFret = (stringIdx: number, fretNum: number) => {
    setFrets((prev) => {
      const next = [...prev]
      if (next[stringIdx] === fretNum) {
        next[stringIdx] = 0 // toggle off → open
      } else {
        next[stringIdx] = fretNum
      }
      return next
    })
  }

  const cycleMuteOpen = (si: number) => {
    setFrets((prev) => {
      const next = [...prev]
      if (next[si] === -1) next[si] = 0
      else if (next[si] === 0) next[si] = -1
      return next
    })
  }

  const save = () => {
    const diagram: CustomChordDiagram = { frets, fingers, baseFret }
    setCustomChord(chordName, diagram)
    onClose()
  }

  const remove = () => {
    deleteCustomChord(chordName)
    onClose()
  }

  const pad = 28
  const topPad = 16
  const w = 220
  const h = 180
  const gridW = w - pad * 2
  const gridH = h - topPad - 12
  const stringGap = gridW / (STRING_COUNT - 1)
  const fretGap = gridH / FRET_COUNT
  const dotR = Math.min(stringGap, fretGap) * 0.35

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-2xl p-4 w-72"
        style={{ backgroundColor: '#1c1c1e' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-sm">{t('editChordDiagram')}: {chordName}</h3>
          <button onClick={onClose}>
            <X size={16} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.5)' }} />
          </button>
        </div>

        <p className="text-xs mb-2" style={{ color: 'rgba(235,235,245,0.4)' }}>
          Tap dots to set frets. Top icons: X = muted, O = open.
        </p>

        {/* Base fret */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs" style={{ color: 'rgba(235,235,245,0.4)' }}>Start fret:</span>
          <button onClick={() => setBaseFret((b) => Math.max(1, b - 1))} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#2c2c2e', color: '#fff' }}>−</button>
          <span className="text-white text-sm font-semibold w-4 text-center">{baseFret}</span>
          <button onClick={() => setBaseFret((b) => Math.min(12, b + 1))} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#2c2c2e', color: '#fff' }}>+</button>
        </div>

        {/* Interactive SVG */}
        <svg width={w} height={h} className="mx-auto block" style={{ cursor: 'pointer' }}>
          {/* Nut */}
          <rect x={pad} y={topPad} width={gridW} height={3} rx={1.5} fill="rgba(235,235,245,0.6)" />

          {/* Fret lines */}
          {Array.from({ length: FRET_COUNT }).map((_, fi) => (
            <line
              key={fi}
              x1={pad} y1={topPad + (fi + 1) * fretGap}
              x2={pad + gridW} y2={topPad + (fi + 1) * fretGap}
              stroke="rgba(235,235,245,0.15)" strokeWidth={1}
            />
          ))}

          {/* String lines */}
          {Array.from({ length: STRING_COUNT }).map((_, si) => (
            <line
              key={si}
              x1={pad + si * stringGap} y1={topPad}
              x2={pad + si * stringGap} y2={topPad + gridH}
              stroke="rgba(235,235,245,0.25)" strokeWidth={1}
            />
          ))}

          {/* Open/muted tap zones */}
          {Array.from({ length: STRING_COUNT }).map((_, si) => {
            const cx = pad + si * stringGap
            const cy = topPad - 8
            const isMuted = frets[si] === -1
            const isOpen = frets[si] === 0
            return (
              <g key={si} onClick={() => cycleMuteOpen(si)} style={{ cursor: 'pointer' }}>
                {isMuted ? (
                  <g>
                    <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke="rgba(235,235,245,0.6)" strokeWidth={1.5} strokeLinecap="round" />
                    <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4} stroke="rgba(235,235,245,0.6)" strokeWidth={1.5} strokeLinecap="round" />
                  </g>
                ) : isOpen ? (
                  <circle cx={cx} cy={cy} r={4} stroke="rgba(235,235,245,0.5)" strokeWidth={1.5} fill="none" />
                ) : (
                  <circle cx={cx} cy={cy} r={5} fill="rgba(235,235,245,0.1)" />
                )}
              </g>
            )
          })}

          {/* Clickable fret positions */}
          {Array.from({ length: STRING_COUNT }).map((_, si) =>
            Array.from({ length: FRET_COUNT }).map((_, fi) => {
              const cx = pad + si * stringGap
              const cy = topPad + fi * fretGap + fretGap / 2
              const isActive = frets[si] === fi + 1
              return (
                <g
                  key={`${si}-${fi}`}
                  onClick={() => toggleFret(si, fi + 1)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={cx} cy={cy} r={dotR + 4} fill="transparent" />
                  {isActive && (
                    <circle cx={cx} cy={cy} r={dotR} fill="#bf5af2" />
                  )}
                  {!isActive && (
                    <circle cx={cx} cy={cy} r={3} fill="rgba(255,255,255,0.05)" />
                  )}
                </g>
              )
            })
          )}
        </svg>

        <div className="flex gap-2 mt-3">
          <button
            onClick={save}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: '#bf5af2', color: '#fff' }}
          >
            <Save size={14} strokeWidth={2} />
            {t('save')}
          </button>
          {existing && (
            <button
              onClick={remove}
              className="flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{ backgroundColor: '#2c2c2e', minWidth: 44 }}
            >
              <Trash2 size={16} strokeWidth={1.5} style={{ color: '#ff453a' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
