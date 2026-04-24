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

const ROW_HEIGHT = 14
const BEAT_WIDTH = 42
const BAR_WIDTH = BEAT_WIDTH * 4
const LABEL_COL_W = 44
const CHORD_LABEL_H = 34

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
        className="rounded-2xl p-10 text-center text-sm"
        style={{
          background: 'linear-gradient(135deg, var(--color-card) 0%, var(--color-card-raised) 100%)',
          color: 'var(--color-text-muted)',
          border: '1px dashed var(--color-border)',
        }}
      >
        Your piano roll will appear here once you add chords to the progression.
      </div>
    )
  }

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

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--color-card) 0%, var(--color-card-raised) 100%)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px var(--color-shadow)',
      }}
    >
      <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
        <svg
          width={totalWidth}
          height={totalHeight}
          style={{ display: 'block', minWidth: '100%' }}
        >
          <defs>
            <linearGradient id="rhGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chord)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-chord)" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="lhGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-info)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="playheadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.3" />
            </linearGradient>
            <filter id="noteShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.35" />
            </filter>
            <filter id="labelGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Pitch row stripes (alternating white/black key backgrounds) */}
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
                opacity={isBlack(midi) ? 0.8 : 0.4}
              />
            )
          })}

          {/* Subtle alternating bar background (every other bar slightly tinted) */}
          {bars.map((_, barIdx) => {
            if (barIdx % 2 === 1) return null
            return (
              <rect
                key={'alt-' + barIdx}
                x={LABEL_COL_W + barIdx * BAR_WIDTH}
                y={CHORD_LABEL_H}
                width={BAR_WIDTH}
                height={rollHeight}
                fill="var(--color-text-primary)"
                opacity={0.02}
              />
            )
          })}

          {/* Bar focus highlight with accent glow */}
          {focusIndex >= 0 && focusIndex < bars.length && (
            <>
              <rect
                x={LABEL_COL_W + focusIndex * BAR_WIDTH}
                y={0}
                width={BAR_WIDTH}
                height={totalHeight}
                fill="var(--color-accent)"
                opacity={0.1}
              />
              <rect
                x={LABEL_COL_W + focusIndex * BAR_WIDTH}
                y={0}
                width={2}
                height={totalHeight}
                fill="var(--color-accent)"
                opacity={0.7}
              />
              <rect
                x={LABEL_COL_W + (focusIndex + 1) * BAR_WIDTH - 2}
                y={0}
                width={2}
                height={totalHeight}
                fill="var(--color-accent)"
                opacity={0.7}
              />
            </>
          )}

          {/* Horizontal pitch separator lines (lighter, every semitone) */}
          {Array.from({ length: pitchCount + 1 }).map((_, i) => (
            <line
              key={i}
              x1={0}
              x2={totalWidth}
              y1={CHORD_LABEL_H + i * ROW_HEIGHT}
              y2={CHORD_LABEL_H + i * ROW_HEIGHT}
              stroke="var(--color-border-subtle)"
              strokeWidth={0.5}
              opacity={0.35}
            />
          ))}

          {/* Emphasized line between each octave (at every C) */}
          {Array.from({ length: pitchCount + 1 }).map((_, i) => {
            const midi = maxMidi - i
            if (pitchClass(midi) !== 0) return null
            return (
              <line
                key={'oct-' + midi}
                x1={0}
                x2={totalWidth}
                y1={CHORD_LABEL_H + i * ROW_HEIGHT}
                y2={CHORD_LABEL_H + i * ROW_HEIGHT}
                stroke="var(--color-border)"
                strokeWidth={0.75}
                opacity={0.5}
              />
            )
          })}

          {/* Left column pitch labels (only on C notes) */}
          {Array.from({ length: pitchCount }).map((_, i) => {
            const midi = maxMidi - i
            if (pitchClass(midi) !== 0) return null
            return (
              <text
                key={midi}
                x={LABEL_COL_W - 8}
                y={CHORD_LABEL_H + i * ROW_HEIGHT + ROW_HEIGHT - 3}
                textAnchor="end"
                fontSize={10}
                fontWeight={600}
                fontFamily="system-ui, -apple-system, sans-serif"
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

          {/* Vertical grid: beat lines + strong bar lines */}
          {bars.map((_, barIdx) => {
            const barX = LABEL_COL_W + barIdx * BAR_WIDTH
            return (
              <g key={'grid-' + barIdx}>
                {[1, 2, 3].map((beat) => (
                  <line
                    key={beat}
                    x1={barX + beat * BEAT_WIDTH}
                    x2={barX + beat * BEAT_WIDTH}
                    y1={CHORD_LABEL_H}
                    y2={totalHeight}
                    stroke="var(--color-border-subtle)"
                    strokeWidth={0.5}
                    opacity={0.35}
                    strokeDasharray={beat === 2 ? undefined : '2,3'}
                  />
                ))}
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
          <line
            x1={LABEL_COL_W + bars.length * BAR_WIDTH}
            x2={LABEL_COL_W + bars.length * BAR_WIDTH}
            y1={0}
            y2={totalHeight}
            stroke="var(--color-border)"
            strokeWidth={1}
          />

          {/* Chord labels as pills */}
          {bars.map((bar, barIdx) => {
            const cx = LABEL_COL_W + barIdx * BAR_WIDTH + BAR_WIDTH / 2
            const isActive = focusIndex === barIdx
            const pillW = Math.max(40, bar.chord.length * 10 + 14)
            const pillH = 22
            return (
              <g key={'label-' + barIdx} filter={isActive ? 'url(#labelGlow)' : undefined}>
                <rect
                  x={cx - pillW / 2}
                  y={5}
                  width={pillW}
                  height={pillH}
                  rx={11}
                  fill={isActive ? 'var(--color-accent)' : 'var(--color-card-raised)'}
                  stroke={isActive ? 'var(--color-accent)' : 'var(--color-border)'}
                  strokeWidth={1}
                />
                <text
                  x={cx}
                  y={20}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fill={isActive ? '#fff' : 'var(--color-text-primary)'}
                >
                  {bar.chord}
                </text>
              </g>
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
                    <g key={'rh-' + noteIdx} filter="url(#noteShadow)">
                      <rect
                        x={barX + 3}
                        y={y + 1.5}
                        width={BAR_WIDTH - 6}
                        height={ROW_HEIGHT - 3}
                        rx={4}
                        fill="url(#rhGrad)"
                      />
                      <rect
                        x={barX + 3}
                        y={y + 1.5}
                        width={BAR_WIDTH - 6}
                        height={ROW_HEIGHT - 3}
                        rx={4}
                        fill="none"
                        stroke="rgba(0,0,0,0.18)"
                        strokeWidth={0.5}
                      />
                      <text
                        x={barX + BAR_WIDTH / 2}
                        y={y + ROW_HEIGHT - 3}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight={800}
                        fontFamily="system-ui, -apple-system, sans-serif"
                        fill="#000"
                        opacity={0.85}
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
                    <g key={'lh-' + noteIdx} filter="url(#noteShadow)">
                      <rect
                        x={nx + 3}
                        y={y + 1.5}
                        width={nw - 6}
                        height={ROW_HEIGHT - 3}
                        rx={4}
                        fill="url(#lhGrad)"
                      />
                      <rect
                        x={nx + 3}
                        y={y + 1.5}
                        width={nw - 6}
                        height={ROW_HEIGHT - 3}
                        rx={4}
                        fill="none"
                        stroke="rgba(0,0,0,0.22)"
                        strokeWidth={0.5}
                      />
                      <text
                        x={nx + nw / 2}
                        y={y + ROW_HEIGHT - 3}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight={800}
                        fontFamily="system-ui, -apple-system, sans-serif"
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
            <g>
              <line
                x1={LABEL_COL_W + playheadBeat * BEAT_WIDTH}
                x2={LABEL_COL_W + playheadBeat * BEAT_WIDTH}
                y1={0}
                y2={totalHeight}
                stroke="url(#playheadGrad)"
                strokeWidth={2.5}
              />
              <circle
                cx={LABEL_COL_W + playheadBeat * BEAT_WIDTH}
                cy={4}
                r={4}
                fill="var(--color-accent)"
                stroke="var(--color-bg)"
                strokeWidth={1.5}
              />
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 px-4 py-2.5 text-xs flex-wrap"
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-secondary)',
          background: 'linear-gradient(180deg, transparent 0%, var(--color-card) 100%)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block rounded"
            style={{
              width: 12, height: 12,
              background: 'linear-gradient(180deg, var(--color-chord) 0%, var(--color-chord) 100%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          />
          <span className="font-medium">Right hand</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block rounded"
            style={{
              width: 12, height: 12,
              background: 'linear-gradient(180deg, var(--color-info) 0%, var(--color-info) 100%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          />
          <span className="font-medium">Left hand</span>
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>Numbers = finger (1 thumb … 5 pinky)</span>
      </div>
    </div>
  )
}
