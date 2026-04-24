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
            className="flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all active:scale-95"
            style={{
              backgroundColor: active ? 'var(--color-accent)' : 'var(--color-card)',
              color: active ? '#fff' : 'var(--color-text-tertiary)',
              border: active ? 'none' : '1px solid var(--color-border)',
              minHeight: 56,
            }}
          >
            <span className="text-sm font-bold">{lvl.label}</span>
            <span className="text-[10px] leading-tight opacity-90">{lvl.sub}</span>
          </button>
        )
      })}
    </div>
  )
}
