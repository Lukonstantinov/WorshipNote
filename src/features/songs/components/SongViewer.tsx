import { useMemo } from 'react'
import { useSettingsStore } from '../../../store/settingsStore'
import type { ParsedSong } from '../types'

interface Props {
  parsed: ParsedSong
}

const BUILT_IN_DEFAULTS: Record<string, { showChords: boolean; showCues: boolean }> = {
  musician: { showChords: true, showCues: true },
  singer: { showChords: true, showCues: false },
  congregation: { showChords: false, showCues: false },
}

export function SongViewer({ parsed }: Props) {
  const { role, fontSize, customRoles } = useSettingsStore()

  const capabilities = useMemo(() => {
    const customRole = customRoles.find((cr) => cr.id === role)
    if (customRole) {
      return { showChords: customRole.showChords, showCues: customRole.showCues }
    }
    return BUILT_IN_DEFAULTS[role as string] ?? BUILT_IN_DEFAULTS.musician
  }, [role, customRoles])

  return (
    <div className="space-y-1 pb-24" style={{ fontSize: `${fontSize}px` }}>
      {parsed.lines.map((line, i) => {
        if (line.type === 'empty') {
          return <div key={i} className="h-4" />
        }

        if (line.type === 'cue') {
          if (!capabilities.showCues) return null
          return (
            <div
              key={i}
              className="flex items-center gap-2 text-xs italic py-1 px-2 rounded-lg w-fit"
              style={{
                color: 'var(--color-info)',
                backgroundColor: 'rgba(10,132,255,0.1)',
                fontSize: Math.max(11, fontSize * 0.6),
              }}
            >
              <span style={{ opacity: 0.7, fontSize: 8, letterSpacing: 1, fontStyle: 'normal', fontWeight: 600 }}>
                CUE
              </span>
              {line.cue}
            </div>
          )
        }

        // lyric line
        const segments = line.segments || []

        return (
          <div key={i} className="flex flex-wrap">
            {segments.map((seg, j) => (
              <div key={j} className="inline-flex flex-col mr-0">
                {capabilities.showChords && (
                  <span
                    className="font-semibold leading-tight"
                    style={{
                      fontFamily: 'JetBrains Mono, Fira Code, monospace',
                      color: 'var(--color-chord)',
                      fontSize: Math.max(11, fontSize * 0.65),
                      minWidth: seg.chord ? '0.5ch' : '0',
                      whiteSpace: 'pre',
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
