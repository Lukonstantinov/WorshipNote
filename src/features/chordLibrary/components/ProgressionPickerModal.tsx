import { useState, useMemo } from 'react'
import { X, Search, Music2 } from 'lucide-react'
import { useChordLibraryStore } from '../../../store/chordLibraryStore'
import type { ChordRow } from '../../songs/types'
import { generateId } from '../../../shared/lib/storage'

const CHORD_COLORS = ['var(--color-accent)', 'var(--color-info)', 'var(--color-chord)', 'var(--color-warning)', 'var(--color-error)', 'var(--color-info)']

interface Props {
  onSelect: (row: ChordRow) => void
  onClose: () => void
}

export function ProgressionPickerModal({ onSelect, onClose }: Props) {
  const { progressions, folders } = useChordLibraryStore()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query) return progressions
    const q = query.toLowerCase()
    return progressions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.chords.some((c) => c.toLowerCase().includes(q))
    )
  }, [progressions, query])

  const handleSelect = (p: typeof progressions[0]) => {
    const row: ChordRow = {
      id: generateId(),
      label: p.name,
      chords: [...p.chords],
      color: 'var(--color-accent)',
      fromLibrary: true,
      libraryProgressionId: p.id,
    }
    onSelect(row)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--color-bg-secondary)', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Music2 size={20} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
          <h2 className="flex-1 font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Add from Library
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-card-raised)' }}>
            <X size={18} strokeWidth={2} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 px-3 rounded-xl" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', minHeight: 44 }}>
            <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
              placeholder="Search progressions…"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto px-5 pb-6 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <Music2 size={32} strokeWidth={1} style={{ color: 'var(--color-text-muted)', margin: '0 auto 8px' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                {progressions.length === 0
                  ? 'No progressions in library yet. Create one first.'
                  : 'No progressions match your search.'}
              </p>
            </div>
          ) : (
            filtered.map((p) => {
              const folder = p.folderId ? folders.find((f) => f.id === p.folderId) : undefined
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98] hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{p.name}</span>
                    {p.key && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
                        {p.key}
                      </span>
                    )}
                    {folder && (
                      <div className="flex items-center gap-1 ml-auto">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
                        <span className="text-xs" style={{ color: folder.color }}>{folder.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.chords.map((chord, i) => (
                      <span key={i} className="flex items-center gap-0.5">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: CHORD_COLORS[i % CHORD_COLORS.length] + '22', color: CHORD_COLORS[i % CHORD_COLORS.length] }}
                        >
                          {chord}
                        </span>
                        {i < p.chords.length - 1 && (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
