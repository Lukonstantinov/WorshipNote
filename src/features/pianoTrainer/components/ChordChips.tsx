interface Props {
  chords: string[]
  romanNumerals: string[]
  onPick: (chord: string) => void
}

export function ChordChips({ chords, romanNumerals, onPick }: Props) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {chords.map((chord, idx) => (
        <button
          key={chord + idx}
          onClick={() => onPick(chord)}
          className="group flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, var(--color-card-raised) 0%, var(--color-card) 100%)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 1px 2px var(--color-shadow)',
            minHeight: 64,
            padding: '8px 4px',
          }}
        >
          <span
            className="text-[10px] font-semibold tracking-wider"
            style={{
              color: 'var(--color-accent)',
              opacity: 0.85,
              letterSpacing: '0.08em',
            }}
          >
            {romanNumerals[idx]}
          </span>
          <span
            className="font-bold leading-tight"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 18,
              marginTop: 2,
            }}
          >
            {chord}
          </span>
        </button>
      ))}
    </div>
  )
}

/** Roman numerals for the 7 diatonic triads. */
export const MAJOR_ROMANS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
export const MINOR_ROMANS = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
