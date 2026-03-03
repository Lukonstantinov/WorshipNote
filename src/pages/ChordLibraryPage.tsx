import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Trash2, FolderOpen, Settings2, Guitar, Piano } from 'lucide-react'
import { useChordLibraryStore } from '../store/chordLibraryStore'
import type { ChordLibraryEntry, ChordLibraryFolder } from '../store/chordLibraryStore'
import { useSettingsStore } from '../store/settingsStore'
import { GuitarDiagram } from '../features/songs/components/GuitarDiagram'
import { PianoDiagram } from '../features/songs/components/PianoDiagram'
import { ChordLibraryFolderManager } from '../features/chordLibrary/components/ChordLibraryFolderManager'
import { ChordLibraryEditor } from '../features/chordLibrary/components/ChordLibraryEditor'

export default function ChordLibraryPage() {
  const { t } = useTranslation()
  const { entries, folders, deleteEntry } = useChordLibraryStore()
  const { guitarDotColor, guitarFlipped, pianoHighlightColor } = useSettingsStore()
  const [query, setQuery] = useState('')
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [instrumentFilter, setInstrumentFilter] = useState<'all' | 'guitar' | 'piano'>('all')
  const [showFolderManager, setShowFolderManager] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ChordLibraryEntry | undefined>()

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return entries.filter((e) => {
      const matchQuery = e.chordName.toLowerCase().includes(q) ||
        (e.comment?.toLowerCase().includes(q) ?? false)
      const matchFolder = activeFolderId ? e.folderId === activeFolderId : true
      const matchInstrument = instrumentFilter === 'all' || e.instrument === instrumentFilter
      return matchQuery && matchFolder && matchInstrument
    })
  }, [entries, query, activeFolderId, instrumentFilter])

  const handleEdit = (entry: ChordLibraryEntry) => {
    setEditingEntry(entry)
    setShowEditor(true)
  }

  const handleAdd = () => {
    setEditingEntry(undefined)
    setShowEditor(true)
  }

  const handleDeleteEntry = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      deleteEntry(id)
    }
  }

  return (
    <div className="p-4 pb-28 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-white tracking-tight">{t('chordLibraryTitle')}</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
          style={{ backgroundColor: '#bf5af2', color: '#fff', minHeight: 44 }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {t('addChord')}
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-3">
        <div
          className="flex-1 flex items-center gap-2 px-3 rounded-xl"
          style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', minHeight: 44 }}
        >
          <Search size={15} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.3)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none text-sm"
            placeholder={t('search') + '…'}
          />
        </div>
      </div>

      {/* Instrument filter */}
      <div className="flex gap-2 mb-3">
        {(['all', 'guitar', 'piano'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setInstrumentFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: instrumentFilter === f ? '#bf5af2' : '#1c1c1e',
              color: instrumentFilter === f ? '#fff' : 'rgba(235,235,245,0.4)',
              border: '1px solid #2c2c2e',
            }}
          >
            {f === 'guitar' && <Guitar size={12} />}
            {f === 'piano' && <Piano size={12} />}
            {t(f === 'all' ? 'allFolders' : f === 'guitar' ? 'guitar' : 'piano')}
          </button>
        ))}
      </div>

      {/* Folder chips */}
      {folders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
          <button
            onClick={() => setActiveFolderId(null)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: activeFolderId === null ? '#bf5af2' : '#1c1c1e',
              color: activeFolderId === null ? '#fff' : 'rgba(235,235,245,0.4)',
              border: '1px solid #2c2c2e',
            }}
          >
            {t('allFolders')}
          </button>
          {folders.map((folder: ChordLibraryFolder) => {
            const isActive = activeFolderId === folder.id
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolderId(isActive ? null : folder.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive ? `${folder.color}33` : '#1c1c1e',
                  color: isActive ? folder.color : 'rgba(235,235,245,0.5)',
                  border: `1px solid ${isActive ? folder.color + '66' : '#2c2c2e'}`,
                }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: folder.color }} />
                {folder.name}
              </button>
            )
          })}
          <button
            onClick={() => setShowFolderManager(true)}
            className="flex-shrink-0 flex items-center justify-center rounded-full"
            style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', minWidth: 28, minHeight: 28 }}
          >
            <Settings2 size={12} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.4)' }} />
          </button>
        </div>
      )}

      {folders.length === 0 && (
        <button
          onClick={() => setShowFolderManager(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs mb-3 transition-all"
          style={{ backgroundColor: '#1c1c1e', color: 'rgba(235,235,245,0.3)', border: '1px dashed #3c3c3e' }}
        >
          <FolderOpen size={12} strokeWidth={1.5} />
          {t('addFolder')}
        </button>
      )}

      {/* Chord grid */}
      {filtered.length === 0 ? (
        <div className="text-center mt-20">
          <Guitar size={40} strokeWidth={1} style={{ color: 'rgba(235,235,245,0.15)', margin: '0 auto 12px' }} />
          <p style={{ color: 'rgba(235,235,245,0.35)', fontSize: 15 }}>{t('noChords')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl p-3 transition-all hover:bg-white/5 cursor-pointer relative group"
              style={{ backgroundColor: '#1c1c1e' }}
              onClick={() => handleEdit(entry)}
            >
              <div className="flex justify-center mb-2">
                {entry.instrument === 'guitar' ? (
                  <GuitarDiagram
                    chord={entry.chordName}
                    customDiagram={entry.frets ? { frets: entry.frets, fingers: entry.fingers, baseFret: entry.baseFret, comment: entry.comment } : undefined}
                    size={100}
                    dotColor={guitarDotColor}
                    flipped={guitarFlipped}
                  />
                ) : (
                  <PianoDiagram
                    chord={entry.chordName}
                    customDiagram={entry.notes ? { notes: entry.notes, comment: entry.comment } : undefined}
                    size={100}
                    highlightColor={pianoHighlightColor}
                  />
                )}
              </div>
              {entry.folderId && (() => {
                const folder = folders.find((f) => f.id === entry.folderId)
                return folder ? (
                  <div className="flex items-center gap-1 justify-center mt-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
                    <span className="text-xs" style={{ color: folder.color + 'cc' }}>{folder.name}</span>
                  </div>
                ) : null
              })()}
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id) }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg"
                style={{ backgroundColor: '#2c2c2e' }}
              >
                <Trash2 size={13} strokeWidth={1.5} style={{ color: '#ff453a' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showFolderManager && <ChordLibraryFolderManager onClose={() => setShowFolderManager(false)} />}
      {showEditor && (
        <ChordLibraryEditor
          entry={editingEntry}
          onClose={() => { setShowEditor(false); setEditingEntry(undefined) }}
        />
      )}
    </div>
  )
}
