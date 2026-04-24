export type MidiNote = number

export interface Voicing {
  /** MIDI note numbers, sorted ascending (low → high). */
  notes: MidiNote[]
  /** Suggested finger number (1 thumb … 5 pinky) parallel to `notes`. */
  fingers: number[]
}

const PITCH_CLASS: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4,
  'E#': 5, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10, B: 11, Cb: 11,
}

/** Intervals in semitones from root for each chord quality. */
const QUALITY_INTERVALS: Record<string, number[]> = {
  '': [0, 4, 7],          // major
  m: [0, 3, 7],           // minor
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
}

/** Parse a chord name into { rootPc, intervals }. Extensions after the recognised quality are ignored for voicing. */
export function parseChord(name: string): { rootPc: number; intervals: number[] } {
  const match = name.match(/^([A-G](?:#|b)?)(.*)$/)
  if (!match) throw new Error(`Unparseable chord: ${name}`)
  const [, root, rest] = match
  const rootPc = PITCH_CLASS[root]
  if (rootPc === undefined) throw new Error(`Unknown root note: ${root}`)

  const r = rest.trim()
  let quality = ''
  if (r.startsWith('dim')) quality = 'dim'
  else if (r.startsWith('aug')) quality = 'aug'
  else if (r.startsWith('sus2')) quality = 'sus2'
  else if (r.startsWith('sus4')) quality = 'sus4'
  else if (r.startsWith('m') && !r.startsWith('maj')) quality = 'm'
  else quality = ''

  return { rootPc, intervals: QUALITY_INTERVALS[quality] }
}

/** MIDI for middle C (C4) = 60. */
export function midiOf(pc: number, octave: number): MidiNote {
  return (octave + 1) * 12 + pc
}

/** Returns all reasonable triad voicings across a range of octaves + inversions. */
function candidateVoicings(chordName: string, lowestOctave = 3, highestOctave = 5): Voicing[] {
  const { rootPc, intervals } = parseChord(chordName)
  const voicings: Voicing[] = []
  for (let oct = lowestOctave; oct <= highestOctave; oct++) {
    for (let inv = 0; inv < intervals.length; inv++) {
      const rotated = intervals.slice(inv).concat(intervals.slice(0, inv).map((i) => i + 12))
      const notes = rotated.map((i) => midiOf(rootPc, oct) + i)
      voicings.push({ notes, fingers: rhFingers(notes.length) })
    }
  }
  return voicings
}

function rhFingers(count: number): number[] {
  if (count === 3) return [1, 3, 5]
  if (count === 4) return [1, 2, 3, 5]
  if (count === 2) return [1, 5]
  return Array.from({ length: count }, (_, i) => Math.min(5, i + 1))
}

function voicingDistance(a: Voicing, b: Voicing): number {
  const n = Math.min(a.notes.length, b.notes.length)
  let d = 0
  for (let i = 0; i < n; i++) d += Math.abs(a.notes[i] - b.notes[i])
  return d
}

/** Target for the lowest note of a root-hand voicing (roughly E4). */
const RH_TARGET_LOW: MidiNote = 64

/** Pick a reasonable root-position voicing near the RH target. */
export function rootPosition(chordName: string): Voicing {
  const { rootPc, intervals } = parseChord(chordName)
  const candidates = [3, 4, 5].map((oct) => {
    const notes = intervals.map((i) => midiOf(rootPc, oct) + i)
    return { notes, fingers: rhFingers(notes.length) }
  })
  candidates.sort((a, b) => Math.abs(a.notes[0] - RH_TARGET_LOW) - Math.abs(b.notes[0] - RH_TARGET_LOW))
  return candidates[0]
}

/**
 * Choose a chord voicing for the right hand.
 * - Level 1 → always root position near middle C.
 * - Level 2+ → pick the inversion/octave with smallest movement from `prev`
 *              (falls back to root position if no `prev`).
 */
export function pickVoicing(chordName: string, prev: Voicing | null, level: 1 | 2 | 3 | 4): Voicing {
  if (level === 1 || !prev) return rootPosition(chordName)
  const candidates = candidateVoicings(chordName)
  candidates.sort((a, b) => voicingDistance(a, prev) - voicingDistance(b, prev))
  return candidates[0]
}

/** Root MIDI note an octave or two below middle C, for left-hand bass. */
export function bassRoot(chordName: string, octave = 2): MidiNote {
  const { rootPc } = parseChord(chordName)
  return midiOf(rootPc, octave)
}

/** Bass 5th (perfect 5th above root) for patterns that need it. */
export function bassFifth(chordName: string, octave = 2): MidiNote {
  return bassRoot(chordName, octave) + 7
}

/** Bass 3rd — uses chord's actual quality (major or minor 3rd). */
export function bassThird(chordName: string, octave = 2): MidiNote {
  const { intervals } = parseChord(chordName)
  return bassRoot(chordName, octave) + intervals[1]
}
