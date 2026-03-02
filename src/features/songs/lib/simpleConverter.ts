/**
 * Converter between SimpleSection format and ChordPro Extended format.
 */

export interface ChordedWord {
  text: string
  chord?: string
  /** Whether there's a space after this word */
  space?: boolean
}

export interface SimpleSection {
  label: string
  words: ChordedWord[]
}

/** Convert SimpleSection[] → ChordPro Extended string */
export function simpleToChordPro(sections: SimpleSection[]): string {
  return sections
    .map((sec) => {
      const header = `[! ${sec.label}]`
      // Build a single line with inline chords
      let line = ''
      for (const word of sec.words) {
        if (word.chord) line += `[${word.chord}]`
        line += word.text
        if (word.space !== false) line += ' '
      }
      return `${header}\n${line.trim()}`
    })
    .join('\n\n')
}

/** Convert ChordPro Extended string → SimpleSection[] */
export function chordProToSimple(content: string): SimpleSection[] {
  const sections: SimpleSection[] = []
  let currentSection: SimpleSection | null = null

  for (const rawLine of content.split('\n')) {
    const trimmed = rawLine.trim()
    if (!trimmed) {
      // empty line between sections
      continue
    }

    // Block cue → new section
    const blockCueMatch = trimmed.match(/^\[!\s*([^\]]+)\]$/)
    if (blockCueMatch) {
      currentSection = { label: blockCueMatch[1].trim(), words: [] }
      sections.push(currentSection)
      continue
    }

    // If no section started yet, create a default one
    if (!currentSection) {
      currentSection = { label: 'VERSE', words: [] }
      sections.push(currentSection)
    }

    // Parse the line into chord+text tokens
    let pos = 0
    let pendingChord: string | undefined
    let buf = ''

    const flush = (endOfLine = false) => {
      if (buf || pendingChord) {
        // Split buf into words
        const parts = buf.split(/(\s+)/)
        let first = true
        for (const part of parts) {
          if (!part) continue
          const isSpace = /^\s+$/.test(part)
          if (isSpace) continue
          currentSection!.words.push({
            text: part,
            chord: first ? pendingChord : undefined,
            space: true,
          })
          pendingChord = undefined
          first = false
        }
        if (endOfLine && currentSection!.words.length > 0) {
          currentSection!.words[currentSection!.words.length - 1].space = false
        }
        buf = ''
        pendingChord = undefined
      }
    }

    while (pos < trimmed.length) {
      if (trimmed[pos] === '[') {
        const close = trimmed.indexOf(']', pos)
        if (close === -1) { buf += trimmed[pos++]; continue }
        const token = trimmed.slice(pos + 1, close)
        if (token.startsWith('!')) {
          // inline cue — treat as text
          buf += `[${token.slice(1).trim()}]`
        } else if (/^[A-G]/.test(token)) {
          flush()
          pendingChord = token
        } else {
          buf += trimmed[pos]
        }
        pos = close + 1
      } else {
        buf += trimmed[pos++]
      }
    }
    flush(true)
  }

  return sections.length > 0 ? sections : [{ label: 'VERSE', words: [] }]
}
