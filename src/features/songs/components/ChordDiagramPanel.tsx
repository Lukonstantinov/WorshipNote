import { useState } from 'react'
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSettingsStore } from '../../../store/settingsStore'
import { GuitarDiagram } from './GuitarDiagram'
import { PianoDiagram } from './PianoDiagram'
import { ChordDiagramEditor } from './ChordDiagramEditor'
import type { ParsedSong } from '../types'

interface Props {
  parsed: ParsedSong
  position: 'side' | 'top'
}

/** Extract unique chord names from a parsed song */
function extractChords(parsed: ParsedSong): string[] {
  const seen = new Set<string>()
  for (const line of parsed.lines) {
    if (line.type === 'lyric' && line.segments) {
      for (const seg of line.segments) {
        if (seg.chord) seen.add(seg.chord)
      }
    }
  }
  return Array.from(seen)
}

export function ChordDiagramPanel({ parsed, position }: Props) {
  const { selectedInstrument, instruments, customChords } = useSettingsStore()
  const chords = extractChords(parsed)
  const [activeIdx, setActiveIdx] = useState(0)
  const [editingChord, setEditingChord] = useState<string | null>(null)

  if (chords.length === 0) return null

  const safeIdx = Math.min(activeIdx, chords.length - 1)
  const activeChord = chords[safeIdx]

  const instrument = instruments.find((i) => i.id === selectedInstrument)
  const instrType = instrument?.type ?? 'guitar'
  const showPiano = instrType === 'piano' || instrType === 'keyboard'

  const DiagramComp = showPiano ? PianoDiagram : GuitarDiagram
  const diagramSize = position === 'top' ? 100 : 130

  if (position === 'top') {
    return (
      <>
        <div
          className="px-3 py-2 border-b flex-shrink-0 overflow-x-auto scrollbar-none"
          style={{ borderColor: '#1c1c1e', backgroundColor: '#000' }}
        >
          <div className="flex items-center gap-3 min-w-max">
            {/* Chord selector chips */}
            <div className="flex items-center gap-1.5">
              {chords.map((ch, i) => (
                <button
                  key={ch}
                  onClick={() => setActiveIdx(i)}
                  className="px-2 py-0.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: i === safeIdx ? '#32d74b22' : '#1c1c1e',
                    color: i === safeIdx ? '#32d74b' : 'rgba(235,235,245,0.4)',
                    border: i === safeIdx ? '1px solid #32d74b44' : '1px solid transparent',
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Diagram */}
            <div className="relative flex-shrink-0" style={{ marginLeft: 8 }}>
              <DiagramComp
                chord={activeChord}
                customDiagram={customChords[activeChord]}
                size={diagramSize}
              />
              <button
                onClick={() => setEditingChord(activeChord)}
                className="absolute top-0 right-0 flex items-center justify-center rounded-lg"
                style={{ backgroundColor: '#2c2c2e', width: 20, height: 20 }}
                title="Edit diagram"
              >
                <Pencil size={10} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.5)' }} />
              </button>
            </div>
          </div>
        </div>

        {editingChord && (
          <ChordDiagramEditor chordName={editingChord} onClose={() => setEditingChord(null)} />
        )}
      </>
    )
  }

  // Side panel
  return (
    <>
      <div
        className="flex flex-col flex-shrink-0 border-l overflow-y-auto"
        style={{
          borderColor: '#1c1c1e',
          backgroundColor: '#0a0a0a',
          width: 160,
        }}
      >
        {/* Navigation */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b" style={{ borderColor: '#1c1c1e' }}>
          <button
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            disabled={safeIdx === 0}
            style={{ color: safeIdx === 0 ? 'rgba(235,235,245,0.15)' : 'rgba(235,235,245,0.5)' }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <span className="text-xs font-semibold" style={{ color: '#32d74b' }}>{activeChord}</span>
          <button
            onClick={() => setActiveIdx((i) => Math.min(chords.length - 1, i + 1))}
            disabled={safeIdx === chords.length - 1}
            style={{ color: safeIdx === chords.length - 1 ? 'rgba(235,235,245,0.15)' : 'rgba(235,235,245,0.5)' }}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Diagram */}
        <div className="flex items-center justify-center py-3 relative">
          <DiagramComp
            chord={activeChord}
            customDiagram={customChords[activeChord]}
            size={diagramSize}
          />
          <button
            onClick={() => setEditingChord(activeChord)}
            className="absolute top-2 right-2 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: '#2c2c2e', width: 22, height: 22 }}
            title="Edit diagram"
          >
            <Pencil size={11} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.5)' }} />
          </button>
        </div>

        {/* Chord list */}
        <div className="flex flex-col gap-0.5 px-2 pb-2">
          {chords.map((ch, i) => (
            <button
              key={ch}
              onClick={() => setActiveIdx(i)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: i === safeIdx ? '#32d74b1a' : 'transparent',
                color: i === safeIdx ? '#32d74b' : 'rgba(235,235,245,0.4)',
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {editingChord && (
        <ChordDiagramEditor chordName={editingChord} onClose={() => setEditingChord(null)} />
      )}
    </>
  )
}
