interface Props {
  /** Pitch classes to highlight, e.g. ['C', 'G']. */
  highlightedPCs: string[]
  size?: number
  label?: string
}

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BLACK_KEY_POSITIONS = [0.5, 1.5, 3.5, 4.5, 5.5]
const BLACK_KEY_NAMES = ['C#', 'D#', 'F#', 'G#', 'A#']

/** Compact 1-octave piano showing LH bass notes highlighted in blue (no chord label). */
export function MiniBassPiano({ highlightedPCs, size = 80, label }: Props) {
  const set = new Set(highlightedPCs)

  const WHITE_COUNT = 8
  const w = size
  const h = size * 0.55
  const wKeyW = w / WHITE_COUNT
  const wKeyH = h
  const bKeyW = wKeyW * 0.6
  const bKeyH = h * 0.6

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span
          className="text-[9px] font-bold mb-0.5"
          style={{ color: 'var(--color-info)', letterSpacing: '0.05em' }}
        >
          {label}
        </span>
      )}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {Array.from({ length: WHITE_COUNT }).map((_, i) => {
          const note = WHITE_KEYS[i % 7]
          const hi = set.has(note)
          return (
            <rect
              key={i}
              x={i * wKeyW + 0.5}
              y={0.5}
              width={wKeyW - 1}
              height={wKeyH - 1}
              rx={1}
              fill={hi ? 'var(--color-info)' : 'var(--color-piano-white)'}
              stroke="var(--color-piano-stroke)"
              strokeWidth={0.5}
            />
          )
        })}
        {BLACK_KEY_POSITIONS.map((pos, bi) => {
          const name = BLACK_KEY_NAMES[bi]
          const hi = set.has(name)
          const x = pos * wKeyW + wKeyW / 2 - bKeyW / 2
          return (
            <rect
              key={bi}
              x={x}
              y={0}
              width={bKeyW}
              height={bKeyH}
              rx={1}
              fill={hi ? 'var(--color-info)' : 'var(--color-piano-black)'}
            />
          )
        })}
      </svg>
    </div>
  )
}
