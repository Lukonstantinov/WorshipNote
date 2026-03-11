import { useState } from 'react'
import { renderToString } from 'react-dom/server'
import { useTranslation } from 'react-i18next'
import { X, Download, Printer } from 'lucide-react'
import type { Song, GuitarTab } from '../types'
import type { CustomChordDiagram, CustomPianoChordDiagram } from '../types'
import { downloadTextFile, downloadHTMLFile } from '../../../shared/lib/exportUtils'
import { extractStructure } from '../lib/parser'
import { generateAsciiTab } from '../lib/tabUtils'
import { useSettingsStore } from '../../../store/settingsStore'
import { useChordLibraryStore } from '../../../store/chordLibraryStore'
import { GuitarDiagram } from './GuitarDiagram'
import { PianoDiagram } from './PianoDiagram'
import { BassDiagram } from './BassDiagram'

interface ExportOptions {
  includeStructure: boolean
  includeVocalist: boolean
  includeChords: boolean
  includeDiagrams: boolean
  includeChordRows: boolean
  includeProgressions: boolean
  includeTabs: boolean
  colored: boolean
}

interface Props {
  song: Song
  onClose: () => void
}

// Structure chip colors
const STRUCTURE_COLORS: Record<string, string> = {
  A: '#3478f6', B: '#af52de', C: '#ff9500', D: '#ff3b30', E: '#34c759',
  F: '#5ac8fa', G: '#ff6482', H: '#ffd60a', I: '#5e5ce6', J: '#8e8e93',
}

function getStructureParts(song: Song): string[] {
  if (song.structure) {
    const hasSpaces = /\s/.test(song.structure)
    return hasSpaces
      ? song.structure.split(/\s+/).filter(Boolean)
      : song.structure.split('').filter((c) => /[A-Za-z]/.test(c))
  }
  const { pattern } = extractStructure(song.content)
  return pattern ? pattern.split(' ') : []
}

function collapseRepeats(parts: string[]): { label: string; count: number }[] {
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

function extractSongChords(content: string): string[] {
  const chordRegex = /\[([A-G][^\]]*)\]/g
  const seen = new Set<string>()
  let m
  while ((m = chordRegex.exec(content)) !== null) {
    seen.add(m[1])
  }
  return Array.from(seen)
}

function renderChordSVG(
  chord: string,
  instrumentType: string,
  customChords: Record<string, CustomChordDiagram>,
  customPianoChords: Record<string, CustomPianoChordDiagram>,
  colored: boolean,
  size = 80,
  overrideDotColor?: string,
): string {
  const dotColor = overrideDotColor ?? (colored ? '#bf5af2' : '#444444')
  const highlightColor = overrideDotColor ?? (colored ? '#32d74b' : '#555555')

  if (instrumentType === 'piano' || instrumentType === 'keyboard') {
    return renderToString(
      <PianoDiagram chord={chord} size={size} highlightColor={highlightColor} customDiagram={customPianoChords[chord]} />
    )
  } else if (instrumentType === 'bass') {
    return renderToString(
      <BassDiagram chord={chord} size={size} dotColor={dotColor} customDiagram={customChords[chord]} />
    )
  } else {
    return renderToString(
      <GuitarDiagram chord={chord} size={size} dotColor={dotColor} customDiagram={customChords[chord]} />
    )
  }
}

function buildDiagramsGrid(
  chords: string[],
  instrumentType: string,
  customChords: Record<string, CustomChordDiagram>,
  customPianoChords: Record<string, CustomPianoChordDiagram>,
  colored: boolean,
  overrideDotColor?: string,
): string {
  if (chords.length === 0) return ''
  const items = chords.map((chord) => {
    const svg = renderChordSVG(chord, instrumentType, customChords, customPianoChords, colored, 80, overrideDotColor)
    return `<div class="diagram-item">${svg}</div>`
  }).join('')
  return `<div class="diagrams-grid">${items}</div>`
}

interface DiagramOpts {
  instrumentType: string
  instrumentLabel: string
  customChords: Record<string, CustomChordDiagram>
  customPianoChords: Record<string, CustomPianoChordDiagram>
}

function buildSongText(song: Song, opts: ExportOptions): string {
  const lines: string[] = []

  lines.push('CZK Church')
  lines.push('')

  // Title
  lines.push(song.title)
  lines.push('='.repeat(song.title.length))

  // Meta
  if (song.original_key) lines.push(`Key: ${song.original_key}`)
  if (song.bpm) lines.push(`BPM: ${song.bpm}`)
  if (opts.includeVocalist && song.vocalist) lines.push(`Vocalist: ${song.vocalist}`)

  // Structure
  if (opts.includeStructure) {
    const parts = getStructureParts(song)
    if (parts.length > 0) {
      const collapsed = collapseRepeats(parts)
      lines.push(`Structure: ${collapsed.map((r) => (r.count > 1 ? `${r.label}×${r.count}` : r.label)).join(' ')}`)
    }
  }

  // Chord rows — before lyrics
  if (opts.includeChordRows && song.chordRows && song.chordRows.length > 0) {
    lines.push('')
    lines.push('─'.repeat(40))
    lines.push('CHORD ROWS')
    for (const row of song.chordRows) {
      if (row.visible === false) continue
      const label = row.label || 'Row'
      lines.push(`  ${label}: ${row.chords.join(' ')}`)
      if (row.comment) lines.push(`    ${row.comment}`)
    }
  }

  lines.push('')

  // Song content
  const contentLines = song.content.split('\n')
  for (const line of contentLines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('[!')) {
      const cue = trimmed.replace(/^\[!\s*/, '').replace(/\]$/, '').trim()
      if (opts.includeStructure) {
        lines.push('')
        lines.push(`── ${cue} ──`)
      } else {
        lines.push('')
      }
      continue
    }

    if (opts.includeChords) {
      lines.push(line)
    } else {
      const stripped = trimmed.replace(/\[[^\]!][^\]]*\]/g, '').trim()
      if (stripped || trimmed === '') lines.push(stripped)
    }
  }

  // Bar progressions
  if (opts.includeProgressions && song.barProgressions && song.barProgressions.length > 0) {
    lines.push('')
    lines.push('─'.repeat(40))
    lines.push('BAR PROGRESSIONS')
    for (const prog of song.barProgressions) {
      lines.push(`  ${prog.name}:`)
      for (const bar of prog.bars) {
        const chords = bar.map((b) => b.chord || '-').join(' ')
        lines.push(`    | ${chords} |`)
      }
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function buildSongHTML(song: Song, opts: ExportOptions, diagramOpts?: DiagramOpts, allTabs: GuitarTab[] = []): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const parts: string[] = []

  // CZK Church header
  parts.push(`<div class="church-label">CZK Church</div>`)

  // Title
  parts.push(`<h1>${escape(song.title)}</h1>`)

  // Meta
  const meta: string[] = []
  if (song.original_key) meta.push(`Key: ${escape(song.original_key)}`)
  if (song.bpm) meta.push(`BPM: ${song.bpm}`)
  if (opts.includeVocalist && song.vocalist) meta.push(`Vocalist: ${escape(song.vocalist)}`)
  if (meta.length > 0) parts.push(`<p class="meta">${meta.join(' &middot; ')}</p>`)

  // Structure
  if (opts.includeStructure) {
    const structParts = getStructureParts(song)
    if (structParts.length > 0) {
      const collapsed = collapseRepeats(structParts)
      if (opts.colored) {
        const chips = collapsed.map((r) => {
          const bg = STRUCTURE_COLORS[r.label] ?? '#8e8e93'
          const text = r.count > 1 ? `${r.label}×${r.count}` : r.label
          return `<span style="display:inline-block;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:700;color:#fff;background:${bg};margin-right:4px;">${text}</span>`
        })
        parts.push(`<div class="structure">${chips.join('')}</div>`)
      } else {
        const text = collapsed.map((r) => r.count > 1 ? `${r.label}×${r.count}` : r.label).join(' ')
        parts.push(`<p class="structure">Structure: ${escape(text)}</p>`)
      }
    }
  }

  // Chord diagrams — all unique song chords, above lyrics
  if (opts.includeDiagrams && opts.includeChords && diagramOpts) {
    const songChords = extractSongChords(song.content)
    if (songChords.length > 0) {
      const grid = buildDiagramsGrid(songChords, diagramOpts.instrumentType, diagramOpts.customChords, diagramOpts.customPianoChords, opts.colored)
      parts.push(`<div class="diagrams-section"><h2 class="diagrams-title">Chords (${escape(diagramOpts.instrumentLabel)})</h2>${grid}</div>`)
      parts.push('<hr class="separator" />')
    }
  }

  // Chord rows — before lyrics, after chord diagrams (exclude tab rows)
  if (opts.includeChordRows && song.chordRows && song.chordRows.length > 0) {
    const chordOnlyRows = song.chordRows.filter((r) => r.visible !== false && !r.tabId)
    if (chordOnlyRows.length > 0) {
      parts.push('<h2>Chord Rows</h2>')
      for (const row of chordOnlyRows) {
        const label = row.label || 'Row'
        if (opts.includeDiagrams && diagramOpts && row.chords.length > 0) {
          const grid = buildDiagramsGrid(row.chords, diagramOpts.instrumentType, diagramOpts.customChords, diagramOpts.customPianoChords, opts.colored, row.dotColor)
          parts.push(`<div class="chord-row-block"><strong class="chord-row-label">${escape(label)}</strong>${grid}</div>`)
          if (row.comment) parts.push(`<p class="comment">${escape(row.comment)}</p>`)
        } else {
          parts.push(`<p><strong>${escape(label)}:</strong> ${row.chords.map(escape).join(', ')}</p>`)
          if (row.comment) parts.push(`<p class="comment">${escape(row.comment)}</p>`)
        }
      }
      parts.push('<hr class="separator" />')
    }
  }

  // Guitar tabs (tab chord rows + song.tabIds)
  if (opts.includeTabs) {
    const tabRowIds = (song.chordRows ?? []).filter((r) => r.tabId && r.visible !== false).map((r) => ({ tabId: r.tabId!, label: r.label }))
    const directTabIds = (song.tabIds ?? []).map((id) => ({ tabId: id, label: undefined }))
    const allTabRefs = [...tabRowIds, ...directTabIds.filter((d) => !tabRowIds.find((t) => t.tabId === d.tabId))]
    if (allTabRefs.length > 0) {
      parts.push('<h2>Tabs</h2>')
      for (const ref of allTabRefs) {
        const tab = allTabs.find((t) => t.id === ref.tabId)
        if (!tab) continue
        const label = ref.label || tab.name
        parts.push('<div class="tab-block">')
        parts.push(`<div class="tab-name">${escape(label)} (${escape(tab.instrument)})</div>`)
        parts.push(`<pre class="tab-ascii">${escape(generateAsciiTab(tab))}</pre>`)
        if (tab.description) parts.push(`<div class="comment">${escape(tab.description)}</div>`)
        parts.push('</div>')
      }
      parts.push('<hr class="separator" />')
    }
  }

  // Song content
  const contentLines = song.content.split('\n')
  for (const line of contentLines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('[!')) {
      const cue = trimmed.replace(/^\[!\s*/, '').replace(/\]$/, '').trim()
      if (opts.includeStructure) {
        parts.push(`<div class="section-header">${escape(cue)}</div>`)
      }
      continue
    }

    if (trimmed === '') {
      parts.push('<br />')
      continue
    }

    if (opts.includeChords) {
      const chordRegex = /\[([^\]!][^\]]*)\]/g
      let hasChords = false
      let chordLine = ''
      let textLine = ''
      let lastIndex = 0

      let match: RegExpExecArray | null
      while ((match = chordRegex.exec(trimmed)) !== null) {
        hasChords = true
        const before = trimmed.slice(lastIndex, match.index)
        textLine += escape(before)
        const spaces = '&nbsp;'.repeat(Math.max(0, before.length))
        chordLine += spaces + `<span class="chord">${escape(match[1])}</span>`
        lastIndex = match.index + match[0].length
      }
      textLine += escape(trimmed.slice(lastIndex))

      if (hasChords) {
        parts.push(`<div class="chord-line">${chordLine}</div>`)
      }
      parts.push(`<p>${textLine || '&nbsp;'}</p>`)
    } else {
      const stripped = trimmed.replace(/\[[^\]!][^\]]*\]/g, '').trim()
      if (stripped) parts.push(`<p>${escape(stripped)}</p>`)
    }
  }

  // Bar progressions
  if (opts.includeProgressions && song.barProgressions && song.barProgressions.length > 0) {
    parts.push('<hr class="separator" />')
    parts.push('<h2>Bar Progressions</h2>')
    for (const prog of song.barProgressions) {
      parts.push(`<p><strong>${escape(prog.name)}</strong></p>`)
      for (const bar of prog.bars) {
        const chords = bar.map((b) => b.chord || '-').join(' ')
        parts.push(`<p class="bar">| ${escape(chords)} |</p>`)
      }
    }
  }

  const chordColor = opts.colored ? '#30a14e' : '#666'
  const diagramDotColor = opts.colored ? '#bf5af2' : '#444444'
  const diagramHighlightColor = opts.colored ? '#32d74b' : '#555555'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(song.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap" rel="stylesheet">
<style>
  :root {
    --color-diagram-text: #111111;
    --color-diagram-stroke: #cccccc;
    --color-diagram-fret: #555555;
    --color-text-secondary: #666666;
    --color-text-tertiary: #888888;
    --color-text-muted: #aaaaaa;
    --color-piano-white: #f8f8f8;
    --color-piano-black: #222222;
    --color-piano-stroke: #999999;
    --color-info: ${diagramHighlightColor};
    --color-accent: ${diagramDotColor};
    --color-chord: ${diagramHighlightColor};
    --color-card: #f5f5f5;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.7; color: #000; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
  .church-label { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: #333; margin-bottom: 4px; }
  h1 { font-size: 24px; font-weight: bold; margin-bottom: 4px; border-bottom: 2px solid #333; padding-bottom: 8px; }
  h2 { font-size: 16px; font-weight: bold; margin: 16px 0 8px; }
  .meta { font-size: 13px; color: #555; margin-bottom: 8px; }
  .structure { font-size: 13px; color: #333; font-weight: bold; margin-bottom: 12px; letter-spacing: 0.05em; }
  .section-header { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin: 20px 0 4px; font-style: italic; }
  .chord-line { font-family: monospace; font-size: 13px; font-weight: bold; color: ${chordColor}; margin-top: 8px; white-space: pre; font-style: italic; }
  .chord { font-weight: bold; color: ${chordColor}; font-style: italic; }
  p { margin-bottom: 2px; }
  .bar { font-family: monospace; font-size: 14px; margin-left: 16px; }
  .comment { font-size: 13px; color: #555; font-style: italic; margin-left: 16px; }
  .separator { border: none; border-top: 1px solid #999; margin: 24px 0; }
  .diagrams-section { margin: 16px 0 8px; }
  .diagrams-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin-bottom: 8px; font-family: system-ui, sans-serif; border: none; }
  .diagrams-grid { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
  .diagram-item { display: inline-block; }
  .chord-row-block { margin: 8px 0 4px; }
  .chord-row-label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; font-family: system-ui, sans-serif; }
  .tab-block { margin: 8px 0 12px; }
  .tab-name { font-size: 11px; font-weight: 700; color: #888; margin-bottom: 4px; font-family: system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.08em; }
  .tab-ascii { font-family: 'Courier New', Courier, monospace; font-size: 12px; white-space: pre; background: #f8f8f8; padding: 8px; border-radius: 4px; border: 1px solid #eee; overflow-x: auto; }
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
${parts.join('\n')}
</body>
</html>`
}

export function SongExportModal({ song, onClose }: Props) {
  const { t } = useTranslation()
  const { instruments, selectedInstrument, customChords, customPianoChords } = useSettingsStore()
  const { tabs: allTabs } = useChordLibraryStore()

  const inst = instruments.find((i) => i.id === selectedInstrument)
  const instrumentType = inst?.type ?? 'guitar'
  const instrumentLabel = inst?.name ?? 'Guitar'

  const hasTabs = (song.tabIds?.length ?? 0) > 0 || (song.chordRows?.some((r) => !!r.tabId && r.visible !== false) ?? false)
  const hasChordOnlyRows = (song.chordRows?.filter((r) => r.visible !== false && !r.tabId).length ?? 0) > 0

  const [opts, setOpts] = useState<ExportOptions>({
    includeStructure: true,
    includeVocalist: !!song.vocalist,
    includeChords: false,
    includeDiagrams: false,
    includeChordRows: hasChordOnlyRows,
    includeProgressions: (song.barProgressions?.length ?? 0) > 0,
    includeTabs: hasTabs,
    colored: true,
  })

  const toggle = (key: keyof ExportOptions) =>
    setOpts((o) => ({ ...o, [key]: !o[key] }))

  const handleTXT = async () => {
    const text = buildSongText(song, opts)
    await downloadTextFile(text, `${song.title}.txt`)
    onClose()
  }

  const handleHTML = async () => {
    const html = buildSongHTML(song, opts, { instrumentType, instrumentLabel, customChords, customPianoChords }, allTabs)
    await downloadHTMLFile(html, `${song.title}.html`)
    onClose()
  }

  const checkboxStyle: React.CSSProperties = {
    width: 18, height: 18, accentColor: 'var(--color-accent)',
  }

  const options: { key: keyof ExportOptions; label: string; show: boolean; indent?: boolean }[] = [
    { key: 'includeStructure', label: t('exportIncludeStructure'), show: true },
    { key: 'includeVocalist', label: t('exportIncludeVocalist'), show: !!song.vocalist },
    { key: 'includeChords', label: t('exportIncludeChords'), show: true },
    { key: 'includeDiagrams', label: t('exportIncludeDiagrams') || `Diagrams (${instrumentLabel})`, show: opts.includeChords, indent: true },
    { key: 'includeChordRows', label: t('exportIncludeChordRows'), show: hasChordOnlyRows },
    { key: 'includeProgressions', label: t('exportIncludeProgressions'), show: (song.barProgressions?.length ?? 0) > 0 },
    { key: 'includeTabs', label: t('exportIncludeTabs') || 'Guitar tabs', show: hasTabs },
    { key: 'colored', label: t('exportColored') || 'Colored', show: opts.includeChords || opts.includeStructure },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div
        className="rounded-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-semibold text-sm">{t('exportSong')}</h3>
          <button onClick={onClose} style={{ color: 'var(--color-text-tertiary)' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Options */}
        <div className="px-4 py-3 space-y-3">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            Base: lyrics + song info
          </p>
          {options.filter((o) => o.show).map((o) => (
            <label key={o.key} className={`flex items-center gap-3 cursor-pointer${o.indent ? ' ml-6' : ''}`}>
              <input
                type="checkbox"
                checked={opts[o.key]}
                onChange={() => toggle(o.key)}
                style={checkboxStyle}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{o.label}</span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={handleTXT}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
          >
            <Download size={14} strokeWidth={2} />
            TXT
          </button>
          <button
            onClick={handleHTML}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)' }}
          >
            <Printer size={14} strokeWidth={2} />
            HTML
          </button>
        </div>
      </div>
    </div>
  )
}
