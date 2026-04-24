import { bassRoot, bassFifth, bassThird } from './voicings'

export interface BassNote {
  midi: number
  /** 0-indexed beat within the bar. */
  startBeat: number
  /** Duration in beats. */
  beats: number
  /** LH finger (1 thumb … 5 pinky). */
  finger: number
}

export interface BassPattern {
  id: string
  name: string
  description: string
  notesForBar(chord: string): BassNote[]
}

const PATTERNS: BassPattern[] = [
  {
    id: 'root',
    name: 'Root only',
    description: 'One low root note per bar — the simplest bass.',
    notesForBar: (chord) => [
      { midi: bassRoot(chord), startBeat: 0, beats: 4, finger: 5 },
    ],
  },
  {
    id: 'rootOct',
    name: 'Root + Octave',
    description: 'Low root for two beats, high root for two beats.',
    notesForBar: (chord) => [
      { midi: bassRoot(chord, 2), startBeat: 0, beats: 2, finger: 5 },
      { midi: bassRoot(chord, 3), startBeat: 2, beats: 2, finger: 1 },
    ],
  },
  {
    id: 'root5oct5',
    name: 'Root – 5 – Oct – 5',
    description: 'Classic country / folk bounce.',
    notesForBar: (chord) => [
      { midi: bassRoot(chord, 2), startBeat: 0, beats: 1, finger: 5 },
      { midi: bassFifth(chord, 2), startBeat: 1, beats: 1, finger: 2 },
      { midi: bassRoot(chord, 3), startBeat: 2, beats: 1, finger: 1 },
      { midi: bassFifth(chord, 2), startBeat: 3, beats: 1, finger: 2 },
    ],
  },
  {
    id: 'alberti',
    name: 'Alberti',
    description: 'Root – 5th – 3rd – 5th, rolling texture.',
    notesForBar: (chord) => [
      { midi: bassRoot(chord, 2),  startBeat: 0, beats: 1, finger: 5 },
      { midi: bassFifth(chord, 2), startBeat: 1, beats: 1, finger: 2 },
      { midi: bassThird(chord, 2), startBeat: 2, beats: 1, finger: 3 },
      { midi: bassFifth(chord, 2), startBeat: 3, beats: 1, finger: 2 },
    ],
  },
  {
    id: 'walking',
    name: 'Walking',
    description: 'Quarter-note steps — root, 3rd, 5th, 6th.',
    notesForBar: (chord) => [
      { midi: bassRoot(chord, 2),           startBeat: 0, beats: 1, finger: 5 },
      { midi: bassThird(chord, 2),          startBeat: 1, beats: 1, finger: 3 },
      { midi: bassFifth(chord, 2),          startBeat: 2, beats: 1, finger: 2 },
      { midi: bassRoot(chord, 2) + 9,       startBeat: 3, beats: 1, finger: 1 }, // +9 semis = 6th
    ],
  },
]

export const BASS_PATTERNS = PATTERNS

export type BassPatternId = typeof PATTERNS[number]['id']

export function getBassPattern(id: string): BassPattern {
  const p = PATTERNS.find((x) => x.id === id)
  if (!p) throw new Error(`Unknown bass pattern: ${id}`)
  return p
}
