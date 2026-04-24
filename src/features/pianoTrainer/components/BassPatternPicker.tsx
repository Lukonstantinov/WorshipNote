import { BASS_PATTERNS, type BassPatternId } from '../lib/bassPatterns'

interface Props {
  value: BassPatternId
  onChange: (id: BassPatternId) => void
}

export function BassPatternPicker({ value, onChange }: Props) {
  const current = BASS_PATTERNS.find((p) => p.id === value)
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BassPatternId)}
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          borderRadius: 12,
          padding: '8px 12px',
          fontSize: 14,
          minHeight: 44,
          cursor: 'pointer',
          outline: 'none',
          width: '100%',
        }}
      >
        {BASS_PATTERNS.map((p) => (
          <option key={p.id} value={p.id} style={{ backgroundColor: 'var(--color-card)' }}>
            {p.name}
          </option>
        ))}
      </select>
      {current && (
        <p className="text-xs mt-1.5 px-1" style={{ color: 'var(--color-text-muted)' }}>
          {current.description}
        </p>
      )}
    </div>
  )
}
