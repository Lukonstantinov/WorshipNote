interface Props {
  chords: string[]
  romanNumerals: string[]
  onPick: (chord: string) => void
}

export function ChordChips({ chords, romanNumerals, onPick }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {chords.map((chord, idx) => (
        <button
          key={chord + idx}
          onClick={() => onPick(chord)}
          className="flex flex-col items-center px-3 py-2 rounded-xl transition-all active:scale-95"
          style={{
            backgroundColor: 'var(--color-card-raised)',
            border: '1px solid var(--color-border)',
            minWidth: 58,
            minHeight: 50,
          }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--color-accent)', fontSize: 10, letterSpacing: '0.04em' }}>
            {romanNumerals[idx]}
          </span>
          <span className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
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
