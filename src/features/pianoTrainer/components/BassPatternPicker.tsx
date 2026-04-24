import { BASS_PATTERNS, type BassPatternId } from '../lib/bassPatterns'

interface Props {
  value: BassPatternId
  onChange: (id: BassPatternId) => void
}

export function BassPatternPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {BASS_PATTERNS.map((p) => {
        const active = p.id === value
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id as BassPatternId)}
            className="flex flex-col items-start text-left rounded-2xl transition-all active:scale-[0.98]"
            style={{
              background: active
                ? 'linear-gradient(135deg, var(--color-info) 0%, rgba(10,132,255,0.7) 100%)'
                : 'var(--color-card)',
              color: active ? '#fff' : 'var(--color-text-primary)',
              border: active ? 'none' : '1px solid var(--color-border)',
              boxShadow: active ? '0 4px 12px rgba(10,132,255,0.25)' : '0 1px 2px var(--color-shadow)',
              padding: '10px 14px',
              minHeight: 60,
            }}
          >
            <span className="font-semibold text-sm">{p.name}</span>
            <span className="text-[11px] mt-0.5 leading-tight" style={{ opacity: active ? 0.9 : 0.65 }}>
              {p.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
