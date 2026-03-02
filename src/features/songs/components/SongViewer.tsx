import { useSettingsStore } from '../../../store/settingsStore'
import type { ParsedSong } from '../types'

interface Props {
  parsed: ParsedSong
  transposeSteps?: number
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
          if (role === 'congregation') return null
          if (role === 'singer') return null
          return (
            <div
              key={i}
              className="text-sm italic pl-2 py-1"
              style={{ color: '#60a5fa' }}
            >
              🎵 {line.cue}
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
                    className="font-bold text-sm leading-tight"
                    style={{
                      fontFamily: 'JetBrains Mono, Fira Code, monospace',
                      color: '#4ade80',
                      minWidth: seg.chord ? '0.5ch' : '0',
                      whiteSpace: 'pre',
                    }}
                  >
                    {seg.chord || ''}
                  </span>
                )}
                <span
                  className="leading-snug whitespace-pre-wrap"
                  style={{ color: '#f5f5f5' }}
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
