import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Download, Printer } from 'lucide-react'
import type { Song } from '../types'
import { downloadTextFile } from '../../../shared/lib/exportUtils'

interface ExportOptions {
  includeStructure: boolean
  includeVocalist: boolean
  includeChords: boolean
  includeChordRows: boolean
  includeProgressions: boolean
}

interface Props {
  song: Song
  onClose: () => void
}

function buildSongText(song: Song, opts: ExportOptions): string {
  const lines: string[] = []

  // Title
  lines.push(song.title)
  lines.push('='.repeat(song.title.length))

  // Meta
  if (song.original_key) lines.push(`Key: ${song.original_key}`)
  if (song.bpm) lines.push(`BPM: ${song.bpm}`)
  if (opts.includeVocalist && song.vocalist) lines.push(`Vocalist: ${song.vocalist}`)
  lines.push('')

  // Structure summary at top
  if (opts.includeStructure && song.structure) {
    lines.push(`Structure: ${song.structure}`)
    lines.push('')
  }

  // Song content
  const contentLines = song.content.split('\n')
  for (const line of contentLines) {
    const trimmed = line.trim()

    // Cue / section line
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
      // Strip chord brackets
      const stripped = trimmed.replace(/\[[^\]!][^\]]*\]/g, '').trim()
      if (stripped || trimmed === '') lines.push(stripped)
    }
  }

  // Chord rows
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

function buildSongHTML(song: Song, opts: ExportOptions): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const parts: string[] = []

  // Title
  parts.push(`<h1>${escape(song.title)}</h1>`)

  // Meta
  const meta: string[] = []
  if (song.original_key) meta.push(`Key: ${escape(song.original_key)}`)
  if (song.bpm) meta.push(`BPM: ${song.bpm}`)
  if (opts.includeVocalist && song.vocalist) meta.push(`Vocalist: ${escape(song.vocalist)}`)
  if (meta.length > 0) parts.push(`<p class="meta">${meta.join(' &middot; ')}</p>`)

  // Structure summary
  if (opts.includeStructure && song.structure) {
    parts.push(`<p class="structure">Structure: ${escape(song.structure)}</p>`)
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
      // Render chords above text
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
        // Pad chord position
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

  // Chord rows
  if (opts.includeChordRows && song.chordRows && song.chordRows.length > 0) {
    parts.push('<hr class="separator" />')
    parts.push('<h2>Chord Rows</h2>')
    for (const row of song.chordRows) {
      if (row.visible === false) continue
      const label = row.label || 'Row'
      parts.push(`<p><strong>${escape(label)}:</strong> ${row.chords.map(escape).join(', ')}</p>`)
      if (row.comment) parts.push(`<p class="comment">${escape(row.comment)}</p>`)
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(song.title)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.7; color: #000; background: #fff; padding: 40px; max-width: 750px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: bold; margin-bottom: 4px; border-bottom: 2px solid #333; padding-bottom: 8px; }
  h2 { font-size: 16px; font-weight: bold; margin: 16px 0 8px; }
  .meta { font-size: 13px; color: #555; margin-bottom: 8px; }
  .structure { font-size: 13px; color: #333; font-weight: bold; margin-bottom: 12px; letter-spacing: 0.05em; }
  .section-header { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin: 20px 0 4px; font-style: italic; }
  .chord-line { font-family: monospace; font-size: 13px; font-weight: bold; color: #666; margin-top: 8px; white-space: pre; font-style: italic; }
  .chord { font-weight: bold; color: #666; font-style: italic; }
  p { margin-bottom: 2px; }
  .bar { font-family: monospace; font-size: 14px; margin-left: 16px; }
  .comment { font-size: 13px; color: #555; font-style: italic; margin-left: 16px; }
  .separator { border: none; border-top: 1px solid #999; margin: 24px 0; }
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
  const [opts, setOpts] = useState<ExportOptions>({
    includeStructure: true,
    includeVocalist: !!song.vocalist,
    includeChords: false,
    includeChordRows: false,
    includeProgressions: false,
  })

  const toggle = (key: keyof ExportOptions) =>
    setOpts((o) => ({ ...o, [key]: !o[key] }))

  const handleTXT = async () => {
    const text = buildSongText(song, opts)
    await downloadTextFile(text, `${song.title}.txt`)
    onClose()
  }

  const handleHTML = () => {
    const html = buildSongHTML(song, opts)
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
    onClose()
  }

  const checkboxStyle: React.CSSProperties = {
    width: 18, height: 18, accentColor: 'var(--color-accent)',
  }

  const options: { key: keyof ExportOptions; label: string; show: boolean }[] = [
    { key: 'includeStructure', label: t('exportIncludeStructure'), show: true },
    { key: 'includeVocalist', label: t('exportIncludeVocalist'), show: !!song.vocalist },
    { key: 'includeChords', label: t('exportIncludeChords'), show: true },
    { key: 'includeChordRows', label: t('exportIncludeChordRows'), show: (song.chordRows?.length ?? 0) > 0 },
    { key: 'includeProgressions', label: t('exportIncludeProgressions'), show: (song.barProgressions?.length ?? 0) > 0 },
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
            <label key={o.key} className="flex items-center gap-3 cursor-pointer">
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
            {t('exportAsTXT')}
          </button>
          <button
            onClick={handleHTML}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)' }}
          >
            <Printer size={14} strokeWidth={2} />
            {t('exportAsHTML')}
          </button>
        </div>
      </div>
    </div>
  )
}
