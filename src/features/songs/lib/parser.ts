import type { ParsedSong, SongLine, SongSegment } from '../types'

const STRUCTURE_LETTERS = 'ABCDEFGHIJ'

/** Normalise a cue label to a base section type (strip trailing numbers, parentheticals) */
function baseSectionType(cue: string): string {
  return cue
    .replace(/\s*\d+\s*$/, '')         // strip trailing number  e.g. "КУПЛЕТ 2" → "КУПЛЕТ"
    .replace(/\s*\(.*?\)\s*$/, '')      // strip parenthetical
    .replace(/[:\-–].*$/, '')           // strip "INTRO: GUITAR" → "INTRO"
    .trim()
    .toUpperCase()
}

export function extractStructure(content: string): { labels: string[]; pattern: string } {
  const labels: string[] = []
  for (const raw of content.split('\n')) {
    const match = raw.trim().match(/^\[!\s*([^\]]+)\]$/)
    if (match) labels.push(match[1].trim())
  }
  if (labels.length === 0) return { labels: [], pattern: '' }

  const letterMap: Record<string, string> = {}
  let nextIdx = 0
  const pattern = labels
    .map((lbl) => {
      const base = baseSectionType(lbl)
      if (!(base in letterMap)) {
        letterMap[base] = STRUCTURE_LETTERS[nextIdx++] ?? '?'
      }
      return letterMap[base]
    })
    .join(' ')

  return { labels, pattern }
}

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
    const remaining = trimmed
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
