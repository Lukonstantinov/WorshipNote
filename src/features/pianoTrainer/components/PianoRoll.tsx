import { useMemo } from 'react'
import { pickVoicing, type Voicing } from '../lib/voicings'
import { getBassPattern, type BassNote } from '../lib/bassPatterns'
import type { TrainerLevel } from '../../../store/pianoTrainerStore'

interface Props {
  progression: string[]
  level: TrainerLevel
  bassPatternId: string
  /** Beat index (float, 0-based) of the playhead. -1 to hide. */
  playheadBeat?: number
  /** Focus highlight on a single bar (chord index). -1 to disable. */
  focusIndex?: number
}

interface BarData {
  chord: string
  rhNotes: number[]
  rhFingers: number[]
  lhNotes: BassNote[]
}

const ROW_HEIGHT = 12
const BEAT_WIDTH = 36
const BAR_WIDTH = BEAT_WIDTH * 4
const LABEL_COL_W = 40
const CHORD_LABEL_H = 26

const BLACK_KEY_PCS = new Set([1, 3, 6, 8, 10])
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12
}

function isBlack(midi: number): boolean {
  return BLACK_KEY_PCS.has(pitchClass(midi))
}

function midiLabel(midi: number): string {
  return NOTE_NAMES[pitchClass(midi)] + (Math.floor(midi / 12) - 1)
}

function buildBars(progression: string[], level: TrainerLevel, bassPatternId: string): BarData[] {
  const bars: BarData[] = []
  let prev: Voicing | null = null
  for (const chord of progression) {
    let voicing: Voicing
    try {
      voicing = pickVoicing(chord, prev, level === 1 ? 1 : 2)
    } catch {
      continue
    }
    prev = voicing

    let lhNotes: BassNote[] = []
    if (level === 3) {
      lhNotes = getBassPattern('root').notesForBar(chord)
    } else if (level === 4) {
      try {
        lhNotes = getBassPattern(bassPatternId).notesForBar(chord)
      } catch {
        lhNotes = getBassPattern('root').notesForBar(chord)
      }
    }
    bars.push({ chord, rhNotes: voicing.notes, rhFingers: voicing.fingers, lhNotes })
  }
  return bars
}

export function PianoRoll({ progression, level, bassPatternId, playheadBeat = -1, focusIndex = -1 }: Props) {
  const bars = useMemo(
    () => buildBars(progression, level, bassPatternId),
    [progression, level, bassPatternId]
  )

  if (bars.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center text-sm"
        style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-muted)' }}
      >
        Your piano roll will appear here once you add chords to the progression.
      </div>
    )
  }

  // Pitch range: find min/max used, pad, clamp to a musical range.
  const allMidis: number[] = []
  for (const b of bars) {
    for (const n of b.rhNotes) allMidis.push(n)
    for (const n of b.lhNotes) allMidis.push(n.midi)
  }
  const rawMin = Math.min(...allMidis)
  const rawMax = Math.max(...allMidis)
  const minMidi = Math.max(24, rawMin - 2)
  const maxMidi = Math.min(96, rawMax + 2)
  const pitchCount = maxMidi - minMidi + 1

  const rollHeight = pitchCount * ROW_HEIGHT
  const totalHeight = CHORD_LABEL_H + rollHeight
  const totalWidth = LABEL_COL_W + bars.length * BAR_WIDTH

  const yOf = (midi: number) => CHORD_LABEL_H + (maxMidi - midi) * ROW_HEIGHT

  const RH_FILL = 'var(--color-chord)'
  const LH_FILL = 'var(--color-info)'
  const NOTE_TEXT = '#000'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
        <svg
          width={totalWidth}
          height={totalHeight}
          style={{ display: 'block', minWidth: '100%' }}
        >
          {/* Pitch row stripes */}
          {Array.from({ length: pitchCount }).map((_, i) => {
            const midi = maxMidi - i
            const y = CHORD_LABEL_H + i * ROW_HEIGHT
            return (
              <rect
                key={midi}
                x={0}
                y={y}
                width={totalWidth}
                height={ROW_HEIGHT}
                fill={isBlack(midi) ? 'var(--color-card-raised)' : 'var(--color-card)'}
                opacity={0.55}
              />
            )
          })}

          {/* Horizontal pitch lines */}
          {Array.from({ length: pitchCount + 1 }).map((_, i) => (
            <line
              key={i}
              x1={0}
              x2={totalWidth}
              y1={CHORD_LABEL_H + i * ROW_HEIGHT}
              y2={CHORD_LABEL_H + i * ROW_HEIGHT}
              stroke="var(--color-border-subtle)"
              strokeWidth={0.5}
              opacity={0.4}
            />
          ))}

          {/* Left column pitch labels (only on C notes) */}
          {Array.from({ length: pitchCount }).map((_, i) => {
            const midi = maxMidi - i
            if (pitchClass(midi) !== 0) return null
            return (
              <text
                key={midi}
                x={LABEL_COL_W - 6}
                y={CHORD_LABEL_H + i * ROW_HEIGHT + ROW_HEIGHT - 2}
                textAnchor="end"
                fontSize={10}
                fontFamily="system-ui, sans-serif"
                fill="var(--color-text-tertiary)"
              >
                {midiLabel(midi)}
              </text>
            )
          })}

          {/* Divider between label col and grid */}
          <line
            x1={LABEL_COL_W}
            x2={LABEL_COL_W}
            y1={0}
            y2={totalHeight}
            stroke="var(--color-border)"
            strokeWidth={1}
          />

          {/* Bar focus highlight */}
          {focusIndex >= 0 && focusIndex < bars.length && (
            <rect
              x={LABEL_COL_W + focusIndex * BAR_WIDTH}
              y={0}
              width={BAR_WIDTH}
              height={totalHeight}
              fill="var(--color-accent-dim)"
              opacity={0.5}
            />
          )}

          {/* Vertical grid: beat lines + strong bar lines */}
          {bars.map((_, barIdx) => {
            const barX = LABEL_COL_W + barIdx * BAR_WIDTH
            return (
              <g key={'grid-' + barIdx}>
                {/* beat subdivisions */}
                {[1, 2, 3].map((beat) => (
                  <line
                    key={beat}
                    x1={barX + beat * BEAT_WIDTH}
                    x2={barX + beat * BEAT_WIDTH}
                    y1={CHORD_LABEL_H}
                    y2={totalHeight}
                    stroke="var(--color-border-subtle)"
                    strokeWidth={0.5}
                    opacity={0.5}
                  />
                ))}
                {/* strong bar line */}
                <line
                  x1={barX}
                  x2={barX}
                  y1={0}
                  y2={totalHeight}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
              </g>
            )
          })}
          {/* final bar line */}
          <line
            x1={LABEL_COL_W + bars.length * BAR_WIDTH}
            x2={LABEL_COL_W + bars.length * BAR_WIDTH}
            y1={0}
            y2={totalHeight}
            stroke="var(--color-border)"
            strokeWidth={1}
          />

          {/* Chord labels */}
          {bars.map((bar, barIdx) => {
            const cx = LABEL_COL_W + barIdx * BAR_WIDTH + BAR_WIDTH / 2
            return (
              <text
                key={'label-' + barIdx}
                x={cx}
                y={17}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fontFamily="system-ui, sans-serif"
                fill={focusIndex === barIdx ? 'var(--color-accent)' : 'var(--color-text-primary)'}
              >
                {bar.chord}
              </text>
            )
          })}

          {/* Notes */}
          {bars.map((bar, barIdx) => {
            const barX = LABEL_COL_W + barIdx * BAR_WIDTH
            return (
              <g key={'notes-' + barIdx}>
                {/* RH: whole-bar block chord */}
                {bar.rhNotes.map((midi, noteIdx) => {
                  const y = yOf(midi)
                  return (
                    <g key={'rh-' + noteIdx}>
                      <rect
                        x={barX + 2}
                        y={y + 1}
                        width={BAR_WIDTH - 4}
                        height={ROW_HEIGHT - 2}
                        rx={3}
                        fill={RH_FILL}
                        opacity={0.9}
                      />
                      <text
                        x={barX + BAR_WIDTH / 2}
                        y={y + ROW_HEIGHT - 2}
                        textAnchor="middle"
                        fontSize={8}
                        fontWeight={700}
                        fontFamily="system-ui, sans-serif"
                        fill={NOTE_TEXT}
                      >
                        {bar.rhFingers[noteIdx]}
                      </text>
                    </g>
                  )
                })}

                {/* LH: bass pattern notes */}
                {bar.lhNotes.map((note, noteIdx) => {
                  const nx = barX + note.startBeat * BEAT_WIDTH
                  const nw = note.beats * BEAT_WIDTH
                  const y = yOf(note.midi)
                  return (
                    <g key={'lh-' + noteIdx}>
                      <rect
                        x={nx + 2}
                        y={y + 1}
                        width={nw - 4}
                        height={ROW_HEIGHT - 2}
                        rx={3}
                        fill={LH_FILL}
                        opacity={0.9}
                      />
                      <text
                        x={nx + nw / 2}
                        y={y + ROW_HEIGHT - 2}
                        textAnchor="middle"
                        fontSize={8}
                        fontWeight={700}
                        fontFamily="system-ui, sans-serif"
                        fill="#fff"
                      >
                        {note.finger}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}

          {/* Playhead */}
          {playheadBeat >= 0 && (
            <line
              x1={LABEL_COL_W + playheadBeat * BEAT_WIDTH}
              x2={LABEL_COL_W + playheadBeat * BEAT_WIDTH}
              y1={0}
              y2={totalHeight}
              stroke="var(--color-accent)"
              strokeWidth={2}
            />
          )}
        </svg>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 px-4 py-2 text-xs"
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <span className="inline-block rounded-sm" style={{ width: 10, height: 10, backgroundColor: 'var(--color-chord)' }} />
          Right hand
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block rounded-sm" style={{ width: 10, height: 10, backgroundColor: 'var(--color-info)' }} />
          Left hand
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>Numbers = finger (1 thumb … 5 pinky)</span>
      </div>
    </div>
  )
}
