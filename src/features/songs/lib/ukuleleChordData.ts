import type { CustomChordDiagram } from '../types'

/**
 * Ukulele chord voicings (GCEA tuning — standard soprano/concert/tenor).
 * frets: 4 values (G → C → E → A strings). -1 = muted, 0 = open, 1-5 = fret number.
 * fingers: 0 = no finger, 1–4 = finger number.
 * baseFret: starting fret for the diagram (default 1).
 */
export type UkuleleVoicing = CustomChordDiagram & { name?: string; stringCount?: 4 }

const UKULELE_CHORDS: Record<string, UkuleleVoicing> = {
  // --- Major chords ---
  C:      { frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
  D:      { frets: [2, 2, 2, 0], fingers: [1, 2, 3, 0] },
  E:      { frets: [4, 4, 4, 2], fingers: [2, 3, 4, 1], baseFret: 2 },
  F:      { frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0] },
  G:      { frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2] },
  A:      { frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0] },
  B:      { frets: [4, 3, 2, 2], fingers: [4, 3, 1, 2] },
  Bb:     { frets: [3, 2, 1, 1], fingers: [3, 2, 1, 1] },
  Eb:     { frets: [0, 3, 3, 1], fingers: [0, 3, 4, 1] },
  'F#':   { frets: [3, 1, 2, 1], fingers: [3, 1, 2, 1] },
  Ab:     { frets: [5, 4, 4, 3], fingers: [3, 2, 1, 1], baseFret: 4 },

  // --- Minor chords ---
  Cm:     { frets: [0, 3, 3, 3], fingers: [0, 1, 2, 3] },
  Dm:     { frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0] },
  Em:     { frets: [0, 4, 3, 2], fingers: [0, 4, 3, 2] },
  Fm:     { frets: [1, 0, 1, 3], fingers: [1, 0, 2, 4] },
  Gm:     { frets: [0, 2, 3, 1], fingers: [0, 2, 4, 1] },
  Am:     { frets: [2, 0, 0, 0], fingers: [1, 0, 0, 0] },
  Bm:     { frets: [4, 2, 2, 2], fingers: [4, 1, 1, 1], baseFret: 2 },
  Bbm:    { frets: [3, 1, 1, 1], fingers: [3, 1, 1, 1] },
  'F#m':  { frets: [2, 0, 2, 2], fingers: [1, 0, 3, 4] },

  // --- Dominant 7th ---
  C7:     { frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1] },
  D7:     { frets: [2, 2, 2, 3], fingers: [1, 2, 3, 4] },
  E7:     { frets: [1, 2, 0, 2], fingers: [1, 2, 0, 3] },
  F7:     { frets: [2, 3, 1, 3], fingers: [2, 3, 1, 4] },
  G7:     { frets: [0, 2, 1, 2], fingers: [0, 3, 1, 2] },
  A7:     { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] },
  B7:     { frets: [2, 3, 2, 2], fingers: [1, 3, 2, 4] },
  Bb7:    { frets: [1, 2, 1, 1], fingers: [1, 2, 1, 1] },

  // --- Major 7th ---
  Cmaj7:  { frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2] },
  Dmaj7:  { frets: [2, 2, 2, 4], fingers: [1, 2, 3, 4] },
  Fmaj7:  { frets: [2, 4, 1, 3], fingers: [2, 4, 1, 3] },
  Gmaj7:  { frets: [0, 2, 2, 2], fingers: [0, 1, 2, 3] },
  Amaj7:  { frets: [1, 1, 0, 0], fingers: [1, 2, 0, 0] },

  // --- Minor 7th ---
  Am7:    { frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0] },
  Dm7:    { frets: [2, 2, 1, 3], fingers: [2, 3, 1, 4] },
  Em7:    { frets: [0, 2, 0, 2], fingers: [0, 2, 0, 3] },
  Gm7:    { frets: [0, 2, 1, 1], fingers: [0, 3, 1, 2] },
  Bm7:    { frets: [2, 2, 2, 2], fingers: [1, 1, 1, 1], baseFret: 2 },

  // --- Sus chords ---
  Csus2:  { frets: [0, 2, 3, 3], fingers: [0, 1, 3, 4] },
  Dsus2:  { frets: [2, 2, 0, 0], fingers: [2, 3, 0, 0] },
  Dsus4:  { frets: [0, 2, 3, 0], fingers: [0, 1, 2, 0] },
  Gsus4:  { frets: [0, 2, 3, 3], fingers: [0, 1, 3, 4] },
  Asus4:  { frets: [2, 2, 0, 0], fingers: [1, 2, 0, 0] },

  // --- Diminished / Augmented ---
  Cdim:   { frets: [2, 3, 2, 3], fingers: [1, 3, 2, 4] },
  Ddim:   { frets: [1, 2, 1, 2], fingers: [1, 3, 2, 4] },
  Gdim:   { frets: [0, 1, 0, 1], fingers: [0, 2, 0, 3] },
  Adim:   { frets: [2, 3, 2, 0], fingers: [1, 3, 2, 0] },
  Caug:   { frets: [1, 0, 0, 3], fingers: [1, 0, 0, 4] },
  Faug:   { frets: [2, 1, 1, 0], fingers: [2, 1, 3, 0] },
  Gaug:   { frets: [0, 3, 3, 2], fingers: [0, 3, 4, 1] },
}

export function getUkuleleChord(name: string): UkuleleVoicing | undefined {
  // Try direct lookup first
  if (UKULELE_CHORDS[name]) return UKULELE_CHORDS[name]
  // Try stripping slash bass note
  const slashIdx = name.indexOf('/')
  if (slashIdx > 0) return UKULELE_CHORDS[name.slice(0, slashIdx)]
  return undefined
}

export function getAllUkuleleChordNames(): string[] {
  return Object.keys(UKULELE_CHORDS)
}
