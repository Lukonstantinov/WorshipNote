import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { sectionVars } from './navItems'
import { alpha } from '../lib/color'

interface Props {
  title: string
  subtitle?: string
  Icon: LucideIcon
  /** section colour key: library | setlists | chords | practice | settings */
  color: string
  actions?: ReactNode
}

/** Big, colourful page title with an icon badge in the section's gradient. */
export function PageHeader({ title, subtitle, Icon, color, actions }: Props) {
  const { c1, grad } = sectionVars(color)
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="flex items-center justify-center rounded-2xl flex-shrink-0"
        style={{ width: 44, height: 44, background: grad, color: '#fff', boxShadow: `0 6px 16px ${alpha(c1, 35)}` }}
      >
        <Icon size={22} strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold tracking-tight leading-tight truncate">{title}</h2>
        {subtitle && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-tertiary)' }}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}

/** Primary call-to-action button styled with a section gradient. */
export function sectionButtonStyle(color: string): React.CSSProperties {
  const { c1, grad } = sectionVars(color)
  return { '--btn-grad': grad, '--btn-color': c1 } as React.CSSProperties
}
