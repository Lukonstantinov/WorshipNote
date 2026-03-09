import type { Song, Folder } from '../types'
import type { CustomChordDiagram, CustomPianoChordDiagram } from '../types'

// ── Export format types ──

export interface SongExportData {
  version: '1.0'
  exportedAt: string
  songs: Song[]
  folders: Folder[]
}

export interface ChordLibraryExportData {
  version: '1.0'
  exportedAt: string
  customChords: Record<string, CustomChordDiagram>
  customPianoChords: Record<string, CustomPianoChordDiagram>
}

// ── Export songs as JSON ──

export function exportSongsAsJSON(songs: Song[], folders: Folder[]): string {
  const data: SongExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    songs,
    folders,
  }
  return JSON.stringify(data, null, 2)
}

// ── Export songs as plain TXT ──

export function exportSongAsTXT(song: Song, includeChords: boolean): string {
  const lines: string[] = []
  lines.push(song.title)
  lines.push('='.repeat(song.title.length))
  if (song.original_key) lines.push(`Key: ${song.original_key}`)
  if (song.bpm) lines.push(`BPM: ${song.bpm}`)
  if (song.tags.length > 0) lines.push(`Tags: ${song.tags.join(', ')}`)
  lines.push('')

  const contentLines = song.content.split('\n')
  for (const line of contentLines) {
    if (line.startsWith('[!')) {
      // Cue line — e.g. [! VERSE]
      const cue = line.replace(/^\[!\s*/, '').replace(/\]$/, '').trim()
      lines.push(`--- ${cue} ---`)
      continue
    }

    if (includeChords) {
      lines.push(line)
    } else {
      // Strip chord brackets: [Am] -> ''
      const stripped = line.replace(/\[[^\]!][^\]]*\]/g, '').trim()
      if (stripped || line.trim() === '') lines.push(stripped)
    }
  }
  return lines.join('\n')
}

export function exportAllSongsAsTXT(songs: Song[], includeChords: boolean): string {
  return songs.map((s) => exportSongAsTXT(s, includeChords)).join('\n\n---\n\n')
}

// ── Import songs from JSON ──

export function parseSongImportJSON(json: string): { songs: Song[]; folders: Folder[] } {
  const data = JSON.parse(json) as SongExportData

  if (!data.songs || !Array.isArray(data.songs)) {
    throw new Error('Invalid import file: missing songs array')
  }

  // Validate each song has required fields
  for (const song of data.songs) {
    if (!song.id || !song.title || typeof song.content !== 'string') {
      throw new Error(`Invalid song: missing required fields (id, title, content)`)
    }
  }

  return {
    songs: data.songs,
    folders: Array.isArray(data.folders) ? data.folders : [],
  }
}

// ── Export chord library as JSON ──

export function exportChordLibrary(
  customChords: Record<string, CustomChordDiagram>,
  customPianoChords: Record<string, CustomPianoChordDiagram>,
): string {
  const data: ChordLibraryExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    customChords,
    customPianoChords,
  }
  return JSON.stringify(data, null, 2)
}

// ── Import chord library from JSON ──

export function parseChordLibraryJSON(json: string): {
  customChords: Record<string, CustomChordDiagram>
  customPianoChords: Record<string, CustomPianoChordDiagram>
} {
  const data = JSON.parse(json) as ChordLibraryExportData

  return {
    customChords: data.customChords && typeof data.customChords === 'object' ? data.customChords : {},
    customPianoChords: data.customPianoChords && typeof data.customPianoChords === 'object' ? data.customPianoChords : {},
  }
}

// ── File download helper ──

export async function downloadFile(content: string, filename: string, mimeType: string): Promise<void> {
  const isCapacitor = !!(window as unknown as Record<string, unknown>).Capacitor

  // 1. On mobile/Capacitor: prefer Web Share API (blob download doesn't work)
  if (isCapacitor && typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([content], filename, { type: mimeType })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        return
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return
    }

    try {
      await navigator.share({ title: filename, text: content })
      return
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return
    }
  }

  // 2. Desktop: blob download
  if (!isCapacitor) {
    try {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return
    } catch { /* fall through */ }
  }

  // 3. Capacitor fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(content)
    alert(`"${filename}" copied to clipboard`)
    return
  } catch { /* fall through */ }

  // 4. Last resort: open in new window with proper styling
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:monospace;padding:20px;background:#fff;color:#000;white-space:pre-wrap;}</style></head><body><button onclick="try{window.close()}catch(e){history.back()}" style="margin-bottom:16px;padding:8px 16px;background:#333;color:#fff;border:none;border-radius:6px;">Back</button><pre>${escape(content)}</pre></body></html>`)
    win.document.close()
  }
}

// ── File read helper ──

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
