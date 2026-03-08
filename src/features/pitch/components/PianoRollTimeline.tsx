import type { NoteInfo } from '../lib/pitchUtils'

interface NoteEntry {
  note: NoteInfo
  timestamp: number
}

interface ChordEntry {
  chord: string
  timestamp: number
}

interface Props {
  noteHistory?: NoteEntry[]
  chordHistory?: ChordEntry[]
  mode: 'note' | 'chord'
}

export function PianoRollTimeline({ noteHistory = [], chordHistory = [], mode }: Props) {
  const entries = mode === 'note'
    ? noteHistory.slice(-20).map((e) => ({ label: `${e.note.name}${e.note.octave}`, timestamp: e.timestamp }))
    : chordHistory.slice(-20).map((e) => ({ label: e.chord, timestamp: e.timestamp }))

  if (entries.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {mode === 'note' ? 'Play a note to see history' : 'Play a chord to see history'}
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-3">
      <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>History</p>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {entries.map((entry, i) => (
          <div
            key={`${entry.timestamp}-${i}`}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold"
            style={{
              backgroundColor: mode === 'note' ? 'var(--color-accent-dim)' : 'var(--color-chord)22',
              color: mode === 'note' ? 'var(--color-accent)' : 'var(--color-chord)',
              opacity: 0.4 + (i / entries.length) * 0.6,
            }}
          >
            {entry.label}
          </div>
        ))}
      </div>
    </div>
  )
}
