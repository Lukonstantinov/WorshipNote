import type { GuitarTab, TabColumn, TabInstrument } from '../types'
import { generateId } from '../../../shared/lib/storage'

export const STRINGS_BY_INSTRUMENT: Record<TabInstrument, string[]> = {
  guitar:  ['E', 'B', 'G', 'D', 'A', 'E'],
  bass:    ['G', 'D', 'A', 'E'],
  ukulele: ['A', 'E', 'C', 'G'],
}

export function createEmptyColumn(instrument: TabInstrument): TabColumn {
  return {
    id: generateId(),
    cells: Array(STRINGS_BY_INSTRUMENT[instrument].length).fill(null),
  }
}

export function createSeparatorColumn(): TabColumn {
  return { id: generateId(), isSeparator: true, cells: [] }
}

export function generateAsciiTab(tab: GuitarTab): string {
  const strings = STRINGS_BY_INSTRUMENT[tab.instrument]
  if (tab.columns.length === 0) {
    return strings.map((s) => `${s}|`).join('\n')
  }

  // Column widths: widest cell value in each column (minimum 1)
  const colWidths = tab.columns.map((col) => {
    if (col.isSeparator) return 0
    return Math.max(1, ...col.cells.map((c) => (c === null ? 1 : String(c).length)))
  })

  const rows = strings.map((strName, strIdx) => {
    let row = `${strName}|`
    tab.columns.forEach((col, colIdx) => {
      if (col.isSeparator) {
        row += '|'
      } else {
        const width = colWidths[colIdx]
        const cell = col.cells[strIdx]
        if (cell === null) {
          row += '-'.repeat(width + 1)
        } else {
          const cellStr = String(cell)
          row += '-' + cellStr + '-'.repeat(Math.max(0, width - cellStr.length))
        }
      }
    })
    row += '|'
    return row
  })

  return rows.join('\n')
}
