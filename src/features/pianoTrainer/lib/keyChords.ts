export type KeyMode = 'major' | 'minor'

export interface PianoKey {
  root: string
  mode: KeyMode
}

export const ALL_ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

const PITCH_INDEX: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10, B: 11,
}

const MAJOR_SCALE_SEMITONES = [0, 2, 4, 5, 7, 9, 11]
const MINOR_SCALE_SEMITONES = [0, 2, 3, 5, 7, 8, 10]

const MAJOR_TRIAD_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim']
const MINOR_TRIAD_QUALITIES = ['m', 'dim', '', 'm', 'm', '', '']

function pitchIndex(note: string): number {
  const idx = PITCH_INDEX[note]
  if (idx === undefined) throw new Error(`Unknown note: ${note}`)
  return idx
}

function noteFromIndex(idx: number): string {
  return ALL_ROOTS[((idx % 12) + 12) % 12]
}

export function scaleNotes(key: PianoKey): string[] {
  const rootIdx = pitchIndex(key.root)
  const intervals = key.mode === 'major' ? MAJOR_SCALE_SEMITONES : MINOR_SCALE_SEMITONES
  return intervals.map((i) => noteFromIndex(rootIdx + i))
}

export function diatonicChords(key: PianoKey): string[] {
  const notes = scaleNotes(key)
  const qualities = key.mode === 'major' ? MAJOR_TRIAD_QUALITIES : MINOR_TRIAD_QUALITIES
  return notes.map((n, i) => n + qualities[i])
}

export interface PresetProgression {
  id: string
  name: string
  description: string
  modes: KeyMode[]
  /** 0-indexed scale degrees. 0 = I/i, 1 = ii, …, 6 = vii */
  degrees: number[]
}

export const PRESET_PROGRESSIONS: PresetProgression[] = [
  { id: 'pop',      name: 'I–V–vi–IV',        description: 'Pop / worship anthem',  modes: ['major'], degrees: [0, 4, 5, 3] },
  { id: 'fifties',  name: 'I–vi–IV–V',        description: "50's doo-wop",           modes: ['major'], degrees: [0, 5, 3, 4] },
  { id: 'axis',     name: 'vi–IV–I–V',        description: 'Axis of Awesome',        modes: ['major'], degrees: [5, 3, 0, 4] },
  { id: 'ii-v-i',   name: 'ii–V–I',           description: 'Jazz turnaround',        modes: ['major'], degrees: [1, 4, 0] },
  { id: 'classic',  name: 'I–IV–V',           description: 'Three-chord classic',    modes: ['major'], degrees: [0, 3, 4] },
  { id: 'canon',    name: 'Canon (Pachelbel)',description: 'Baroque favourite',      modes: ['major'], degrees: [0, 4, 5, 2, 3, 0, 3, 4] },
  { id: 'minor1',   name: 'i–VII–VI–VII',     description: 'Dark / cinematic',       modes: ['minor'], degrees: [0, 6, 5, 6] },
  { id: 'minor2',   name: 'i–iv–v',           description: 'Simple minor',           modes: ['minor'], degrees: [0, 3, 4] },
  { id: 'minor3',   name: 'i–VI–III–VII',     description: 'Epic minor',             modes: ['minor'], degrees: [0, 5, 2, 6] },
  { id: 'and',      name: 'Andalusian',       description: 'Flamenco descent',       modes: ['minor'], degrees: [0, 6, 5, 4] },
]

export function progressionForKey(preset: PresetProgression, key: PianoKey): string[] {
  if (!preset.modes.includes(key.mode)) {
    throw new Error(`Preset ${preset.id} does not match mode ${key.mode}`)
  }
  const chords = diatonicChords(key)
  return preset.degrees.map((d) => chords[d])
}

export function presetsForMode(mode: KeyMode): PresetProgression[] {
  return PRESET_PROGRESSIONS.filter((p) => p.modes.includes(mode))
}

export function suggestProgression(key: PianoKey, seed: number): string[] {
  const presets = presetsForMode(key.mode)
  if (presets.length === 0) return []
  const preset = presets[((seed % presets.length) + presets.length) % presets.length]
  return progressionForKey(preset, key)
}
