import type { Song } from '../../features/songs/types'
import type { Setlist } from '../../store/setlistStore'

/**
 * Strips ChordPro chord markers [X] from a line of content,
 * keeping section cues [! SECTION] as plain section headers.
 */
function processContentLine(line: string): string | null {
  const trimmed = line.trim()
  // Section cue: [! SECTION LABEL]
  const cueMatch = trimmed.match(/^\[!\s*(.*?)\]/)
  if (cueMatch) {
    return `\n── ${cueMatch[1].trim()} ──`
  }
  // Strip all inline chord tokens [X]
  const stripped = trimmed.replace(/\[[^\]]+\]/g, '')
  // Return null for lines that are blank after stripping
  return stripped.trim() || null
}

/**
 * Converts a song to congregation-style plain text (lyrics only, no chords).
 */
export function songToText(song: Song): string {
  const lines: string[] = []
  lines.push(song.title)
  if (song.original_key) lines.push(`Key: ${song.original_key}`)
  lines.push('')

  const contentLines = song.content.split('\n')
  for (const line of contentLines) {
    const processed = processContentLine(line)
    if (processed !== null) {
      lines.push(processed)
    } else {
      lines.push('')
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Converts an entire setlist to congregation-style plain text.
 */
export function setlistToText(setlist: Setlist, songs: Song[]): string {
  const parts: string[] = []
  parts.push(setlist.title)
  if (setlist.service_date) parts.push(setlist.service_date)
  parts.push('')
  parts.push('═'.repeat(40))

  const sortedSongs = [...setlist.songs].sort((a, b) => a.sort_order - b.sort_order)

  sortedSongs.forEach((ss, idx) => {
    const song = songs.find((s) => s.id === ss.song_id)
    if (!song) return
    parts.push('')
    parts.push(`${idx + 1}. ${songToText(song)}`)
    parts.push('')
    parts.push('─'.repeat(40))
  })

  return parts.join('\n')
}

/**
 * Triggers a browser download of a text file.
 */
export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Opens a printable HTML page in a new window with congregation-style lyrics.
 */
export function openPrintableHTML(title: string, content: string): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.7; color: #1a1a1a; background: #fff; padding: 40px; max-width: 750px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; border-bottom: 2px solid #333; padding-bottom: 8px; }
  .section-header { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #666; margin: 20px 0 4px; }
  p { margin-bottom: 4px; }
  .separator { border: none; border-top: 1px solid #ccc; margin: 24px 0; }
  .song-block { margin-bottom: 32px; }
  .song-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; }
  @media print {
    body { padding: 20px; font-size: 14px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<button class="no-print" onclick="window.print()" style="margin-bottom:20px;padding:8px 16px;background:#333;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;">Print / Save as PDF</button>
${formatTextAsHTML(content)}
</body>
</html>`
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatTextAsHTML(text: string): string {
  const lines = text.split('\n')
  const htmlLines: string[] = []
  let inSongBlock = false

  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('── ') && t.endsWith(' ──')) {
      // Section header
      const label = t.slice(3, -3).trim()
      htmlLines.push(`<div class="section-header">${escapeHtml(label)}</div>`)
    } else if (t === '─'.repeat(40) || t === '═'.repeat(40)) {
      htmlLines.push('<hr class="separator" />')
    } else if (t === '') {
      htmlLines.push('<br />')
    } else if (/^\d+\.\s/.test(t)) {
      // Song number + title (only first line)
      if (inSongBlock) htmlLines.push('</div>')
      htmlLines.push(`<div class="song-block"><div class="song-title">${escapeHtml(t)}</div>`)
      inSongBlock = true
    } else {
      htmlLines.push(`<p>${escapeHtml(t)}</p>`)
    }
  }

  if (inSongBlock) htmlLines.push('</div>')
  return htmlLines.join('\n')
}
