import { useState } from 'react'
import { Plus, X, TableProperties } from 'lucide-react'
import { useChordLibraryStore } from '../../../store/chordLibraryStore'
import { TabViewer } from './TabViewer'
import type { GuitarTab } from '../types'

interface Props {
  tabIds: string[]
  onChange: (tabIds: string[]) => void
}

const INSTRUMENT_LABEL: Record<GuitarTab['instrument'], string> = {
  guitar: 'Guitar',
  bass: 'Bass',
  ukulele: 'Ukulele',
}

export function SongTabsPanel({ tabIds, onChange }: Props) {
  const { tabs } = useChordLibraryStore()
  const [showPicker, setShowPicker] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')

  const attachedTabs = tabIds.map((id) => tabs.find((t) => t.id === id)).filter(Boolean) as GuitarTab[]
  const availableTabs = tabs.filter((t) => !tabIds.includes(t.id))
  const filteredAvailable = availableTabs.filter((t) =>
    t.name.toLowerCase().includes(pickerQuery.toLowerCase())
  )

  const attachTab = (id: string) => {
    onChange([...tabIds, id])
    setShowPicker(false)
    setPickerQuery('')
  }

  const detachTab = (id: string) => {
    onChange(tabIds.filter((tid) => tid !== id))
  }

  return (
    <div className="px-4 pb-4">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <TableProperties size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>
          Guitar Tabs
        </span>
        <button
          onClick={() => setShowPicker((p) => !p)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <Plus size={12} strokeWidth={2.5} />
          Add from library
        </button>
      </div>

      {/* Picker dropdown */}
      {showPicker && (
        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card-raised)' }}
        >
          <div className="p-3">
            <input
              autoFocus
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="Search tabs…"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-input-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
          {filteredAvailable.length === 0 ? (
            <p className="px-4 pb-4 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
              {availableTabs.length === 0 ? 'No tabs in library yet.' : 'No matching tabs.'}
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto">
              {filteredAvailable.map((t) => (
                <button
                  key={t.id}
                  onClick={() => attachTab(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover-bg"
                  style={{ borderTop: '1px solid var(--color-border-subtle)' }}
                >
                  <TableProperties size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {t.name}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
                  >
                    {INSTRUMENT_LABEL[t.instrument]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attached tabs */}
      {attachedTabs.length > 0 && (
        <div className="space-y-3">
          {attachedTabs.map((t) => (
            <div key={t.id} className="relative">
              <TabViewer tab={t} />
              <button
                onClick={() => detachTab(t.id)}
                className="absolute top-2 right-2 flex items-center justify-center rounded-full p-1 transition-all hover-bg"
                style={{ backgroundColor: 'var(--color-card-raised)' }}
                title="Remove from song"
              >
                <X size={12} strokeWidth={2.5} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {attachedTabs.length === 0 && !showPicker && (
        <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
          No tabs attached. Add one from the library.
        </p>
      )}
    </div>
  )
}
