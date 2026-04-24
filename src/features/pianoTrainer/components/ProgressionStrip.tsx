import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

interface Props {
  chords: string[]
  focusedIndex: number
  onFocus: (idx: number) => void
  onRemove: (idx: number) => void
  onMove: (from: number, to: number) => void
  onClear: () => void
}

export function ProgressionStrip({ chords, focusedIndex, onFocus, onRemove, onMove, onClear }: Props) {
  if (chords.length === 0) {
    return (
      <div
        className="rounded-xl py-6 text-center text-sm"
        style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-muted)' }}
      >
        Pick chords above to start your progression.
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 overflow-x-auto">
        <div className="flex items-center gap-2 py-1 min-w-min">
          {chords.map((chord, idx) => {
            const isFocused = idx === focusedIndex
            return (
              <div key={idx} className="flex items-center gap-0 flex-shrink-0">
                <div
                  className="flex flex-col items-center rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: isFocused ? 'var(--color-accent-dim)' : 'var(--color-card-raised)',
                    border: isFocused ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                  }}
                >
                  <button
                    onClick={() => onFocus(idx)}
                    className="px-4 py-2 text-base font-semibold"
                    style={{
                      color: isFocused ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      minWidth: 50,
                    }}
                  >
                    {chord}
                  </button>
                  <div className="flex" style={{ backgroundColor: 'var(--color-card)', width: '100%' }}>
                    <button
                      onClick={() => idx > 0 && onMove(idx, idx - 1)}
                      disabled={idx === 0}
                      className="flex-1 py-1 disabled:opacity-20"
                      aria-label="Move left"
                    >
                      <ChevronLeft size={12} strokeWidth={2} style={{ color: 'var(--color-text-secondary)', margin: '0 auto' }} />
                    </button>
                    <button
                      onClick={() => onRemove(idx)}
                      className="flex-1 py-1"
                      aria-label="Remove"
                    >
                      <X size={12} strokeWidth={2.5} style={{ color: 'var(--color-error)', margin: '0 auto' }} />
                    </button>
                    <button
                      onClick={() => idx < chords.length - 1 && onMove(idx, idx + 1)}
                      disabled={idx === chords.length - 1}
                      className="flex-1 py-1 disabled:opacity-20"
                      aria-label="Move right"
                    >
                      <ChevronRight size={12} strokeWidth={2} style={{ color: 'var(--color-text-secondary)', margin: '0 auto' }} />
                    </button>
                  </div>
                </div>
                {idx < chords.length - 1 && (
                  <span className="mx-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>→</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <button
        onClick={onClear}
        className="flex-shrink-0 p-2 rounded-xl transition-all active:scale-95"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          minWidth: 44, minHeight: 44,
        }}
        aria-label="Clear all"
      >
        <Trash2 size={16} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
      </button>
    </div>
  )
}
