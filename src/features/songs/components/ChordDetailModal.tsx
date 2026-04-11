import { X, Pencil } from 'lucide-react'
import { GuitarDiagram } from './GuitarDiagram'
import { BassDiagram } from './BassDiagram'
import { PianoDiagram } from './PianoDiagram'
import { UkuleleDiagram } from './UkuleleDiagram'
import { MiniGuitarDiagram } from './MiniGuitarDiagram'
import { MiniPianoDiagram } from './MiniPianoDiagram'
import { MiniBassDiagram } from './MiniBassDiagram'
import { getGuitarChord } from '../lib/chordData'
import type { CustomChordDiagram, CustomPianoChordDiagram } from '../types'
import { useSettingsStore } from '../../../store/settingsStore'

interface Props {
  chord: string
  instrument: 'guitar' | 'bass' | 'piano' | 'ukulele'
  customDiagram?: CustomChordDiagram
  customPianoDiagram?: CustomPianoChordDiagram
  dotColor?: string
  pianoColor?: string
  flipped?: boolean
  onClose: () => void
  onEdit?: () => void
  onBuildProgression?: (chords: string[]) => void
}

/**
 * Suggest common chord progressions that include the given chord.
 * Returns pairs of [name, chords[]] arrays.
 */
function suggestProgressions(chord: string): [string, string[]][] {
  // Parse the root and quality
  const match = chord.match(/^([A-G][b#]?)(m|min|maj|dim|aug|sus|7|m7|maj7)?/)
  if (!match) return []
  const root = match[1]
  const quality = match[2] ?? ''
  const isMinor = quality === 'm' || quality === 'min'

  // Note names for scale building
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const FLAT_MAP: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' }
  const SHARP_TO_FLAT: Record<string, string> = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'F#', 'G#': 'Ab', 'A#': 'Bb' }

  const rootIdx = NOTES.indexOf(FLAT_MAP[root] ?? root)
  if (rootIdx < 0) return []

  const note = (semitones: number) => {
    const n = NOTES[(rootIdx + semitones) % 12]
    // Prefer flats if the root uses flat
    if (root.includes('b') && SHARP_TO_FLAT[n]) return SHARP_TO_FLAT[n]
    return n
  }

  const results: [string, string[]][] = []

  if (isMinor) {
    // Minor key progressions
    const i = root + 'm'
    const III = note(3)
    const iv = note(5) + 'm'
    const v = note(7) + 'm'
    const V = note(7)
    const VI = note(8)
    const VII = note(10)

    results.push(
      ['i - iv - v - i (Natural minor)', [i, iv, v, i]],
      ['i - iv - V - i (Harmonic minor)', [i, iv, V, i]],
      ['i - VI - III - VII (Epic minor)', [i, VI, III, VII]],
      ['i - III - VII - VI (Worship minor)', [i, III, VII, VI]],
    )
  } else {
    // Major key progressions
    const I = root
    const ii = note(2) + 'm'
    const iii = note(4) + 'm'
    const IV = note(5)
    const V = note(7)
    const vi = note(9) + 'm'

    results.push(
      ['I - IV - V - I (Classic)', [I, IV, V, I]],
      ['I - V - vi - IV (Pop/Worship)', [I, V, vi, IV]],
      ['I - vi - IV - V (50s / Doo-wop)', [I, vi, IV, V]],
      ['vi - IV - I - V (Emotional)', [vi, IV, I, V]],
      ['I - IV - vi - V (Modern worship)', [I, IV, vi, V]],
      ['I - iii - IV - V (Ascending)', [I, iii, IV, V]],
      ['ii - V - I (Jazz cadence)', [ii, V, I]],
    )
  }

  return results
}

export function ChordDetailModal({
  chord,
  instrument,
  customDiagram,
  customPianoDiagram,
  dotColor = 'var(--color-accent)',
  pianoColor,
  flipped = false,
  onClose,
  onEdit,
  onBuildProgression,
}: Props) {
  const progressions = suggestProgressions(chord)
  const { customChords, customPianoChords, guitarDotColor, pianoHighlightColor, guitarFlipped } = useSettingsStore()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-sm mx-4 overflow-hidden max-h-[85vh] flex flex-col"
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-chord)' }}>{chord}</h3>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={onEdit} className="p-2 rounded-xl hover-bg" title="Edit diagram">
                <Pencil size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            )}
            <button onClick={onClose} style={{ color: 'var(--color-text-tertiary)' }}>
              <X size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Diagram (large) */}
        <div className="flex justify-center py-4 flex-shrink-0" style={{ backgroundColor: 'var(--color-bg)' }}>
          {instrument === 'guitar' && (
            <GuitarDiagram
              chord={chord}
              customDiagram={customDiagram ?? getGuitarChord(chord) ?? undefined}
              size={200}
              dotColor={dotColor}
              flipped={flipped}
            />
          )}
          {instrument === 'bass' && (
            <BassDiagram
              chord={chord}
              customDiagram={customDiagram}
              size={200}
              dotColor={dotColor}
              flipped={flipped}
            />
          )}
          {instrument === 'piano' && (
            <PianoDiagram
              chord={chord}
              customDiagram={customPianoDiagram}
              size={240}
              highlightColor={pianoColor}
            />
          )}
          {instrument === 'ukulele' && (
            <UkuleleDiagram
              chord={chord}
              customDiagram={customDiagram}
              size={200}
              dotColor={dotColor}
              flipped={flipped}
            />
          )}
        </div>

        {/* Suggested progressions */}
        {progressions.length > 0 && (
          <div className="flex-1 overflow-y-auto border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                Common Progressions
              </p>
            </div>
            <div className="px-4 pb-4 space-y-2">
              {progressions.map(([name, chords], i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 rounded-xl transition-all active:scale-[0.98] hover-bg"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border-subtle)' }}
                  onClick={() => {
                    if (onBuildProgression) onBuildProgression(chords)
                    onClose()
                  }}
                >
                  <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>{name}</p>
                  <div className="flex items-end gap-1.5 overflow-x-auto scrollbar-none">
                    {chords.map((c, j) => (
                      <span key={j} className="flex items-center gap-1 flex-shrink-0">
                        <span className="flex flex-col items-center gap-1">
                          {instrument === 'piano' ? (
                            <MiniPianoDiagram chord={c} customDiagram={customPianoChords[c]} size={52} highlightColor={pianoHighlightColor} />
                          ) : instrument === 'bass' ? (
                            <MiniBassDiagram chord={c} customDiagram={customChords[c]} size={52} dotColor={guitarDotColor} flipped={guitarFlipped} />
                          ) : (
                            <MiniGuitarDiagram chord={c} customDiagram={customChords[c]} size={52} dotColor={guitarDotColor} flipped={guitarFlipped} />
                          )}
                          <span className="text-xs font-bold" style={{ color: 'var(--color-chord)' }}>{c}</span>
                        </span>
                        {j < chords.length - 1 && (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 11, marginBottom: 14 }}>→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
