import { getUkuleleChord } from '../lib/ukuleleChordData'
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

export function UkuleleDiagram({ chord, customDiagram, size = 120, dotColor = 'var(--color-accent)', flipped = false }: Props) {
  const voicing = customDiagram ?? getUkuleleChord(chord)

  if (!voicing) {
    return (
      <div
        className="flex items-center justify-center rounded-xl text-xs"
        style={{ width: size, height: size, backgroundColor: 'var(--color-card)', color: 'var(--color-text-muted)' }}
      >
        {chord}
      </div>
    )
  }

  const rawFrets = voicing.frets
  const rawFingers = voicing.fingers ?? []

  const frets = flipped ? [...rawFrets].reverse() : rawFrets
  const fingers = flipped ? [...rawFingers].reverse() : rawFingers

  const { baseFret = 1 } = voicing
  const showBaseFret = baseFret > 1

  const pad = 14
  const topPad = 22
  const bottomPad = voicing.comment ? 20 : 8
  const w = size
  const h = size + (showBaseFret ? 8 : 0)
  const gridW = w - pad * 2
  const gridH = h - topPad - bottomPad
  const stringGap = gridW / (STRING_COUNT - 1)
  const fretGap = gridH / FRET_COUNT
  const dotR = Math.min(stringGap, fretGap) * 0.32

  const fret1Strings = frets
    .map((f, i) => ({ f, i, finger: fingers[i] ?? 0 }))
    .filter((x) => x.f === 1 && x.finger === 1)
  const hasBarre = fret1Strings.length >= 3

  return (
    <svg width={w} height={h + (voicing.comment ? 16 : 0)} viewBox={`0 0 ${w} ${h + (voicing.comment ? 16 : 0)}`} style={{ overflow: 'visible' }}>
      {/* Chord name */}
      <text x={w / 2} y={13} textAnchor="middle" fontSize={13} fontWeight="700" fill="var(--color-diagram-text)" fontFamily="system-ui, sans-serif">
        {chord}
      </text>

      {/* Nut or base fret indicator */}
      {baseFret === 1 ? (
        <rect x={pad} y={topPad} width={gridW} height={3} rx={1.5} fill="var(--color-text-secondary)" />
      ) : (
        <text x={pad - 4} y={topPad + fretGap / 2 + 4} textAnchor="end" fontSize={9} fill="var(--color-text-tertiary)" fontFamily="system-ui, sans-serif">
          {baseFret}fr
        </text>
      )}

      {/* Fret lines */}
      {Array.from({ length: FRET_COUNT }).map((_, fi) => (
        <line key={fi} x1={pad} y1={topPad + (fi + 1) * fretGap} x2={pad + gridW} y2={topPad + (fi + 1) * fretGap} stroke="var(--color-diagram-stroke)" strokeWidth={1} />
      ))}

      {/* String lines */}
      {Array.from({ length: STRING_COUNT }).map((_, si) => (
        <line key={si} x1={pad + si * stringGap} y1={topPad} x2={pad + si * stringGap} y2={topPad + gridH} stroke="var(--color-diagram-stroke)" strokeWidth={1} />
      ))}

      {/* Barre bar */}
      {hasBarre && (
        <rect
          x={pad + fret1Strings[fret1Strings.length - 1].i * stringGap}
          y={topPad + fretGap * 0 + fretGap / 2 - dotR}
          width={(fret1Strings[0].i - fret1Strings[fret1Strings.length - 1].i) * stringGap}
          height={dotR * 2}
          rx={dotR}
          fill={dotColor}
        />
      )}

      {/* Muted / open string markers */}
      {frets.map((fret, si) => {
        const cx = pad + si * stringGap
        const cy = topPad - 7
        if (fret === -1) {
          return (
            <g key={si}>
              <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke="var(--color-diagram-fret)" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4} stroke="var(--color-diagram-fret)" strokeWidth={1.5} strokeLinecap="round" />
            </g>
          )
        }
        if (fret === 0) {
          return <circle key={si} cx={cx} cy={cy} r={4} stroke="var(--color-diagram-fret)" strokeWidth={1.5} fill="none" />
        }
        return null
      })}

      {/* Finger dots */}
      {frets.map((fret, si) => {
        if (fret <= 0) return null
        const cx = pad + si * stringGap
        const cy = topPad + (fret - 1) * fretGap + fretGap / 2
        const finger = fingers[si] ?? 0
        const isBarreDot = hasBarre && finger === 1 && fret === 1 && fret1Strings.length >= 3
        if (isBarreDot && fret1Strings.indexOf(fret1Strings.find((x) => x.i === si)!) > 0 &&
          fret1Strings.indexOf(fret1Strings.find((x) => x.i === si)!) < fret1Strings.length - 1) {
          return null
        }
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

      {/* Ukulele label (small GCEA tuning indicator) */}
      <text x={w / 2} y={h - 2} textAnchor="middle" fontSize={7} fill="var(--color-text-muted)" fontFamily="system-ui, sans-serif">
        uke
      </text>

      {/* Comment below diagram */}
      {voicing.comment && (
        <text
          x={w / 2}
          y={h + 12}
          textAnchor="middle"
          fontSize={9}
          fill="var(--color-text-tertiary)"
          fontFamily="system-ui, sans-serif"
        >
          {voicing.comment}
        </text>
      )}
    </svg>
  )
}
