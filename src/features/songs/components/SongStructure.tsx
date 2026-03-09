import { useTranslation } from 'react-i18next'

interface Props {
  labels: string[]
  pattern: string
  /** Optional manual override string e.g. "A B A B C B" */
  manualStructure?: string
}

const TYPE_COLORS: [string, string][] = [
  ['КУПЛЕТ', 'var(--color-info)'],
  ['VERSE', 'var(--color-info)'],
  ['ПРИПЕВ', 'var(--color-accent)'],
  ['CHORUS', 'var(--color-accent)'],
  ['РЕФРЕН', 'var(--color-accent)'],
  ['PRE-CHORUS', 'var(--color-info)'],
  ['ПРЕДПРИПЕВ', 'var(--color-info)'],
  ['МОСТ', 'var(--color-warning)'],
  ['BRIDGE', 'var(--color-warning)'],
  ['ВСТУПЛЕНИЕ', 'var(--color-chord)'],
  ['INTRO', 'var(--color-chord)'],
  ['ИНТРО', 'var(--color-chord)'],
  ['ФИНАЛ', 'var(--color-error)'],
  ['OUTRO', 'var(--color-error)'],
  ['ENDING', 'var(--color-error)'],
  ['ОКОНЧАНИЕ', 'var(--color-error)'],
  ['КОДА', 'var(--color-error)'],
  ['ПОВТОР', '#5e5ce6'],
  ['INTERLUDE', '#ff6482'],
  ['ИНТЕРЛЮДИЯ', '#ff6482'],
  ['SOLO', '#ffd60a'],
  ['СОЛО', '#ffd60a'],
  ['TAG', '#5ac8fa'],
  ['ТЕГ', '#5ac8fa'],
  ['INSTRUMENTAL', 'var(--color-warning)'],
  ['ИНСТРУМЕНТАЛ', 'var(--color-warning)'],
]

function sectionColor(label: string): string {
  const up = label.toUpperCase()
  for (const [key, color] of TYPE_COLORS) {
    if (up.includes(key)) return color
  }
  return 'rgba(235,235,245,0.45)'
}

function collapseRepeats(parts: string[]): { label: string; count: number }[] {
  const result: { label: string; count: number }[] = []
  for (const p of parts) {
    if (result.length && result[result.length - 1].label === p) {
      result[result.length - 1].count++
    } else {
      result.push({ label: p, count: 1 })
    }
  }
  return result
}

export function SongStructure({ labels, pattern, manualStructure }: Props) {
  const { t } = useTranslation()

  const displayPattern = manualStructure || pattern
  if (!displayPattern && labels.length === 0) return null

  // Split pattern: if it has spaces, split by spaces; otherwise split each character
  const hasSpaces = /\s/.test(displayPattern)
  const patternParts = hasSpaces
    ? displayPattern.split(/\s+/).filter(Boolean)
    : displayPattern.split('').filter((c) => /[A-Za-z]/.test(c))
  const collapsed = collapseRepeats(patternParts)

  return (
    <div
      className="px-3 py-2 border-b flex-shrink-0 overflow-x-auto scrollbar-none"
      style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'rgba(0,0,0,0.3)' }}
    >
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-xs mr-1 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          {t('structure')}
        </span>

        {manualStructure
          ? collapsed.map((item, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-lg text-xs font-bold"
                style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-accent)' }}
              >
                {item.count > 1 ? `${item.label}×${item.count}` : item.label}
              </span>
            ))
          : collapsed.map((item, i) => {
              // Find first label matching this letter to get color
              const labelIdx = patternParts.indexOf(item.label)
              const label = labels[labelIdx] ?? ''
              const color = sectionColor(label)
              return (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>›</span>
                  )}
                  <span
                    className="px-2 py-0.5 rounded-lg text-xs font-semibold leading-tight"
                    style={{
                      backgroundColor: `${color}1a`,
                      color,
                      border: `1px solid ${color}40`,
                    }}
                    title={label}
                  >
                    {item.count > 1 ? `${item.label}×${item.count}` : item.label}
                  </span>
                </div>
              )
            })}

        {/* Legend */}
        {!manualStructure && labels.length > 0 && (() => {
          const seen = new Set<string>()
          const unique: { base: string; color: string; letter: string }[] = []
          let idx = 0
          for (const lbl of labels) {
            const base = lbl
              .replace(/\s*\d+\s*$/, '')
              .replace(/\s*\(.*?\)\s*$/, '')
              .replace(/[:\-–].*$/, '')
              .trim()
            if (!seen.has(base)) {
              seen.add(base)
              const letter = patternParts[labels.indexOf(lbl)] ?? 'ABCDEFGHIJ'[idx]
              unique.push({ base, color: sectionColor(base), letter })
              idx++
            }
          }
          return (
            <>
              <span style={{ color: 'var(--color-text-muted)', margin: '0 4px' }}>|</span>
              {unique.map(({ base, color, letter }) => (
                <span key={base} className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
                  <span style={{ color, fontWeight: 600 }}>{letter}</span>
                  ={base.charAt(0) + base.slice(1).toLowerCase()}
                  {unique.indexOf(unique.find((u) => u.base === base)!) < unique.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </>
          )
        })()}
      </div>
    </div>
  )
}
