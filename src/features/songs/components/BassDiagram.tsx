import type { CustomChordDiagram } from '../types'

interface Props {
  chord: string
  customDiagram?: CustomChordDiagram
  size?: number
  dotColor?: string
  flipped?: boolean
}

const STRING_COUNT = 4
const FRET_COUNT = 5

export function BassDiagram({ chord, customDiagram, size = 120, dotColor = '#bf5af2', flipped = false }: Props) {
  const voicing = customDiagram

  const pad = 14
  const topPad = 22
  const bottomPad = 8
  const w = size
  const h = size + (voicing?.baseFret && voicing.baseFret > 1 ? 8 : 0)
  const gridW = w - pad * 2
  const gridH = h - topPad - bottomPad
  const stringGap = gridW / (STRING_COUNT - 1)
  const fretGap = gridH / FRET_COUNT
  const dotR = Math.min(stringGap, fretGap) * 0.32

  const strings = voicing
    ? (flipped ? [...voicing.frets].reverse() : voicing.frets)
    : null

  if (!voicing) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
        <text x={w / 2} y={13} textAnchor="middle" fontSize={13} fontWeight="700" fill="#ffffff" fontFamily="system-ui, sans-serif">
          {chord}
        </text>
        {/* Empty bass fretboard */}
        <rect x={pad} y={topPad} width={gridW} height={3} rx={1.5} fill="rgba(235,235,245,0.7)" />
        {Array.from({ length: FRET_COUNT }).map((_, fi) => (
          <line key={fi} x1={pad} y1={topPad + (fi + 1) * fretGap} x2={pad + gridW} y2={topPad + (fi + 1) * fretGap} stroke="rgba(235,235,245,0.15)" strokeWidth={1} />
        ))}
        {Array.from({ length: STRING_COUNT }).map((_, si) => (
          <line key={si} x1={pad + si * stringGap} y1={topPad} x2={pad + si * stringGap} y2={topPad + gridH} stroke="rgba(235,235,245,0.25)" strokeWidth={1} />
        ))}
        <text x={w / 2} y={topPad + gridH / 2 + 5} textAnchor="middle" fontSize={9} fill="rgba(235,235,245,0.3)" fontFamily="system-ui, sans-serif">
          bass
        </text>
      </svg>
    )
  }

  const { fingers = [], baseFret = 1 } = voicing
  const showBaseFret = baseFret > 1

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      {/* Chord name */}
      <text x={w / 2} y={13} textAnchor="middle" fontSize={13} fontWeight="700" fill="#ffffff" fontFamily="system-ui, sans-serif">
        {chord}
      </text>

      {/* Nut or base fret indicator */}
      {baseFret === 1 ? (
        <rect x={pad} y={topPad} width={gridW} height={3} rx={1.5} fill="rgba(235,235,245,0.7)" />
      ) : (
        <text x={pad - 4} y={topPad + fretGap / 2 + 4} textAnchor="end" fontSize={9} fill="rgba(235,235,245,0.5)" fontFamily="system-ui, sans-serif">
          {baseFret}fr
        </text>
      )}

      {/* Fret lines */}
      {Array.from({ length: FRET_COUNT }).map((_, fi) => (
        <line key={fi} x1={pad} y1={topPad + (fi + 1) * fretGap} x2={pad + gridW} y2={topPad + (fi + 1) * fretGap} stroke="rgba(235,235,245,0.15)" strokeWidth={1} />
      ))}

      {/* String lines */}
      {Array.from({ length: STRING_COUNT }).map((_, si) => (
        <line key={si} x1={pad + si * stringGap} y1={topPad} x2={pad + si * stringGap} y2={topPad + gridH} stroke="rgba(235,235,245,0.25)" strokeWidth={si === 0 ? 2 : 1} />
      ))}

      {/* Muted / open string markers */}
      {(strings ?? []).map((fret, si) => {
        const cx = pad + si * stringGap
        const cy = topPad - 7
        if (fret === -1) {
          return (
            <g key={si}>
              <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke="rgba(235,235,245,0.4)" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4} stroke="rgba(235,235,245,0.4)" strokeWidth={1.5} strokeLinecap="round" />
            </g>
          )
        }
        if (fret === 0) {
          return <circle key={si} cx={cx} cy={cy} r={4} stroke="rgba(235,235,245,0.5)" strokeWidth={1.5} fill="none" />
        }
        return null
      })}

      {/* Finger dots */}
      {(strings ?? []).map((fret, si) => {
        if (fret <= 0) return null
        const cx = pad + si * stringGap
        const cy = topPad + (fret - 1) * fretGap + fretGap / 2
        const finger = fingers[si] ?? 0
        return (
          <g key={si}>
            <circle cx={cx} cy={cy} r={dotR} fill={dotColor} />
            {finger > 0 && (
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize={dotR * 1.1} fill="#fff" fontWeight="700" fontFamily="system-ui, sans-serif">
                {finger}
              </text>
            )}
          </g>
        )
      })}

      {/* Comment */}
      {voicing.comment && (
        <text
          x={w / 2}
          y={showBaseFret ? h - 2 : topPad + gridH + 14}
          textAnchor="middle"
          fontSize={9}
          fill="rgba(235,235,245,0.5)"
          fontFamily="system-ui, sans-serif"
        >
          {voicing.comment}
        </text>
      )}
    </svg>
  )
}
