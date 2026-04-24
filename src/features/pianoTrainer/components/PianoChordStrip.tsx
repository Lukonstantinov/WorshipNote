import { MiniPianoDiagram } from '../../songs/components/MiniPianoDiagram'
import { useSettingsStore } from '../../../store/settingsStore'

interface Props {
  chords: string[]
  romanNumerals?: string[]
  focusedIndex: number
  onFocus: (idx: number) => void
}

/**
 * Horizontal row of piano chord icons for a progression — one MiniPianoDiagram per chord.
 * Mirrors the style used in the Chord Library progression view.
 */
export function PianoChordStrip({ chords, romanNumerals, focusedIndex, onFocus }: Props) {
  const { customPianoChords, pianoHighlightColor } = useSettingsStore()

  if (chords.length === 0) {
    return (
      <div
        className="rounded-2xl py-8 text-center text-sm"
        style={{
          background: 'linear-gradient(135deg, var(--color-card) 0%, var(--color-card-raised) 100%)',
          color: 'var(--color-text-muted)',
          border: '1px dashed var(--color-border)',
        }}
      >
        Your chord diagrams will appear here once you add chords to the progression.
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--color-card) 0%, var(--color-card-raised) 100%)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px var(--color-shadow)',
      }}
    >
      <div className="overflow-x-auto scrollbar-none" style={{ padding: '14px 12px' }}>
        <div className="flex items-stretch gap-2 min-w-min">
          {chords.map((chord, idx) => {
            const isFocused = idx === focusedIndex
            const roman = romanNumerals?.[idx]
            return (
              <button
                key={`${chord}-${idx}`}
                onClick={() => onFocus(idx)}
                className="flex-shrink-0 flex flex-col items-center justify-start rounded-2xl transition-all active:scale-95"
                style={{
                  background: isFocused
                    ? 'linear-gradient(135deg, var(--color-accent-dim) 0%, var(--color-card-raised) 100%)'
                    : 'var(--color-card-raised)',
                  border: isFocused
                    ? '1px solid var(--color-accent)'
                    : '1px solid var(--color-border)',
                  boxShadow: isFocused
                    ? '0 0 0 3px var(--color-accent-dim)'
                    : '0 1px 2px var(--color-shadow)',
                  padding: '10px 10px 8px',
                  minWidth: 100,
                }}
              >
                {roman && (
                  <span
                    className="text-[10px] font-semibold tracking-wider mb-1"
                    style={{
                      color: isFocused ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {roman}
                  </span>
                )}
                <MiniPianoDiagram
                  chord={chord}
                  customDiagram={customPianoChords[chord]}
                  size={80}
                  highlightColor={pianoHighlightColor}
                />
                <span
                  className="font-bold mt-1"
                  style={{
                    fontSize: 16,
                    color: isFocused ? 'var(--color-accent)' : 'var(--color-text-primary)',
                  }}
                >
                  {chord}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
