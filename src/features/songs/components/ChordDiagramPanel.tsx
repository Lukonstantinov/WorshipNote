import { useState } from 'react'
import { Pencil, ChevronLeft, ChevronRight, FlipHorizontal2 } from 'lucide-react'
import { useSettingsStore } from '../../../store/settingsStore'
import { GuitarDiagram } from './GuitarDiagram'
import { PianoDiagram } from './PianoDiagram'
import { BassDiagram } from './BassDiagram'
import { MiniGuitarDiagram } from './MiniGuitarDiagram'
import { MiniPianoDiagram } from './MiniPianoDiagram'
import { MiniBassDiagram } from './MiniBassDiagram'
import { ChordDiagramEditor } from './ChordDiagramEditor'
import type { ParsedSong } from '../types'

interface Props {
  parsed: ParsedSong
  position: 'side' | 'top'
}

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
  const {
    selectedInstrument, instruments,
    customChords, customPianoChords,
    chordDiagramMode,
    guitarFlipped, guitarDotColor, pianoHighlightColor, diagramScale,
  } = useSettingsStore()

  const chords = extractChords(parsed)
  const [activeIdx, setActiveIdx] = useState(0)
  const [editingChord, setEditingChord] = useState<string | null>(null)

  if (chords.length === 0) return null

  const safeIdx = Math.min(activeIdx, chords.length - 1)
  const activeChord = chords[safeIdx]

  const instrument = instruments.find((i) => i.id === selectedInstrument)
  const instrType = instrument?.type ?? 'guitar'
  const showPiano = instrType === 'piano' || instrType === 'keyboard'
  const showBass = instrType === 'bass'

  const scale = diagramScale ?? 1

  // Select diagram components based on instrument type
  const DiagramComp = showPiano
    ? (props: { chord: string; size?: number }) => (
        <PianoDiagram
          chord={props.chord}
          customDiagram={customPianoChords[props.chord]}
          size={props.size}
          highlightColor={pianoHighlightColor}
        />
      )
    : showBass
    ? (props: { chord: string; size?: number }) => (
        <BassDiagram
          chord={props.chord}
          customDiagram={customChords[props.chord]}
          size={props.size}
          dotColor={guitarDotColor}
          flipped={guitarFlipped}
        />
      )
    : (props: { chord: string; size?: number }) => (
        <GuitarDiagram
          chord={props.chord}
          customDiagram={customChords[props.chord]}
          size={props.size}
          dotColor={guitarDotColor}
          flipped={guitarFlipped}
        />
      )

  const MiniComp = showPiano
    ? (props: { chord: string; size?: number }) => (
        <MiniPianoDiagram
          chord={props.chord}
          customDiagram={customPianoChords[props.chord]}
          size={props.size}
          highlightColor={pianoHighlightColor}
        />
      )
    : showBass
    ? (props: { chord: string; size?: number }) => (
        <MiniBassDiagram
          chord={props.chord}
          customDiagram={customChords[props.chord]}
          size={props.size}
          dotColor={guitarDotColor}
          flipped={guitarFlipped}
        />
      )
    : (props: { chord: string; size?: number }) => (
        <MiniGuitarDiagram
          chord={props.chord}
          customDiagram={customChords[props.chord]}
          size={props.size}
          dotColor={guitarDotColor}
          flipped={guitarFlipped}
        />
      )

  const mode = chordDiagramMode ?? 'single'

  const editBtn = (ch: string, sz: number) => (
    <button
      onClick={() => setEditingChord(ch)}
      className="absolute top-0 right-0 flex items-center justify-center rounded-lg"
      style={{ backgroundColor: 'var(--color-card-raised)', width: sz, height: sz }}
      title="Edit diagram"
    >
      <Pencil size={sz * 0.5} strokeWidth={2} style={{ color: 'var(--color-text-tertiary)' }} />
    </button>
  )

  // ── ALL mode ──
  if (mode === 'all') {
    const sz = Math.round(90 * scale)
    if (position === 'top') {
      return (
        <>
          <div className="px-3 py-2 border-b flex-shrink-0 overflow-x-auto scrollbar-none" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg)' }}>
            <div className="flex items-center gap-2 min-w-max">
              {chords.map((ch) => (
                <div key={ch} className="relative flex-shrink-0">
                  <DiagramComp chord={ch} size={sz} />
                  {editBtn(ch, 18)}
                </div>
              ))}
            </div>
          </div>
          {editingChord && <ChordDiagramEditor chordName={editingChord} instrumentType={instrType} onClose={() => setEditingChord(null)} />}
        </>
      )
    }
    return (
      <>
        <div className="flex flex-col flex-shrink-0 border-l overflow-y-auto" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-secondary)', width: Math.round(160 * scale) }}>
          <div className="flex flex-col gap-2 p-2">
            {chords.map((ch) => (
              <div key={ch} className="relative flex items-center justify-center">
                <DiagramComp chord={ch} size={Math.round(120 * scale)} />
                {editBtn(ch, 20)}
              </div>
            ))}
          </div>
        </div>
        {editingChord && <ChordDiagramEditor chordName={editingChord} instrumentType={instrType} onClose={() => setEditingChord(null)} />}
      </>
    )
  }

  // ── MINI mode ──
  if (mode === 'mini') {
    const miniSz = Math.round(56 * scale)
    if (position === 'top') {
      return (
        <>
          <div className="px-3 py-1.5 border-b flex-shrink-0 overflow-x-auto scrollbar-none" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg)' }}>
            <div className="flex items-center gap-1.5 min-w-max">
              {chords.map((ch) => (
                <div
                  key={ch}
                  className="flex-shrink-0 cursor-pointer rounded-lg p-0.5 transition-all"
                  style={{ backgroundColor: ch === activeChord ? 'var(--color-card)' : 'transparent' }}
                  onClick={() => setActiveIdx(chords.indexOf(ch))}
                >
                  <MiniComp chord={ch} size={miniSz} />
                </div>
              ))}
            </div>
          </div>
          {editingChord && <ChordDiagramEditor chordName={editingChord} instrumentType={instrType} onClose={() => setEditingChord(null)} />}
        </>
      )
    }
    return (
      <>
        <div className="flex flex-col flex-shrink-0 border-l overflow-y-auto" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-secondary)', width: Math.round(80 * scale) }}>
          <div className="flex flex-col gap-1 p-1">
            {chords.map((ch) => (
              <div
                key={ch}
                className="flex items-center justify-center rounded-lg p-0.5 transition-all cursor-pointer"
                style={{ backgroundColor: ch === activeChord ? 'var(--color-card)' : 'transparent' }}
                onClick={() => setActiveIdx(chords.indexOf(ch))}
              >
                <MiniComp chord={ch} size={miniSz} />
              </div>
            ))}
          </div>
        </div>
        {editingChord && <ChordDiagramEditor chordName={editingChord} instrumentType={instrType} onClose={() => setEditingChord(null)} />}
      </>
    )
  }

  // ── SINGLE mode (default) ──
  const diagramSize = Math.round((position === 'top' ? 100 : 130) * scale)

  if (position === 'top') {
    return (
      <>
        <div className="px-3 py-2 border-b flex-shrink-0 overflow-x-auto scrollbar-none" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg)' }}>
          <div className="flex items-center gap-3 min-w-max">
            <div className="flex items-center gap-1.5">
              {chords.map((ch, i) => (
                <button
                  key={ch}
                  onClick={() => setActiveIdx(i)}
                  className="px-2 py-0.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: i === safeIdx ? '#32d74b22' : 'var(--color-card)',
                    color: i === safeIdx ? 'var(--color-chord)' : 'var(--color-text-tertiary)',
                    border: i === safeIdx ? '1px solid #32d74b44' : '1px solid transparent',
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>
            <div className="relative flex-shrink-0" style={{ marginLeft: 8 }}>
              <DiagramComp chord={activeChord} size={diagramSize} />
              {editBtn(activeChord, 20)}
            </div>
          </div>
        </div>
        {editingChord && <ChordDiagramEditor chordName={editingChord} instrumentType={instrType} onClose={() => setEditingChord(null)} />}
      </>
    )
  }

  // Side panel - single mode
  return (
    <>
      <div
        className="flex flex-col flex-shrink-0 border-l overflow-y-auto"
        style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-secondary)', width: Math.round(160 * scale) }}
      >
        <div className="flex items-center justify-between px-2 py-1.5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <button
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            disabled={safeIdx === 0}
            style={{ color: safeIdx === 0 ? 'var(--color-text-muted)' : 'var(--color-text-tertiary)' }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-chord)' }}>{activeChord}</span>
          <button
            onClick={() => setActiveIdx((i) => Math.min(chords.length - 1, i + 1))}
            disabled={safeIdx === chords.length - 1}
            style={{ color: safeIdx === chords.length - 1 ? 'var(--color-text-muted)' : 'var(--color-text-tertiary)' }}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center justify-center py-3 relative">
          <DiagramComp chord={activeChord} size={diagramSize} />
          {editBtn(activeChord, 22)}
        </div>

        {/* Flip button for guitar/bass */}
        {!showPiano && (
          <div className="flex justify-center pb-1">
            <button
              onClick={() => useSettingsStore.getState().setGuitarFlipped(!guitarFlipped)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
              style={{
                backgroundColor: guitarFlipped ? '#32d74b22' : 'transparent',
                color: guitarFlipped ? 'var(--color-chord)' : 'var(--color-text-muted)',
              }}
              title="Flip fret diagram"
            >
              <FlipHorizontal2 size={12} strokeWidth={2} />
              flip
            </button>
          </div>
        )}

        <div className="flex flex-col gap-0.5 px-2 pb-2">
          {chords.map((ch, i) => (
            <button
              key={ch}
              onClick={() => setActiveIdx(i)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: i === safeIdx ? '#32d74b1a' : 'transparent',
                color: i === safeIdx ? 'var(--color-chord)' : 'var(--color-text-tertiary)',
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {editingChord && <ChordDiagramEditor chordName={editingChord} instrumentType={instrType} onClose={() => setEditingChord(null)} />}
    </>
  )
}
