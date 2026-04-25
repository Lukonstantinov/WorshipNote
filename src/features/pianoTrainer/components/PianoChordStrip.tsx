import { useMemo } from 'react'
import { MiniPianoDiagram } from '../../songs/components/MiniPianoDiagram'
import { MiniBassPiano } from './MiniBassPiano'
import { useSettingsStore } from '../../../store/settingsStore'
import { getBassPattern } from '../lib/bassPatterns'
import type { TrainerLevel } from '../../../store/pianoTrainerStore'

interface Props {
  chords: string[]
  romanNumerals?: string[]
  focusedIndex: number
  onFocus: (idx: number) => void
  level: TrainerLevel
  bassPatternId: string
}

const PC_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function bassPitchClasses(chord: string, level: TrainerLevel, bassPatternId: string): string[] {
  if (level < 3) return []
  const patternKey = level === 3 ? 'root' : bassPatternId
  try {
    const notes = getBassPattern(patternKey).notesForBar(chord)
    const set = new Set<string>()
    for (const n of notes) set.add(PC_NAMES[((n.midi % 12) + 12) % 12])
    return Array.from(set)
  } catch {
    return []
  }
}

/**
 * Horizontal row of piano chord icons for a progression.
 * Per chord: a right-hand MiniPianoDiagram and (for Level ≥ 3) a left-hand
 * MiniBassPiano showing the bass pitch classes used by the current pattern.
 */
export function PianoChordStrip({ chords, romanNumerals, focusedIndex, onFocus, level, bassPatternId }: Props) {
  const { customPianoChords, pianoHighlightColor } = useSettingsStore()
  const showBass = level >= 3

  const bassPCsByIdx = useMemo(
    () => chords.map((c) => bassPitchClasses(c, level, bassPatternId)),
    [chords, level, bassPatternId]
  )

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
                {showBass && (
                  <div className="mt-1.5">
                    <MiniBassPiano
                      highlightedPCs={bassPCsByIdx[idx] ?? []}
                      size={80}
                      label="LH"
                    />
                  </div>
                )}
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
