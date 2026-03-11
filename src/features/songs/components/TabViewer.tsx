import type { GuitarTab } from '../types'
import { generateAsciiTab } from '../lib/tabUtils'

const INSTRUMENT_LABEL: Record<GuitarTab['instrument'], string> = {
  guitar: 'Guitar',
  bass: 'Bass',
  ukulele: 'Ukulele',
}

interface Props {
  tab: GuitarTab
}

export function TabViewer({ tab }: Props) {
  const ascii = generateAsciiTab(tab)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <span className="font-semibold text-sm flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
          {tab.name || 'Untitled Tab'}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
        >
          {INSTRUMENT_LABEL[tab.instrument]}
        </span>
      </div>

      {/* ASCII tab */}
      <div className="overflow-x-auto">
        <pre
          className="px-4 py-3 text-xs leading-relaxed"
          style={{
            fontFamily: 'JetBrains Mono, Fira Code, Menlo, Courier New, monospace',
            color: 'var(--color-text-secondary)',
            whiteSpace: 'pre',
            margin: 0,
          }}
        >
          {ascii}
        </pre>
      </div>

      {tab.description && (
        <div
          className="px-4 pb-3 text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {tab.description}
        </div>
      )}
    </div>
  )
}
