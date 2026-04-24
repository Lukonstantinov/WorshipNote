import { ALL_ROOTS, type PianoKey, type KeyMode } from '../lib/keyChords'

interface Props {
  value: PianoKey
  onChange: (key: PianoKey) => void
}

export function KeyPicker({ value, onChange }: Props) {
  const selectStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: 12,
    padding: '8px 12px',
    fontSize: 14,
    minHeight: 44,
    cursor: 'pointer',
    outline: 'none',
  }

  return (
    <div className="flex gap-2">
      <select
        value={value.root}
        onChange={(e) => onChange({ ...value, root: e.target.value })}
        style={{ ...selectStyle, flex: 1 }}
      >
        {ALL_ROOTS.map((r) => (
          <option key={r} value={r} style={{ backgroundColor: 'var(--color-card)' }}>{r}</option>
        ))}
      </select>
      <select
        value={value.mode}
        onChange={(e) => onChange({ ...value, mode: e.target.value as KeyMode })}
        style={{ ...selectStyle, flex: 1 }}
      >
        <option value="major" style={{ backgroundColor: 'var(--color-card)' }}>major</option>
        <option value="minor" style={{ backgroundColor: 'var(--color-card)' }}>minor</option>
      </select>
    </div>
  )
}
