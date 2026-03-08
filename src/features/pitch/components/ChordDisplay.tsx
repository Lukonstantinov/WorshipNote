interface Props {
  chord: string | null
  confidence: number
}

export function ChordDisplay({ chord, confidence }: Props) {
  const opacity = chord ? Math.max(0.3, confidence) : 0.15

  return (
    <div className="flex flex-col items-center justify-center py-8" style={{ opacity }}>
      <div
        className="text-7xl font-black tracking-tight leading-none"
        style={{ color: 'var(--color-chord)' }}
      >
        {chord ?? '—'}
      </div>
      {chord && (
        <div
          className="text-sm mt-3 font-medium"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {Math.round(confidence * 100)}% match
        </div>
      )}
    </div>
  )
}
