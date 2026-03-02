import { useTranslation } from 'react-i18next'

interface Props {
  labels: string[]
  pattern: string
  /** Optional manual override string e.g. "A B A B C B" */
  manualStructure?: string
}

const TYPE_COLORS: [string, string][] = [
  ['КУПЛЕТ', '#0a84ff'],
  ['VERSE', '#0a84ff'],
  ['ПРИПЕВ', '#bf5af2'],
  ['CHORUS', '#bf5af2'],
  ['РЕФРЕН', '#bf5af2'],
  ['МОСТ', '#ff9f0a'],
  ['BRIDGE', '#ff9f0a'],
  ['ВСТУПЛЕНИЕ', '#30d158'],
  ['INTRO', '#30d158'],
  ['ИНТРО', '#30d158'],
  ['ФИНАЛ', '#ff453a'],
  ['OUTRO', '#ff453a'],
  ['КОДА', '#ff453a'],
  ['ПОВТОР', '#5e5ce6'],
  ['CHORUS', '#5e5ce6'],
]

function sectionColor(label: string): string {
  const up = label.toUpperCase()
  for (const [key, color] of TYPE_COLORS) {
    if (up.includes(key)) return color
  }
  return 'rgba(235,235,245,0.45)'
}

export function SongStructure({ labels, pattern, manualStructure }: Props) {
  const { t } = useTranslation()

  const displayPattern = manualStructure || pattern
  if (!displayPattern && labels.length === 0) return null

  const patternParts = displayPattern.split(/\s+/).filter(Boolean)

  return (
    <div
      className="px-3 py-2 border-b flex-shrink-0 overflow-x-auto scrollbar-none"
      style={{ borderColor: '#1c1c1e', backgroundColor: 'rgba(0,0,0,0.3)' }}
    >
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-xs mr-1 flex-shrink-0" style={{ color: 'rgba(235,235,245,0.3)' }}>
          {t('structure')}
        </span>

        {manualStructure
          ? patternParts.map((letter, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-lg text-xs font-bold"
                style={{ backgroundColor: '#2c2c2e', color: '#bf5af2' }}
              >
                {letter}
              </span>
            ))
          : labels.map((label, i) => {
              const color = sectionColor(label)
              const letter = patternParts[i] ?? '?'
              return (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <span style={{ color: 'rgba(235,235,245,0.15)', fontSize: 10 }}>›</span>
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
                    {letter}
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
              <span style={{ color: 'rgba(235,235,245,0.15)', margin: '0 4px' }}>|</span>
              {unique.map(({ base, color, letter }) => (
                <span key={base} className="text-xs flex-shrink-0" style={{ color: 'rgba(235,235,245,0.35)' }}>
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
