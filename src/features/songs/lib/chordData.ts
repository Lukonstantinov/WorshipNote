import type { CustomChordDiagram } from '../types'

/**
 * Guitar chord voicings.
 * frets: 6 values (low E → high e). -1 = muted, 0 = open, 1-5 = fret number.
 * fingers: 0 = no finger, 1–4 = finger number.
 * baseFret: starting fret for the diagram (default 1).
 */
export type ChordVoicing = CustomChordDiagram & { name?: string }

const CHORDS: Record<string, ChordVoicing> = {
  // --- Open chords ---
  C:   { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  Cm:  { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], baseFret: 3 },
  C7:  { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  Cmaj7: { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },

  D:   { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  Dm:  { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  D7:  { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  Dmaj7: { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1] },

  E:   { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  Em:  { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  E7:  { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  Emaj7: { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0] },

  F:   { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] },
  Fm:  { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1] },
  F7:  { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1] },

  G:   { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  Gm:  { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1] },
  G7:  { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  Gmaj7: { frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1] },

  A:   { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  Am:  { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  A7:  { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  Amaj7: { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },

  B:   { frets: [-1, 2, 4, 4, 4, 2], fingers: [1, 1, 2, 3, 4, 1] },
  Bm:  { frets: [-1, 2, 4, 4, 3, 2], fingers: [1, 1, 3, 4, 2, 1] },
  B7:  { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },

  // --- Flat/sharp chords ---
  'Bb':   { frets: [-1, 1, 3, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1] },
  'Bbm':  { frets: [-1, 1, 3, 3, 2, 1], fingers: [1, 1, 3, 4, 2, 1] },
  'Bb7':  { frets: [-1, 1, 3, 1, 3, 1], fingers: [1, 1, 3, 1, 4, 1] },

  'Ab':   { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },  // Abmaj shape at 4th
  'Abm':  { frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2] },

  'Eb':   { frets: [-1, -1, 1, 3, 3, 3], fingers: [0, 0, 1, 2, 3, 4] },
  'Ebm':  { frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2], baseFret: 6 },

  'F#':   { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1] },
  'F#m':  { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1] },
  'F#7':  { frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1] },

  'C#':   { frets: [-1, 4, 3, 1, 2, 1], fingers: [0, 4, 3, 1, 2, 1], baseFret: 1 },
  'C#m':  { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], baseFret: 4 },

  'G#':   { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], baseFret: 4 },
  'G#m':  { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1] },

  'D#':   { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3], baseFret: 6 },
  'D#m':  { frets: [-1, -1, 1, 3, 4, 2], fingers: [0, 0, 1, 3, 4, 2], baseFret: 6 },

  'A#':   { frets: [-1, 1, 3, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1] }, // = Bb
  'A#m':  { frets: [-1, 1, 3, 3, 2, 1], fingers: [1, 1, 3, 4, 2, 1] },

  // --- Slash chords (common) ---
  'G/B':  { frets: [-1, 2, 0, 0, 0, 3], fingers: [0, 1, 0, 0, 0, 2] },
  'C/E':  { frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'D/F#': { frets: [2, -1, 0, 2, 3, 2], fingers: [1, 0, 0, 2, 3, 2] },
  'Bb/D': { frets: [-1, 3, 3, 3, 3, 1], fingers: [0, 2, 3, 4, 1, 1] },
  'Am/E': { frets: [0, 0, 2, 2, 1, 0], fingers: [0, 0, 3, 4, 1, 0] },
}

export function getGuitarChord(name: string): ChordVoicing | undefined {
  // Direct lookup
  if (CHORDS[name]) return CHORDS[name]
  // Try stripping slash (e.g. "G/B" already handled, but "Bb/F" → "Bb")
  const base = name.split('/')[0]
  return CHORDS[base]
}

export function getAllChordNames(): string[] {
  return Object.keys(CHORDS)
}
