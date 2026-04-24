import { Info } from 'lucide-react'

interface Props {
  title: string
  children: React.ReactNode
}

/** Small always-visible explainer shown above each section of the Piano Trainer. */
export function InfoBlock({ title, children }: Props) {
  return (
    <div
      className="rounded-xl p-3 flex gap-3"
      style={{
        backgroundColor: 'var(--color-accent-dim)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <Info size={16} strokeWidth={2} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }} />
      <div className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{title}</div>
        <div>{children}</div>
      </div>
    </div>
  )
}
