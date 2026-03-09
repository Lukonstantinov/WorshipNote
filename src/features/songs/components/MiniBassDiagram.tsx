import { getBassChord } from '../lib/bassChordData'
import type { CustomChordDiagram } from '../types'

interface Props {
  chord: string
  customDiagram?: CustomChordDiagram
  size?: number
  dotColor?: string
  flipped?: boolean
}

const STRING_COUNT = 4
const FRET_COUNT = 4

export function MiniBassDiagram({ chord, customDiagram, size = 56, dotColor = 'var(--color-accent)', flipped = false }: Props) {
  const voicing = customDiagram ?? getBassChord(chord)

  const pad = 6
  const topPad = 14
  const bottomPad = 2
  const w = size
  const h = size
  const gridW = w - pad * 2
  const gridH = h - topPad - bottomPad
  const stringGap = gridW / (STRING_COUNT - 1)
  const fretGap = gridH / FRET_COUNT
  const dotR = Math.min(stringGap, fretGap) * 0.3

  const strings = voicing
    ? (flipped ? [...voicing.frets].reverse() : voicing.frets)
    : null

  return (
    <div className="flex flex-col items-center">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <text x={w / 2} y={10} textAnchor="middle" fontSize={9} fontWeight="700" fill="var(--color-chord)" fontFamily="system-ui, sans-serif">
          {chord}
        </text>

        {/* Nut */}
        <rect x={pad} y={topPad} width={gridW} height={2} rx={1} fill="var(--color-text-secondary)" />

        {/* Fret lines */}
        {Array.from({ length: FRET_COUNT }).map((_, fi) => (
          <line key={fi} x1={pad} y1={topPad + (fi + 1) * fretGap} x2={pad + gridW} y2={topPad + (fi + 1) * fretGap} stroke="var(--color-diagram-stroke)" strokeWidth={0.5} />
        ))}

        {/* String lines */}
        {Array.from({ length: STRING_COUNT }).map((_, si) => (
          <line key={si} x1={pad + si * stringGap} y1={topPad} x2={pad + si * stringGap} y2={topPad + gridH} stroke="var(--color-diagram-stroke)" strokeWidth={0.5} />
        ))}

        {/* Finger dots */}
        {(strings ?? []).map((fret, si) => {
          if (fret <= 0) return null
          const displayFret = Math.min(fret, FRET_COUNT)
          const cx = pad + si * stringGap
          const cy = topPad + (displayFret - 1) * fretGap + fretGap / 2
          return <circle key={si} cx={cx} cy={cy} r={dotR} fill={dotColor} />
        })}

        {/* Muted strings */}
        {(strings ?? []).map((fret, si) => {
          if (fret !== -1) return null
          const cx = pad + si * stringGap
          return (
            <g key={si}>
              <line x1={cx - 2} y1={topPad - 5} x2={cx + 2} y2={topPad - 1} stroke="var(--color-diagram-fret)" strokeWidth={1} strokeLinecap="round" />
              <line x1={cx + 2} y1={topPad - 5} x2={cx - 2} y2={topPad - 1} stroke="var(--color-diagram-fret)" strokeWidth={1} strokeLinecap="round" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
