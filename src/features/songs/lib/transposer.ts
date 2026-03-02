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
  const useSharps = targetKey ? !FLAT_KEYS.has(targetKey) : !FLAT_KEYS.has(root)
  const newRoot = transposeNote(root, steps, useSharps)
  return newRoot + quality
}

// Regex: matches [ChordHere] but NOT [! cue]
const CHORD_PATTERN = /\[([A-G][^\]!]*)\]/g

export function transposeSong(content: string, steps: number): string {
  if (steps === 0) return content
  return content.replace(CHORD_PATTERN, (_, chord) => {
    return `[${transposeChord(chord, steps)}]`
  })
}

export function getCapoDisplay(actualKey: string, capoFret: number): string {
  if (capoFret === 0) return actualKey
  const playedKey = transposeChord(actualKey, -capoFret)
  return `Каподастр: ${capoFret} | Играть как ${playedKey}`
}
