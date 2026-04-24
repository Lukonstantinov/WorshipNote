import type { TrainerLevel } from '../../../store/pianoTrainerStore'

interface Props {
  value: TrainerLevel
  onChange: (level: TrainerLevel) => void
}

const LEVELS: { value: TrainerLevel; label: string; sub: string }[] = [
  { value: 1, label: 'L1', sub: 'Block chord'    },
  { value: 2, label: 'L2', sub: 'Voice leading'  },
  { value: 3, label: 'L3', sub: '+ Bass root'    },
  { value: 4, label: 'L4', sub: '+ Bass pattern' },
]

export function LevelPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {LEVELS.map((lvl) => {
        const active = value === lvl.value
        return (
          <button
            key={lvl.value}
            onClick={() => onChange(lvl.value)}
            className="flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all active:scale-95"
            style={{
              background: active
                ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent) 70%)'
                : 'var(--color-card)',
              color: active ? '#fff' : 'var(--color-text-secondary)',
              border: active ? 'none' : '1px solid var(--color-border)',
              boxShadow: active ? '0 4px 12px var(--color-accent-dim)' : '0 1px 2px var(--color-shadow)',
              minHeight: 68,
            }}
          >
            <span className="text-sm font-bold tracking-wide">{lvl.label}</span>
            {/* Difficulty dots */}
            <span className="flex gap-0.5" aria-hidden>
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  style={{
                    display: 'inline-block',
                    width: 4, height: 4, borderRadius: 2,
                    backgroundColor: n <= lvl.value
                      ? (active ? '#fff' : 'var(--color-accent)')
                      : (active ? 'rgba(255,255,255,0.25)' : 'var(--color-border)'),
                  }}
                />
              ))}
            </span>
            <span className="text-[10px] leading-tight opacity-85 text-center px-1">{lvl.sub}</span>
          </button>
        )
      })}
    </div>
  )
}
