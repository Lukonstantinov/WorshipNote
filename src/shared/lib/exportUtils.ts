import type { Song } from '../../features/songs/types'
import type { Setlist } from '../../store/setlistStore'
import { extractStructure } from '../../features/songs/lib/parser'

function collapseRepeats(parts: string[]): string {
  const result: { label: string; count: number }[] = []
  for (const p of parts) {
    if (result.length && result[result.length - 1].label === p) {
      result[result.length - 1].count++
    } else {
      result.push({ label: p, count: 1 })
    }
  }
  return result.map((r) => (r.count > 1 ? `${r.label}×${r.count}` : r.label)).join(' ')
}

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
  if (song.bpm) lines.push(`BPM: ${song.bpm}`)

  // Structure
  let structureParts: string[] = []
  if (song.structure) {
    const hasSpaces = /\s/.test(song.structure)
    structureParts = hasSpaces
      ? song.structure.split(/\s+/).filter(Boolean)
      : song.structure.split('').filter((c) => /[A-Za-z]/.test(c))
  } else {
    const { pattern } = extractStructure(song.content)
    if (pattern) structureParts = pattern.split(' ')
  }
  if (structureParts.length > 0) {
    lines.push(`Structure: ${collapseRepeats(structureParts)}`)
  }

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
  parts.push('CZK Church')
  parts.push('')
  parts.push(setlist.title)
  if (setlist.service_date) parts.push(setlist.service_date)
  if (setlist.notes) parts.push(setlist.notes)
  parts.push('')
  parts.push('═'.repeat(40))

  const sortedSongs = [...setlist.songs].sort((a, b) => a.sort_order - b.sort_order)

  sortedSongs.forEach((ss, idx) => {
    const song = songs.find((s) => s.id === ss.song_id)
    if (!song) return
    parts.push('')
    const vocalist = ss.vocalist ? `(${ss.vocalist}) ` : ''
    parts.push(`${idx + 1}. ${vocalist}${songToText(song, ss.vocalist)}`)
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
 * On Capacitor: writes file to device cache dir, then opens native share sheet.
 * On desktop: uses standard blob download.
 */
export async function downloadTextFile(content: string, filename: string): Promise<void> {
  const isCapacitor = !!(window as unknown as Record<string, unknown>).Capacitor

  // 1. On Capacitor: use native Filesystem + Share plugins
  if (isCapacitor) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem')
      const { Share } = await import('@capacitor/share')

      const result = await Filesystem.writeFile({
        path: filename,
        data: btoa(unescape(encodeURIComponent(content))),
        directory: Directory.Cache,
      })

      await Share.share({
        title: filename,
        url: result.uri,
      })
      return
    } catch (e: unknown) {
      // AbortError = user cancelled share sheet — that's OK
      if (e instanceof Error && e.message?.includes('cancel')) return
      console.error('Capacitor share failed:', e)
    }
  }

  // 2. Desktop: blob download
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
  } catch {
    // Last resort: open in new window
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(filename)}</title><style>body{font-family:monospace;padding:20px;background:#fff;color:#000;white-space:pre-wrap;word-wrap:break-word;}</style></head><body><button onclick="try{window.close()}catch(e){history.back()}" style="margin-bottom:16px;padding:8px 16px;background:#333;color:#fff;border:none;border-radius:6px;cursor:pointer;">Back</button><pre>${escapeHtml(content)}</pre></body></html>`)
      win.document.close()
    }
  }
}

/**
 * Downloads an HTML string as a file. On Capacitor uses native share.
 * On desktop uses blob download.
 */
export async function downloadHTMLFile(htmlContent: string, filename: string): Promise<void> {
  const isCapacitor = !!(window as unknown as Record<string, unknown>).Capacitor

  if (isCapacitor) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem')
      const { Share } = await import('@capacitor/share')

      const result = await Filesystem.writeFile({
        path: filename,
        data: btoa(unescape(encodeURIComponent(htmlContent))),
        directory: Directory.Cache,
      })

      await Share.share({
        title: filename,
        url: result.uri,
      })
      return
    } catch (e: unknown) {
      if (e instanceof Error && e.message?.includes('cancel')) return
      console.error('Capacitor share failed:', e)
    }
  }

  // Desktop fallback
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(htmlContent)
      win.document.close()
    }
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
  <button onclick="try{window.close()}catch(e){} history.back();">&#8592; Back</button>
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

// Structure chip colors for colored HTML export
const STRUCTURE_COLORS: Record<string, string> = {
  A: '#3478f6', B: '#af52de', C: '#ff9500', D: '#ff3b30', E: '#34c759',
  F: '#5ac8fa', G: '#ff6482', H: '#ffd60a', I: '#5e5ce6', J: '#8e8e93',
}

function getStructureParts(song: Song): string[] {
  if (song.structure) {
    const hasSpaces = /\s/.test(song.structure)
    return hasSpaces
      ? song.structure.split(/\s+/).filter(Boolean)
      : song.structure.split('').filter((c: string) => /[A-Za-z]/.test(c))
  }
  const { pattern } = extractStructure(song.content)
  return pattern ? pattern.split(' ') : []
}

function buildStructureChipsHTML(parts: string[], colored: boolean): string {
  if (parts.length === 0) return ''
  const collapsed = collapseRepeatsArray(parts)
  if (colored) {
    const chips = collapsed.map((r) => {
      const bg = STRUCTURE_COLORS[r.label] ?? '#8e8e93'
      const text = r.count > 1 ? `${r.label}×${r.count}` : r.label
      return `<span style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:700;color:#fff;background:${bg};margin-right:4px;">${text}</span>`
    })
    return `<div class="structure">${chips.join('')}</div>`
  }
  const text = collapsed.map((r) => r.count > 1 ? `${r.label}×${r.count}` : r.label).join(' ')
  return `<div class="structure">Structure: ${escapeHtml(text)}</div>`
}

/** collapseRepeats returning array (not joined string) */
function collapseRepeatsArray(parts: string[]): { label: string; count: number }[] {
  const result: { label: string; count: number }[] = []
  for (const p of parts) {
    if (result.length && result[result.length - 1].label === p) {
      result[result.length - 1].count++
    } else {
      result.push({ label: p, count: 1 })
    }
  }
  return result
}

/**
 * Build a rich HTML page for a setlist.
 * @param colored If true, chords and structure chips are colored.
 */
export async function openSetlistHTML(setlist: Setlist, songs: Song[], colored = false): Promise<void> {
  const sortedSongs = [...setlist.songs].sort((a, b) => a.sort_order - b.sort_order)

  const songBlocks: string[] = []
  sortedSongs.forEach((ss, idx) => {
    const song = songs.find((s) => s.id === ss.song_id)
    if (!song) return

    const parts: string[] = []
    const vocalistHtml = ss.vocalist
      ? `<span class="vocalist">(${escapeHtml(ss.vocalist)})</span> `
      : ''
    parts.push(`<div class="song-block">`)
    // CZK Church label per song
    parts.push(`<div class="church-label">CZK Church</div>`)
    parts.push(`<div class="song-title">${idx + 1}. ${vocalistHtml}${escapeHtml(song.title)}</div>`)

    // Meta
    const meta: string[] = []
    if (song.original_key) meta.push(`Key: ${escapeHtml(song.original_key)}`)
    if (song.bpm) meta.push(`BPM: ${song.bpm}`)
    if (song.vocalist && !ss.vocalist) meta.push(`Vocalist: ${escapeHtml(song.vocalist)}`)
    if (meta.length > 0) parts.push(`<div class="meta">${meta.join(' &middot; ')}</div>`)

    // Structure
    const structureParts = getStructureParts(song)
    parts.push(buildStructureChipsHTML(structureParts, colored))

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
      if (colored) {
        // Show chords inline in color
        const chordRegex = /\[([^\]!][^\]]*)\]/g
        let hasChords = false
        let chordLine = ''
        let textLine = ''
        let lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = chordRegex.exec(trimmed)) !== null) {
          hasChords = true
          const before = trimmed.slice(lastIndex, match.index)
          textLine += escapeHtml(before)
          const spaces = '&nbsp;'.repeat(Math.max(0, before.length))
          chordLine += spaces + `<span class="chord">${escapeHtml(match[1])}</span>`
          lastIndex = match.index + match[0].length
        }
        textLine += escapeHtml(trimmed.slice(lastIndex))
        if (hasChords) parts.push(`<div class="chord-line">${chordLine}</div>`)
        parts.push(`<p>${textLine || '&nbsp;'}</p>`)
      } else {
        const stripped = trimmed.replace(/\[[^\]!][^\]]*\]/g, '').trim()
        if (stripped) parts.push(`<p>${escapeHtml(stripped)}</p>`)
      }
    }

    parts.push('</div>')
    songBlocks.push(parts.join('\n'))
  })

  const chordColorCSS = colored
    ? `.chord-line { font-family: monospace; font-size: 13px; font-weight: bold; color: #30a14e; margin-top: 8px; white-space: pre; }
  .chord { font-weight: bold; color: #30a14e; }`
    : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(setlist.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.7; color: #000; background: #fff; padding: 40px; max-width: 750px; margin: 0 auto; }
  .church-label { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: #333; margin-bottom: 4px; }
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
  .meta { font-size: 13px; color: #666; font-style: italic; margin-bottom: 4px; }
  .structure { font-size: 13px; color: #333; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.05em; }
  ${chordColorCSS}
  .toolbar { margin-bottom: 20px; display: flex; gap: 8px; flex-wrap: wrap; }
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
  <button onclick="try{window.close()}catch(e){} history.back();">&#8592; Back</button>
  <button onclick="window.print()">Print / Save as PDF</button>
</div>
<h1>${escapeHtml(setlist.title)}</h1>
${setlist.service_date ? `<div class="date">${escapeHtml(setlist.service_date)}</div>` : ''}
${setlist.notes ? `<div class="notes">${escapeHtml(setlist.notes)}</div>` : ''}
<hr class="separator" />
${songBlocks.join('\n')}
</body>
</html>`

  const isCapacitor = !!(window as unknown as Record<string, unknown>).Capacitor
  if (isCapacitor) {
    await downloadHTMLFile(html, `${setlist.title}.html`)
  } else {
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
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
