import { Info } from 'lucide-react'

interface Props {
  title: string
  children: React.ReactNode
}

/** Always-visible teaching card shown above each section of the Piano Trainer. */
export function InfoBlock({ title, children }: Props) {
  return (
    <div
      className="rounded-2xl p-3 flex gap-3 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--color-accent-dim) 0%, transparent 100%)',
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
          opacity: 0.7,
        }}
      />
      <div
        className="rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          width: 28,
          height: 28,
          marginLeft: 4,
          backgroundColor: 'var(--color-accent-dim)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <Info size={14} strokeWidth={2} style={{ color: 'var(--color-accent)' }} />
      </div>
      <div className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="font-semibold mb-0.5 text-sm" style={{ color: 'var(--color-text-primary)' }}>{title}</div>
        <div>{children}</div>
      </div>
    </div>
  )
}
