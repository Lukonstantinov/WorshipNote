import type { CustomChordDiagram } from '../types'

/**
 * Bass chord voicings (4-string bass: E-A-D-G low→high).
 * frets: 4 values. -1 = muted, 0 = open, 1-5 = fret number.
 * fingers: 0 = no finger, 1-4 = finger number.
 * baseFret: starting fret for the diagram (default 1).
 */
export type BassChordVoicing = CustomChordDiagram

const BASS_CHORDS: Record<string, BassChordVoicing> = {
  // ── Root position major/minor shapes ──
  // C root on A string (3rd fret)
  C:    { frets: [-1, 3, 2, 0], fingers: [0, 3, 2, 0] },
  Cm:   { frets: [-1, 3, 1, 0], fingers: [0, 3, 1, 0] },
  C7:   { frets: [-1, 3, 2, 3], fingers: [0, 2, 1, 3] },
  Cmaj7:{ frets: [-1, 3, 2, 4], fingers: [0, 2, 1, 4] },

  // D root on A string (5th fret)
  D:    { frets: [-1, 5, 4, 2], fingers: [0, 4, 3, 1], baseFret: 2 },
  Dm:   { frets: [-1, 5, 3, 2], fingers: [0, 4, 2, 1], baseFret: 2 },
  D7:   { frets: [-1, 5, 4, 5], fingers: [0, 2, 1, 3], baseFret: 3 },
  Dmaj7:{ frets: [-1, 5, 4, 2], fingers: [0, 3, 2, 1], baseFret: 2 },

  // E root on E string (open)
  E:    { frets: [0, 2, 2, 1], fingers: [0, 2, 3, 1] },
  Em:   { frets: [0, 2, 2, 0], fingers: [0, 2, 3, 0] },
  E7:   { frets: [0, 2, 0, 1], fingers: [0, 2, 0, 1] },
  Emaj7:{ frets: [0, 2, 1, 1], fingers: [0, 3, 1, 2] },

  // F root on E string (1st fret)
  F:    { frets: [1, 3, 3, 2], fingers: [1, 3, 4, 2] },
  Fm:   { frets: [1, 3, 3, 1], fingers: [1, 3, 4, 1] },
  F7:   { frets: [1, 3, 1, 2], fingers: [1, 3, 1, 2] },

  // G root on E string (3rd fret)
  G:    { frets: [3, 5, 5, 4], fingers: [1, 3, 4, 2], baseFret: 3 },
  Gm:   { frets: [3, 5, 5, 3], fingers: [1, 3, 4, 1], baseFret: 3 },
  G7:   { frets: [3, 5, 3, 4], fingers: [1, 3, 1, 2], baseFret: 3 },
  Gmaj7:{ frets: [3, 5, 4, 4], fingers: [1, 4, 2, 3], baseFret: 3 },

  // A root on A string (open)
  A:    { frets: [-1, 0, 2, 2], fingers: [0, 0, 1, 2] },
  Am:   { frets: [-1, 0, 2, 1], fingers: [0, 0, 2, 1] },
  A7:   { frets: [-1, 0, 2, 0], fingers: [0, 0, 2, 0] },
  Amaj7:{ frets: [-1, 0, 1, 2], fingers: [0, 0, 1, 2] },

  // B root on A string (2nd fret)
  B:    { frets: [-1, 2, 4, 4], fingers: [0, 1, 3, 4] },
  Bm:   { frets: [-1, 2, 4, 3], fingers: [0, 1, 3, 2] },
  B7:   { frets: [-1, 2, 1, 2], fingers: [0, 2, 1, 3] },

  // ── Flat/sharp chords ──
  'Bb':   { frets: [-1, 1, 3, 3], fingers: [0, 1, 3, 4] },
  'Bbm':  { frets: [-1, 1, 3, 2], fingers: [0, 1, 3, 2] },
  'Bb7':  { frets: [-1, 1, 3, 1], fingers: [0, 1, 3, 1] },

  'Ab':   { frets: [4, 1, 1, 1], fingers: [4, 1, 1, 1], baseFret: 4 },
  'Abm':  { frets: [4, 1, 1, 0], fingers: [4, 1, 2, 0], baseFret: 4 },

  'Eb':   { frets: [-1, -1, 1, 3], fingers: [0, 0, 1, 3] },
  'Ebm':  { frets: [-1, -1, 1, 2], fingers: [0, 0, 1, 2] },

  'F#':   { frets: [2, 4, 4, 3], fingers: [1, 3, 4, 2] },
  'F#m':  { frets: [2, 4, 4, 2], fingers: [1, 3, 4, 1] },
  'F#7':  { frets: [2, 4, 2, 3], fingers: [1, 3, 1, 2] },

  'G#':   { frets: [4, 1, 1, 1], fingers: [4, 1, 1, 1] },
  'G#m':  { frets: [4, 1, 1, 0], fingers: [4, 1, 2, 0] },

  'C#':   { frets: [-1, 4, 3, 1], fingers: [0, 4, 3, 1] },
  'C#m':  { frets: [-1, 4, 2, 1], fingers: [0, 4, 2, 1] },

  // ── 7th chords ──
  Cm7:  { frets: [-1, 3, 1, 3], fingers: [0, 2, 1, 3] },
  Dm7:  { frets: [-1, 5, 3, 5], fingers: [0, 2, 1, 3], baseFret: 3 },
  Em7:  { frets: [0, 2, 0, 0], fingers: [0, 2, 0, 0] },
  Fm7:  { frets: [1, 3, 1, 1], fingers: [1, 3, 1, 1] },
  Gm7:  { frets: [3, 5, 3, 3], fingers: [1, 3, 1, 1], baseFret: 3 },
  Am7:  { frets: [-1, 0, 2, 0], fingers: [0, 0, 2, 0] },
  Bm7:  { frets: [-1, 2, 4, 2], fingers: [0, 1, 3, 1] },

  // ── Sus chords ──
  Csus2: { frets: [-1, 3, 0, 0], fingers: [0, 3, 0, 0] },
  Csus4: { frets: [-1, 3, 3, 0], fingers: [0, 2, 3, 0] },
  Dsus2: { frets: [-1, 5, 2, 2], fingers: [0, 4, 1, 2], baseFret: 2 },
  Dsus4: { frets: [-1, 5, 5, 2], fingers: [0, 3, 4, 1], baseFret: 2 },
  Esus2: { frets: [0, 2, 4, 2], fingers: [0, 1, 3, 1] },
  Esus4: { frets: [0, 2, 2, 2], fingers: [0, 1, 2, 3] },
  Gsus2: { frets: [3, 5, 2, 4], fingers: [2, 4, 1, 3], baseFret: 2 },
  Gsus4: { frets: [3, 5, 5, 5], fingers: [1, 2, 3, 4], baseFret: 3 },
  Asus2: { frets: [-1, 0, 2, 4], fingers: [0, 0, 1, 3] },
  Asus4: { frets: [-1, 0, 2, 3], fingers: [0, 0, 1, 2] },

  // ── Dim / Aug ──
  Cdim: { frets: [-1, 3, 1, 2], fingers: [0, 3, 1, 2] },
  Ddim: { frets: [-1, 5, 3, 4], fingers: [0, 3, 1, 2], baseFret: 3 },
  Edim: { frets: [0, 1, 2, 0], fingers: [0, 1, 2, 0] },
  Fdim: { frets: [1, 2, 3, 1], fingers: [1, 2, 3, 1] },
  Gdim: { frets: [3, 4, 5, 3], fingers: [1, 2, 3, 1], baseFret: 3 },
  Adim: { frets: [-1, 0, 1, 2], fingers: [0, 0, 1, 2] },
  Bdim: { frets: [-1, 2, 3, 1], fingers: [0, 2, 3, 1] },

  Caug: { frets: [-1, 3, 2, 1], fingers: [0, 3, 2, 1] },
  Eaug: { frets: [0, 3, 2, 1], fingers: [0, 4, 3, 1] },
  Gaug: { frets: [3, 2, 1, 0], fingers: [3, 2, 1, 0] },
}

export function getBassChord(name: string): BassChordVoicing | undefined {
  return BASS_CHORDS[name]
}

export function getAllBassChordNames(): string[] {
  return Object.keys(BASS_CHORDS)
}
