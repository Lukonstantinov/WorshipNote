import type { NoteInfo } from '../lib/pitchUtils'

interface Props {
  note: NoteInfo | null
  confidence: number
}

export function PitchDisplay({ note, confidence }: Props) {
  const opacity = note ? Math.max(0.3, confidence) : 0.15

  return (
    <div className="flex flex-col items-center justify-center py-8" style={{ opacity }}>
      <div
        className="text-8xl font-black tracking-tight leading-none"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {note ? note.name : '—'}
      </div>
      {note && (
        <div
          className="text-2xl font-medium mt-1"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {note.octave}
        </div>
      )}
      {note && (
        <div
          className="text-xs mt-2 font-mono"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {note.frequency.toFixed(1)} Hz
        </div>
      )}
    </div>
  )
}
