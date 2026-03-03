import { Chord, Note } from 'tonal'
import type { CustomPianoChordDiagram } from '../types'

interface Props {
  chord: string
  customDiagram?: CustomPianoChordDiagram
  size?: number
  highlightColor?: string
}

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BLACK_KEY_POSITIONS = [0.5, 1.5, 3.5, 4.5, 5.5]

export function MiniPianoDiagram({ chord, customDiagram, size = 56, highlightColor = '#32d74b' }: Props) {
  let highlightedPCs: Set<string>

  if (customDiagram && customDiagram.notes.length > 0) {
    highlightedPCs = new Set(customDiagram.notes.map((n) => Note.pitchClass(n)).filter(Boolean))
  } else {
    const chordData = Chord.get(chord)
    const chordNotes: string[] = chordData.notes.length > 0
      ? chordData.notes
      : Chord.get(chord.replace('m', 'minor')).notes
    highlightedPCs = new Set(chordNotes.map((n) => Note.pitchClass(n)).filter(Boolean))
  }

  const WHITE_COUNT = 8
  const w = size
  const h = size * 0.55
  const wKeyW = w / WHITE_COUNT
  const wKeyH = h
  const bKeyW = wKeyW * 0.6
  const bKeyH = h * 0.6

  const isWhiteHighlighted = (noteIdx: number) => {
    const noteName = WHITE_KEYS[noteIdx % 7]
    if (!noteName) return false
    return highlightedPCs.has(noteName) ||
      Array.from(highlightedPCs).some((pc) => {
        const midiA = Note.midi(pc + '4')
        const midiB = Note.midi(noteName + '4')
        return midiA != null && midiB != null && (midiA % 12) === (midiB % 12)
      })
  }

  const isBlackHighlighted = (pos: number) => {
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
    <div className="flex flex-col items-center">
      <span className="text-xs font-bold mb-0.5" style={{ color: '#32d74b', fontSize: 9 }}>{chord}</span>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {Array.from({ length: WHITE_COUNT }).map((_, i) => {
          const hi = isWhiteHighlighted(i)
          return (
            <rect
              key={i}
              x={i * wKeyW + 0.5}
              y={0.5}
              width={wKeyW - 1}
              height={wKeyH - 1}
              rx={1}
              fill={hi ? highlightColor : '#ffffff'}
              stroke="#333"
              strokeWidth={0.5}
            />
          )
        })}

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
              rx={1}
              fill={hi ? '#0a84ff' : '#111111'}
            />
          )
        })}
      </svg>
    </div>
  )
}
