import { useState } from 'react'
import { Info, ChevronDown } from 'lucide-react'

interface Props {
  title: string
  children: React.ReactNode
  /** Whether the block starts expanded. Defaults to false (collapsed). */
  defaultOpen?: boolean
}

/** Collapsible teaching card shown above each section of the Piano Trainer. */
export function InfoBlock({ title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="rounded-2xl relative overflow-hidden"
      style={{
        background: open
          ? 'linear-gradient(135deg, var(--color-accent-dim) 0%, transparent 100%)'
          : 'var(--color-card)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: 'var(--color-accent)',
          opacity: open ? 0.7 : 0.35,
        }}
      />
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-3 text-left"
        aria-expanded={open}
      >
        <div
          className="rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            width: 24,
            height: 24,
            marginLeft: 4,
            backgroundColor: 'var(--color-accent-dim)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <Info size={12} strokeWidth={2} style={{ color: 'var(--color-accent)' }} />
        </div>
        <span
          className="flex-1 font-semibold text-sm"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          style={{
            color: 'var(--color-text-tertiary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms ease',
          }}
        />
      </button>
      {open && (
        <div
          className="px-4 pb-3 text-xs leading-relaxed"
          style={{ color: 'var(--color-text-secondary)', paddingLeft: 44 }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
