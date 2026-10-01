const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'])

// All possible root notes, longest first to avoid partial matches
const ROOTS = [
  'C#', 'Db', 'D#', 'Eb', 'F#', 'Gb', 'G#', 'Ab', 'A#', 'Bb',
  'C', 'D', 'E', 'F', 'G', 'A', 'B'
]

function parseChordRoot(chord: string): { root: string; quality: string } | null {
  for (const root of ROOTS) {
    if (chord.startsWith(root)) {
      return { root, quality: chord.slice(root.length) }
    }
  }
  return null
}

function noteIndex(note: string): number {
  const idx = SHARPS.indexOf(note)
  if (idx !== -1) return idx
  return FLATS.indexOf(note)
}

function transposeNote(note: string, steps: number, useSharps: boolean): string {
  const idx = noteIndex(note)
  if (idx === -1) return note
  const newIdx = ((idx + steps) % 12 + 12) % 12
  return useSharps ? SHARPS[newIdx] : FLATS[newIdx]
}

// Conventional spelling of each key (index = pitch class)
const MAJOR_KEY_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const MINOR_KEY_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B']
// Minor keys whose signature uses flats even though the root is natural
const FLAT_NATURAL_MINORS = new Set(['C', 'D', 'F', 'G'])

function isMinorKey(key: string): boolean {
  return /^[A-G][#b]?m(?!aj)/.test(key)
}

/** True when chords in `key` should be written with sharps (G, D, Em…), false for flats (F, Bb, Dm…). */
export function keyUsesSharps(key: string): boolean {
  const parsed = parseChordRoot(key)
  if (!parsed) return true
  if (parsed.root.endsWith('b')) return false
  if (parsed.root.endsWith('#')) return true
  if (isMinorKey(key)) return !FLAT_NATURAL_MINORS.has(parsed.root)
  return parsed.root !== 'F'
}

/** Transpose a key name, choosing its conventional spelling (C +1 → Db, Am +1 → Bbm). */
export function transposeKey(key: string, steps: number): string {
  const parsed = parseChordRoot(key)
  if (!parsed || steps === 0) return key
  const idx = noteIndex(parsed.root)
  if (idx === -1) return key
  const newIdx = ((idx + steps) % 12 + 12) % 12
  const names = isMinorKey(key) ? MINOR_KEY_NAMES : MAJOR_KEY_NAMES
  return names[newIdx] + parsed.quality
}

export function transposeChord(chord: string, steps: number, targetKey?: string): string {
  if (steps === 0) return chord

  // Handle slash chords: G/B -> transpose both sides
  if (chord.includes('/')) {
    const [left, right] = chord.split('/')
    return `${transposeChord(left, steps, targetKey)}/${transposeChord(right, steps, targetKey)}`
  }

  const parsed = parseChordRoot(chord)
  if (!parsed) return chord

  const { root, quality } = parsed
  const useSharps = targetKey ? keyUsesSharps(targetKey) : !FLAT_KEYS.has(root)
  const newRoot = transposeNote(root, steps, useSharps)
  return newRoot + quality
}

// Regex: matches [ChordHere] but NOT [! cue]
const CHORD_PATTERN = /\[([A-G][^\]!]*)\]/g

/**
 * Transpose every chord in a ChordPro song. When the song's key is known, all
 * chords are spelled consistently for the new key (e.g. Db major uses flats).
 */
export function transposeSong(content: string, steps: number, originalKey?: string): string {
  if (steps === 0) return content
  const targetKey = originalKey ? transposeKey(originalKey, steps) : undefined
  return content.replace(CHORD_PATTERN, (_, chord) => {
    return `[${transposeChord(chord, steps, targetKey)}]`
  })
}

export function getCapoDisplay(actualKey: string, capoFret: number): string {
  if (capoFret === 0) return actualKey
  const playedKey = transposeChord(actualKey, -capoFret)
  return `Каподастр: ${capoFret} | Играть как ${playedKey}`
}
