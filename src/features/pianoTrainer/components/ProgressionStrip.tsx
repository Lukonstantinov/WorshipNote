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
        className="rounded-2xl py-8 text-center text-sm"
        style={{
          background: 'linear-gradient(135deg, var(--color-card) 0%, var(--color-card-raised) 100%)',
          color: 'var(--color-text-muted)',
          border: '1px dashed var(--color-border)',
        }}
      >
        Pick chords above to start your progression.
      </div>
    )
  }

  return (
    <div className="flex items-stretch gap-2">
      <div
        className="flex-1 overflow-x-auto rounded-2xl"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          padding: '10px',
        }}
      >
        <div className="flex items-center gap-2 min-w-min">
          {chords.map((chord, idx) => {
            const isFocused = idx === focusedIndex
            return (
              <div key={idx} className="flex items-center gap-0 flex-shrink-0">
                <div
                  className="flex flex-col items-stretch rounded-xl overflow-hidden transition-all"
                  style={{
                    background: isFocused
                      ? 'linear-gradient(135deg, var(--color-accent-dim) 0%, var(--color-card-raised) 100%)'
                      : 'var(--color-card-raised)',
                    border: isFocused ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                    boxShadow: isFocused ? '0 0 0 3px var(--color-accent-dim)' : '0 1px 2px var(--color-shadow)',
                  }}
                >
                  <button
                    onClick={() => onFocus(idx)}
                    className="px-4 py-2 font-bold"
                    style={{
                      color: isFocused ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      minWidth: 58,
                      fontSize: 18,
                    }}
                  >
                    {chord}
                  </button>
                  <div className="flex" style={{ backgroundColor: 'var(--color-card)', width: '100%', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <button
                      onClick={() => idx > 0 && onMove(idx, idx - 1)}
                      disabled={idx === 0}
                      className="flex-1 py-1 disabled:opacity-20 hover:opacity-80"
                      aria-label="Move left"
                    >
                      <ChevronLeft size={12} strokeWidth={2} style={{ color: 'var(--color-text-secondary)', margin: '0 auto' }} />
                    </button>
                    <button
                      onClick={() => onRemove(idx)}
                      className="flex-1 py-1 hover:opacity-80"
                      aria-label="Remove"
                    >
                      <X size={12} strokeWidth={2.5} style={{ color: 'var(--color-error)', margin: '0 auto' }} />
                    </button>
                    <button
                      onClick={() => idx < chords.length - 1 && onMove(idx, idx + 1)}
                      disabled={idx === chords.length - 1}
                      className="flex-1 py-1 disabled:opacity-20 hover:opacity-80"
                      aria-label="Move right"
                    >
                      <ChevronRight size={12} strokeWidth={2} style={{ color: 'var(--color-text-secondary)', margin: '0 auto' }} />
                    </button>
                  </div>
                </div>
                {idx < chords.length - 1 && (
                  <span className="mx-1 text-base" style={{ color: 'var(--color-text-muted)' }}>→</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <button
        onClick={onClear}
        className="flex-shrink-0 flex items-center justify-center rounded-2xl transition-all active:scale-95"
        style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          minWidth: 48, minHeight: 48,
          alignSelf: 'stretch',
        }}
        aria-label="Clear all"
      >
        <Trash2 size={16} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
      </button>
    </div>
  )
}
