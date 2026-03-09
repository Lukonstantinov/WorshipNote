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
export function songToText(song: Song, vocalist?: string): string {
  const lines: string[] = []
  lines.push(song.title)
  if (vocalist) lines.push(`Vocalist: ${vocalist}`)
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
 * Includes vocalist names from setlist song entries.
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
    const vocalist = ss.vocalist ? `(${ss.vocalist}) ` : ''
    parts.push(`${idx + 1}. ${vocalist}${songToText(song)}`)
    parts.push('')
    parts.push('─'.repeat(40))
  })

  return parts.join('\n')
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Triggers a file download or share, compatible with Capacitor/Android WebView.
 * Strategy: share file → share text → Blob download → open in new window.
 */
export async function downloadTextFile(content: string, filename: string): Promise<void> {
  // 1. Try Web Share API with file (best for Android)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([content], filename, { type: 'text/plain' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        return
      }
    } catch {
      // User cancelled or API not supported — fall through
    }

    // 2. Try share with text only (works on most mobile)
    try {
      await navigator.share({ title: filename, text: content })
      return
    } catch {
      // fall through
    }
  }

  // 3. Try Blob download (works in desktop browsers, not in Android WebView)
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return
  } catch {
    // fall through
  }

  // 4. Last resort: open text in a new window so user can copy
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(`<pre style="white-space:pre-wrap;font-family:monospace;padding:20px;">${escapeHtml(content)}</pre>`)
    win.document.close()
  }
}

/**
 * Opens a printable HTML page in a new window with congregation-style lyrics.
 * Used for generic text content (old API — prefer openSetlistHTML for setlists).
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
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.7; color: #000; background: #fff; padding: 40px; max-width: 750px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; border-bottom: 2px solid #333; padding-bottom: 8px; }
  .section-header { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin: 16px 0 4px; font-style: italic; }
  p { margin-bottom: 4px; }
  .separator { border: none; border-top: 1px solid #ccc; margin: 24px 0; }
  .song-block { margin-bottom: 32px; }
  .song-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; }
  .toolbar { margin-bottom: 20px; display: flex; gap: 8px; }
  .toolbar button { padding: 8px 16px; background: #333; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
  .toolbar button:hover { background: #555; }
  @media print {
    .toolbar { display: none; }
    body { padding: 20px; font-size: 14px; }
  }
</style>
</head>
<body>
<div class="toolbar">
  <button onclick="history.back()">&#8592; Back</button>
  <button onclick="window.print()">Print / Save as PDF</button>
</div>
${formatTextAsHTML(content)}
</body>
</html>`
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

/**
 * Build a rich HTML page for a setlist, including vocalist names, structure, and back button.
 * Section headers are rendered in italic grey. All black & white for printing.
 */
export function openSetlistHTML(setlist: Setlist, songs: Song[]): void {
  const sortedSongs = [...setlist.songs].sort((a, b) => a.sort_order - b.sort_order)

  const songBlocks: string[] = []
  sortedSongs.forEach((ss, idx) => {
    const song = songs.find((s) => s.id === ss.song_id)
    if (!song) return

    const parts: string[] = []
    // Title line with vocalist
    const vocalistHtml = ss.vocalist
      ? `<span class="vocalist">(${escapeHtml(ss.vocalist)})</span> `
      : ''
    parts.push(`<div class="song-block">`)
    parts.push(`<div class="song-title">${idx + 1}. ${vocalistHtml}${escapeHtml(song.title)}</div>`)

    // Meta: key, bpm, vocalist from song
    const meta: string[] = []
    if (song.original_key) meta.push(`Key: ${escapeHtml(song.original_key)}`)
    if (song.bpm) meta.push(`BPM: ${song.bpm}`)
    if (song.vocalist && !ss.vocalist) meta.push(`Vocalist: ${escapeHtml(song.vocalist)}`)
    if (meta.length > 0) parts.push(`<div class="meta">${meta.join(' &middot; ')}</div>`)

    // Song content
    const contentLines = song.content.split('\n')
    for (const line of contentLines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('[!')) {
        const cue = trimmed.replace(/^\[!\s*/, '').replace(/\]$/, '').trim()
        parts.push(`<div class="section-header">${escapeHtml(cue)}</div>`)
        continue
      }
      if (trimmed === '') {
        parts.push('<br />')
        continue
      }
      // Strip chords for congregation view
      const stripped = trimmed.replace(/\[[^\]!][^\]]*\]/g, '').trim()
      if (stripped) parts.push(`<p>${escapeHtml(stripped)}</p>`)
    }

    parts.push('</div>')
    songBlocks.push(parts.join('\n'))
  })

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(setlist.title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.7; color: #000; background: #fff; padding: 40px; max-width: 750px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: bold; margin-bottom: 4px; border-bottom: 2px solid #333; padding-bottom: 8px; }
  .date { font-size: 14px; color: #666; margin-bottom: 4px; }
  .notes { font-size: 13px; color: #555; font-style: italic; margin-bottom: 16px; white-space: pre-wrap; }
  .section-header { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin: 16px 0 4px; font-style: italic; }
  .vocalist { font-weight: normal; color: #555; font-style: italic; }
  p { margin-bottom: 4px; }
  .separator { border: none; border-top: 1px solid #ccc; margin: 24px 0; }
  .song-block { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
  .song-block:last-child { border-bottom: none; }
  .song-title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
  .meta { font-size: 13px; color: #666; font-style: italic; margin-bottom: 8px; }
  .toolbar { margin-bottom: 20px; display: flex; gap: 8px; }
  .toolbar button { padding: 8px 16px; background: #333; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
  .toolbar button:hover { background: #555; }
  @media print {
    .toolbar { display: none; }
    body { padding: 20px; font-size: 14px; }
    .song-block { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="toolbar">
  <button onclick="history.back()">&#8592; Back</button>
  <button onclick="window.print()">Print / Save as PDF</button>
</div>
<h1>${escapeHtml(setlist.title)}</h1>
${setlist.service_date ? `<div class="date">${escapeHtml(setlist.service_date)}</div>` : ''}
${setlist.notes ? `<div class="notes">${escapeHtml(setlist.notes)}</div>` : ''}
<hr class="separator" />
${songBlocks.join('\n')}
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

function formatTextAsHTML(text: string): string {
  const lines = text.split('\n')
  const htmlLines: string[] = []
  let inSongBlock = false

  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('── ') && t.endsWith(' ──')) {
      const label = t.slice(3, -3).trim()
      htmlLines.push(`<div class="section-header">${escapeHtml(label)}</div>`)
    } else if (t === '─'.repeat(40) || t === '═'.repeat(40)) {
      htmlLines.push('<hr class="separator" />')
    } else if (t === '') {
      htmlLines.push('<br />')
    } else if (/^\d+\.\s/.test(t)) {
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
