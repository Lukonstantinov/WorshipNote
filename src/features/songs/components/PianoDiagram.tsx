import { Chord, Note } from 'tonal'

interface Props {
  chord: string
  size?: number
}

// White key note names in one octave (C to B)
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
// Black key positions relative to white keys (between which whites)
// Expressed as index of preceding white key + 0.5
const BLACK_KEY_POSITIONS = [0.5, 1.5, 3.5, 4.5, 5.5] // C#, D#, F#, G#, A#

// Map note name (ignoring octave) to white/black key
function noteClass(noteName: string): string {
  return Note.pitchClass(noteName) ?? ''
}

function isEnharmonicMatch(noteA: string, noteB: string): boolean {
  const midiA = Note.midi(noteA + '4') ?? Note.midi(noteA + '3')
  const midiB = Note.midi(noteB + '4') ?? Note.midi(noteB + '3')
  if (midiA == null || midiB == null) return false
  return (midiA % 12) === (midiB % 12)
}

export function PianoDiagram({ chord, size = 120 }: Props) {
  // Parse chord notes using tonal
  const chordData = Chord.get(chord)
  const chordNotes: string[] = chordData.notes.length > 0
    ? chordData.notes
    : Chord.get(chord.replace('m', 'minor')).notes

  const highlightedPCs = new Set(chordNotes.map((n) => Note.pitchClass(n)).filter(Boolean))

  const WHITE_COUNT = 8 // C to C (one octave + C)
  const w = size
  const h = size * 0.8
  const wKeyW = w / WHITE_COUNT
  const wKeyH = h
  const bKeyW = wKeyW * 0.6
  const bKeyH = h * 0.62

  const isWhiteHighlighted = (noteIdx: number) => {
    const noteName = WHITE_KEYS[noteIdx % 7]
    if (!noteName) return false
    return highlightedPCs.has(noteName) ||
      // check enharmonics
      Array.from(highlightedPCs).some((pc) => {
        const midiA = Note.midi(pc + '4')
        const midiB = Note.midi(noteName + '4')
        return midiA != null && midiB != null && (midiA % 12) === (midiB % 12)
      })
  }

  const isBlackHighlighted = (pos: number) => {
    // Black key note names: C# D# F# G# A#
    const blackNoteNames = ['C#', 'D#', 'F#', 'G#', 'A#']
    const bIdx = BLACK_KEY_POSITIONS.indexOf(pos)
    const noteName = blackNoteNames[bIdx]
    if (!noteName) return false
    return highlightedPCs.has(noteName) ||
      Array.from(highlightedPCs).some((pc) => {
        const midiA = Note.midi(pc + '4')
        const midiB = Note.midi(noteName + '4')
        return midiA != null && midiB != null && (midiA % 12) === (midiB % 12)
      })
  }

  return (
    <svg width={w} height={h + 20} viewBox={`0 0 ${w} ${h + 20}`}>
      {/* Chord name */}
      <text
        x={w / 2} y={13}
        textAnchor="middle"
        fontSize={12}
        fontWeight="700"
        fill="#ffffff"
        fontFamily="system-ui, sans-serif"
      >
        {chord}
      </text>

      <g transform="translate(0,18)">
        {/* White keys */}
        {Array.from({ length: WHITE_COUNT }).map((_, i) => {
          const hi = isWhiteHighlighted(i)
          return (
            <rect
              key={i}
              x={i * wKeyW + 0.5}
              y={0.5}
              width={wKeyW - 1}
              height={wKeyH - 1}
              rx={2}
              fill={hi ? '#32d74b' : '#ffffff'}
              stroke="#333"
              strokeWidth={0.5}
            />
          )
        })}

        {/* Black keys */}
        {BLACK_KEY_POSITIONS.map((pos, bi) => {
          const hi = isBlackHighlighted(pos)
          const x = pos * wKeyW + wKeyW / 2 - bKeyW / 2
          return (
            <rect
              key={bi}
              x={x}
              y={0}
              width={bKeyW}
              height={bKeyH}
              rx={2}
              fill={hi ? '#0a84ff' : '#111111'}
            />
          )
        })}
      </g>
    </svg>
  )
}
