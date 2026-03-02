import type { ParsedSong, SongLine, SongSegment } from '../types'

function isChordToken(token: string): boolean {
  if (token.startsWith('!')) return false
  return /^[A-G]/.test(token)
}

export function parseSong(content: string): ParsedSong {
  const rawLines = content.split('\n')
  const lines: SongLine[] = []

  for (const raw of rawLines) {
    const trimmed = raw.trim()

    // Empty line
    if (trimmed === '') {
      lines.push({ type: 'empty' })
      continue
    }

    // Pure block-level cue: line is ONLY [! CUE TEXT]
    const blockCueMatch = trimmed.match(/^\[!\s*([^\]]+)\]$/)
    if (blockCueMatch) {
      lines.push({ type: 'cue', cue: blockCueMatch[1].trim() })
      continue
    }

    // Parse tokens left to right
    const segments: SongSegment[] = []
    let remaining = trimmed
    let pos = 0
    let pendingText = ''
    let currentChord: string | undefined = undefined

    while (pos < remaining.length) {
      if (remaining[pos] === '[') {
        const closeIdx = remaining.indexOf(']', pos)
        if (closeIdx === -1) {
          pendingText += remaining[pos]
          pos++
          continue
        }
        const token = remaining.slice(pos + 1, closeIdx)

        if (token.startsWith('!')) {
          // Inline cue — flush pending
          if (pendingText !== '' || currentChord !== undefined) {
            segments.push({ chord: currentChord, text: pendingText })
            currentChord = undefined
            pendingText = ''
          }
          const cueText = token.slice(1).trim()
          segments.push({ chord: undefined, text: `[${cueText}]` })
          pos = closeIdx + 1
        } else if (isChordToken(token)) {
          if (pendingText !== '' || currentChord !== undefined) {
            segments.push({ chord: currentChord, text: pendingText })
            pendingText = ''
          }
          currentChord = token
          pos = closeIdx + 1
        } else {
          pendingText += remaining[pos]
          pos++
        }
      } else {
        pendingText += remaining[pos]
        pos++
      }
    }

    // Flush remaining
    if (pendingText !== '' || currentChord !== undefined) {
      segments.push({ chord: currentChord, text: pendingText })
    }

    if (segments.length > 0) {
      lines.push({ type: 'lyric', segments })
    } else {
      lines.push({ type: 'lyric', segments: [{ text: trimmed }] })
    }
  }

  return { lines }
}
