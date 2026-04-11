import { useState } from 'react'
import { X, Save, Trash2 } from 'lucide-react'
import { Note } from 'tonal'
import { useSettingsStore } from '../../../store/settingsStore'
import type { CustomChordDiagram } from '../types'
import { useTranslation } from 'react-i18next'

interface Props {
  chordName: string
  instrumentType?: 'guitar' | 'piano' | 'bass' | 'ukulele' | 'keyboard' | 'drums' | 'other'
  onClose: () => void
}

const GUITAR_STRING_COUNT = 6
const BASS_STRING_COUNT = 4
const FRET_COUNT = 5

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BLACK_KEY_POSITIONS = [0.5, 1.5, 3.5, 4.5, 5.5]
const BLACK_KEY_NAMES = ['C#', 'D#', 'F#', 'G#', 'A#']

// Guitar / Bass fret editor
function FretEditor({ chordName, stringCount, onClose }: { chordName: string; stringCount: number; onClose: () => void }) {
  const { t } = useTranslation()
  const { customChords, setCustomChord, deleteCustomChord, guitarDotColor } = useSettingsStore()
  const existing = customChords[chordName]
  const [frets, setFrets] = useState<number[]>(existing?.frets ?? Array(stringCount).fill(0))
  const [fingers] = useState<number[]>(existing?.fingers ?? Array(stringCount).fill(0))
  const [baseFret, setBaseFret] = useState(existing?.baseFret ?? 1)
  const [comment, setComment] = useState(existing?.comment ?? '')

  const toggleFret = (si: number, fn: number) =>
    setFrets((prev) => { const n = [...prev]; n[si] = n[si] === fn ? 0 : fn; return n })

  const cycleMuteOpen = (si: number) =>
    setFrets((prev) => { const n = [...prev]; n[si] = n[si] === -1 ? 0 : n[si] === 0 ? -1 : n[si]; return n })

  const save = () => {
    const diagram: CustomChordDiagram = { frets, fingers, baseFret, comment: comment.trim() || undefined }
    setCustomChord(chordName, diagram)
    onClose()
  }
  const remove = () => { deleteCustomChord(chordName); onClose() }

  const pad = 28; const topPad = 16; const w = 220; const h = 180
  const gridW = w - pad * 2; const gridH = h - topPad - 12
  const stringGap = gridW / (stringCount - 1); const fretGap = gridH / FRET_COUNT
  const dotR = Math.min(stringGap, fretGap) * 0.35

  return (
    <>
      <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
        Tap dots to set frets. Top icons: X = muted, O = open.
      </p>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Start fret:</span>
        <button onClick={() => setBaseFret((b) => Math.max(1, b - 1))} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-primary)' }}>−</button>
        <span className="text-sm font-semibold w-4 text-center" style={{ color: 'var(--color-text-primary)' }}>{baseFret}</span>
        <button onClick={() => setBaseFret((b) => Math.min(12, b + 1))} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-primary)' }}>+</button>
      </div>
      <svg width={w} height={h} className="mx-auto block" style={{ cursor: 'pointer' }}>
        <rect x={pad} y={topPad} width={gridW} height={3} rx={1.5} fill="var(--color-diagram-text)" />
        {Array.from({ length: FRET_COUNT }).map((_, fi) => (
          <line key={fi} x1={pad} y1={topPad + (fi + 1) * fretGap} x2={pad + gridW} y2={topPad + (fi + 1) * fretGap} stroke="var(--color-diagram-stroke)" strokeWidth={1} />
        ))}
        {Array.from({ length: stringCount }).map((_, si) => (
          <line key={si} x1={pad + si * stringGap} y1={topPad} x2={pad + si * stringGap} y2={topPad + gridH} stroke="var(--color-diagram-stroke)" strokeWidth={1.5} />
        ))}
        {Array.from({ length: stringCount }).map((_, si) => {
          const cx = pad + si * stringGap; const cy = topPad - 8
          const isMuted = frets[si] === -1; const isOpen = frets[si] === 0
          return (
            <g key={si} onClick={() => cycleMuteOpen(si)} style={{ cursor: 'pointer' }}>
              {isMuted ? (
                <g>
                  <line x1={cx-4} y1={cy-4} x2={cx+4} y2={cy+4} stroke="var(--color-diagram-fret)" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1={cx+4} y1={cy-4} x2={cx-4} y2={cy+4} stroke="var(--color-diagram-fret)" strokeWidth={1.5} strokeLinecap="round" />
                </g>
              ) : isOpen ? (
                <circle cx={cx} cy={cy} r={4} stroke="var(--color-diagram-fret)" strokeWidth={1.5} fill="none" />
              ) : (
                <circle cx={cx} cy={cy} r={5} fill="var(--color-diagram-stroke)" opacity={0.4} />
              )}
            </g>
          )
        })}
        {Array.from({ length: stringCount }).map((_, si) =>
          Array.from({ length: FRET_COUNT }).map((_, fi) => {
            const cx = pad + si * stringGap; const cy = topPad + fi * fretGap + fretGap / 2
            const isActive = frets[si] === fi + 1
            return (
              <g key={`${si}-${fi}`} onClick={() => toggleFret(si, fi + 1)} style={{ cursor: 'pointer' }}>
                <circle cx={cx} cy={cy} r={dotR + 4} fill="transparent" />
                {isActive ? <circle cx={cx} cy={cy} r={dotR} fill={guitarDotColor} /> : <circle cx={cx} cy={cy} r={3} fill="var(--color-diagram-stroke)" opacity={0.25} />}
              </g>
            )
          })
        )}
      </svg>
      <input
        type="text" placeholder="Comment (optional)" value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full rounded-xl px-3 py-2 text-xs mt-3"
        style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)', border: 'none', outline: 'none' }}
      />
      <div className="flex gap-2 mt-3">
        <button onClick={save} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-primary)' }}>
          <Save size={14} strokeWidth={2} />{t('save')}
        </button>
        {existing && (
          <button onClick={remove} className="flex items-center justify-center rounded-xl transition-all active:scale-95" style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 44 }}>
            <Trash2 size={16} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
          </button>
        )}
      </div>
    </>
  )
}

// Piano keyboard editor
function PianoEditor({ chordName, onClose }: { chordName: string; onClose: () => void }) {
  const { t } = useTranslation()
  const { customPianoChords, setCustomPianoChord, deleteCustomPianoChord, pianoHighlightColor } = useSettingsStore()
  const existing = customPianoChords[chordName]
  const [selectedNotes, setSelectedNotes] = useState<string[]>(existing?.notes ?? [])
  const [comment, setComment] = useState(existing?.comment ?? '')

  const toggleNote = (note: string) =>
    setSelectedNotes((prev) => prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note])

  const isHighlighted = (noteName: string) =>
    selectedNotes.some((n) => {
      const pc = Note.pitchClass(n) || n
      return pc === noteName || (
        Note.midi(pc + '4') != null && Note.midi(noteName + '4') != null &&
        (Note.midi(pc + '4')! % 12) === (Note.midi(noteName + '4')! % 12)
      )
    })

  const save = () => {
    setCustomPianoChord(chordName, { notes: selectedNotes, comment: comment.trim() || undefined })
    onClose()
  }
  const remove = () => { deleteCustomPianoChord(chordName); onClose() }

  const WHITE_COUNT = 14
  const w = 220; const h = 80
  const wKeyW = w / WHITE_COUNT; const wKeyH = h
  const bKeyW = wKeyW * 0.65; const bKeyH = h * 0.62

  const blackPositions: number[] = []
  for (let oct = 0; oct < 2; oct++) BLACK_KEY_POSITIONS.forEach((p) => blackPositions.push(p + oct * 7))

  return (
    <>
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
        Tap keys to highlight notes for this chord.
      </p>
      <svg width={w} height={h} className="mx-auto block">
        {Array.from({ length: WHITE_COUNT }).map((_, i) => {
          const noteName = WHITE_KEYS[i % 7]; const hi = isHighlighted(noteName)
          return <rect key={i} x={i * wKeyW + 0.5} y={0.5} width={wKeyW - 1} height={wKeyH - 1} rx={2} fill={hi ? pianoHighlightColor : 'var(--color-piano-white)'} stroke="var(--color-piano-stroke)" strokeWidth={0.5} onClick={() => toggleNote(noteName)} style={{ cursor: 'pointer' }} />
        })}
        {blackPositions.map((pos, bi) => {
          const noteName = BLACK_KEY_NAMES[bi % BLACK_KEY_NAMES.length]; const hi = isHighlighted(noteName)
          const x = pos * wKeyW + wKeyW / 2 - bKeyW / 2
          return <rect key={bi} x={x} y={0} width={bKeyW} height={bKeyH} rx={2} fill={hi ? 'var(--color-info)' : 'var(--color-piano-black)'} onClick={() => toggleNote(noteName)} style={{ cursor: 'pointer' }} />
        })}
      </svg>
      {selectedNotes.length > 0 && (
        <p className="text-xs text-center mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{selectedNotes.join(' · ')}</p>
      )}
      <input
        type="text" placeholder="Comment (optional)" value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full rounded-xl px-3 py-2 text-xs mt-3"
        style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)', border: 'none', outline: 'none' }}
      />
      <div className="flex gap-2 mt-3">
        <button onClick={save} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-primary)' }}>
          <Save size={14} strokeWidth={2} />{t('save')}
        </button>
        {existing && (
          <button onClick={remove} className="flex items-center justify-center rounded-xl transition-all active:scale-95" style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 44 }}>
            <Trash2 size={16} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
          </button>
        )}
      </div>
    </>
  )
}

export function ChordDiagramEditor({ chordName, instrumentType = 'guitar', onClose }: Props) {
  const { t } = useTranslation()
  const isPiano = instrumentType === 'piano' || instrumentType === 'keyboard'
  const isBass = instrumentType === 'bass'
  const isUkulele = instrumentType === 'ukulele'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rounded-2xl p-4 w-72" style={{ backgroundColor: 'var(--color-card)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-sm">
            {t('editChordDiagram')}: {chordName}
            {isPiano && <span className="ml-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>(piano)</span>}
            {isBass && <span className="ml-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>(bass)</span>}
            {isUkulele && <span className="ml-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>(ukulele)</span>}
          </h3>
          <button onClick={onClose}>
            <X size={16} strokeWidth={2} style={{ color: 'var(--color-text-tertiary)' }} />
          </button>
        </div>
        {isPiano ? (
          <PianoEditor chordName={chordName} onClose={onClose} />
        ) : (
          <FretEditor chordName={chordName} stringCount={isBass || isUkulele ? BASS_STRING_COUNT : GUITAR_STRING_COUNT} onClose={onClose} />
        )}
      </div>
    </div>
  )
}
