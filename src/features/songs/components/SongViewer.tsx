import { useSettingsStore } from '../../../store/settingsStore'
import type { ParsedSong } from '../types'
import { useRoleCapabilities } from '../lib/useRoleCapabilities'
import { sectionColor } from '../lib/sectionColors'
import { alpha } from '../../../shared/lib/color'

interface Props {
  parsed: ParsedSong
}

export function SongViewer({ parsed }: Props) {
  const fontSize = useSettingsStore((s) => s.fontSize)
  const capabilities = useRoleCapabilities()

  return (
    <div className="space-y-1 pb-10" style={{ fontSize: `${fontSize}px` }}>
      {parsed.lines.map((line, i) => {
        if (line.type === 'empty') {
          return <div key={i} className="h-4" />
        }

        if (line.type === 'cue') {
          if (!capabilities.showCues) return null
          const color = sectionColor(line.cue ?? '', 'var(--color-info)')
          return (
            <div
              key={i}
              className="flex items-center gap-2 font-bold uppercase py-1 pl-2 pr-3 rounded-lg w-fit"
              style={{
                color,
                backgroundColor: alpha(color, 14),
                borderLeft: `3px solid ${color}`,
                fontSize: Math.max(11, fontSize * 0.6),
                letterSpacing: '0.06em',
                marginTop: i > 0 ? '0.6em' : 0,
              }}
            >
              {line.cue}
            </div>
          )
        }

        // lyric line
        const segments = line.segments || []

        return (
          <div key={i} className="flex flex-wrap">
            {segments.map((seg, j) => (
              <div key={j} className="inline-flex flex-col" style={{ flexShrink: 0 }}>
                {capabilities.showChords && (
                  <span
                    className="font-semibold leading-tight"
                    style={{
                      fontFamily: 'JetBrains Mono, Fira Code, monospace',
                      color: 'var(--color-chord)',
                      fontSize: Math.max(11, fontSize * 0.65),
                      minWidth: seg.chord ? '0.5ch' : '0',
                      whiteSpace: 'pre',
                      paddingRight: seg.chord ? '0.3em' : '0',
                    }}
                  >
                    {seg.chord || ''}
                  </span>
                )}
                <span
                  className="leading-snug whitespace-pre-wrap"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {seg.text}
                </span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
