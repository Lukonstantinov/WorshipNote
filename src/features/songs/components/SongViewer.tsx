import { useSettingsStore } from '../../../store/settingsStore'
import type { ParsedSong } from '../types'

interface Props {
  parsed: ParsedSong
}

export function SongViewer({ parsed }: Props) {
  const { role, fontSize } = useSettingsStore()

  return (
    <div className="space-y-1 pb-24" style={{ fontSize: `${fontSize}px` }}>
      {parsed.lines.map((line, i) => {
        if (line.type === 'empty') {
          return <div key={i} className="h-4" />
        }

        if (line.type === 'cue') {
          if (role === 'congregation' || role === 'singer') return null
          return (
            <div
              key={i}
              className="flex items-center gap-2 text-xs italic py-1 px-2 rounded-lg w-fit"
              style={{
                color: '#0a84ff',
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
        const showChords = role !== 'congregation'

        return (
          <div key={i} className="flex flex-wrap">
            {segments.map((seg, j) => (
              <div key={j} className="inline-flex flex-col mr-0">
                {showChords && (
                  <span
                    className="font-semibold leading-tight"
                    style={{
                      fontFamily: 'JetBrains Mono, Fira Code, monospace',
                      color: '#32d74b',
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
                  style={{ color: '#ffffff' }}
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
