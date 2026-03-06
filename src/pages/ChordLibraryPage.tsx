import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Trash2, FolderOpen, Settings2, Music2, Guitar, CheckSquare, Square, FolderInput, X, ChevronRight } from 'lucide-react'
import { useChordLibraryStore } from '../store/chordLibraryStore'
import type { ChordProgression, ChordLibraryFolder } from '../store/chordLibraryStore'
import { useSettingsStore } from '../store/settingsStore'
import { GuitarDiagram } from '../features/songs/components/GuitarDiagram'
import { ChordLibraryFolderManager } from '../features/chordLibrary/components/ChordLibraryFolderManager'
import { ProgressionBuilder } from '../features/chordLibrary/components/ProgressionBuilder'
import { getAllChordNames, getGuitarChord } from '../features/songs/lib/chordData'

type Tab = 'progressions' | 'reference'

const CHORD_COLORS = ['#bf5af2', '#0a84ff', '#32d74b', '#ff9f0a', '#ff453a', '#64d2ff']

export default function ChordLibraryPage() {
  const { t } = useTranslation()
  const { progressions, folders, deleteProgression, deleteProgressions, moveProgressionsToFolder } = useChordLibraryStore()
  const { guitarDotColor, guitarFlipped } = useSettingsStore()

  const [tab, setTab] = useState<Tab>('progressions')
  const [query, setQuery] = useState('')
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [showFolderManager, setShowFolderManager] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingProgression, setEditingProgression] = useState<ChordProgression | undefined>()

  // Bulk selection
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showFolderPicker, setShowFolderPicker] = useState(false)

  // Reference tab
  const [refQuery, setRefQuery] = useState('')
  const allChordNames = useMemo(() => getAllChordNames(), [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return progressions.filter((p) => {
      const matchQuery = p.name.toLowerCase().includes(q) ||
        p.chords.some((c) => c.toLowerCase().includes(q)) ||
        (p.description?.toLowerCase().includes(q) ?? false)
      const matchFolder = activeFolderId ? p.folderId === activeFolderId : true
      return matchQuery && matchFolder
    })
  }, [progressions, query, activeFolderId])

  const filteredRefChords = useMemo(() => {
    if (!refQuery) return allChordNames
    return allChordNames.filter((n) => n.toLowerCase().includes(refQuery.toLowerCase()))
  }, [allChordNames, refQuery])

  const handleEdit = (p: ChordProgression) => { setEditingProgression(p); setShowBuilder(true) }
  const handleAdd = () => { setEditingProgression(undefined); setShowBuilder(true) }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()); setShowFolderPicker(false) }

  const handleDeleteSelected = () => {
    if (selected.size === 0) return
    if (confirm(`Delete ${selected.size} progression(s)?`)) {
      deleteProgressions(Array.from(selected))
      exitSelectMode()
    }
  }

  const handleMoveToFolder = (folderId: string | undefined) => {
    if (selected.size === 0) return
    moveProgressionsToFolder(Array.from(selected), folderId)
    exitSelectMode()
  }

  return (
    <div className="p-4 pb-28 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-white tracking-tight">Chord Library</h2>
        <div className="flex items-center gap-2">
          {tab === 'progressions' && (
            <>
              <button
                onClick={() => { setSelectMode((p) => !p); if (selectMode) exitSelectMode() }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{
                  backgroundColor: selectMode ? '#bf5af2' : '#1c1c1e',
                  color: selectMode ? '#fff' : 'rgba(235,235,245,0.5)',
                  minHeight: 44,
                  border: '1px solid #2c2c2e',
                }}
              >
                <CheckSquare size={15} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#bf5af2', color: '#fff', minHeight: 44 }}
              >
                <Plus size={16} strokeWidth={2.5} />
                New
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 rounded-2xl p-1" style={{ backgroundColor: '#1c1c1e' }}>
        {([
          { key: 'progressions' as Tab, label: 'Progressions', icon: <Music2 size={14} strokeWidth={1.5} /> },
          { key: 'reference' as Tab, label: 'Chord Reference', icon: <Guitar size={14} strokeWidth={1.5} /> },
        ]).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === key ? '#2c2c2e' : 'transparent',
              color: tab === key ? '#ffffff' : 'rgba(235,235,245,0.4)',
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {tab === 'progressions' && (
        <>
          {/* Bulk action bar */}
          {selectMode && (
            <div
              className="flex items-center gap-2 mb-3 px-3 py-2 rounded-2xl flex-wrap"
              style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e' }}
            >
              <button
                onClick={() => selected.size === filtered.length
                  ? setSelected(new Set())
                  : setSelected(new Set(filtered.map((p) => p.id)))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.7)' }}
              >
                {selected.size === filtered.length ? <Square size={12} /> : <CheckSquare size={12} />}
                {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-xs" style={{ color: 'rgba(235,235,245,0.4)' }}>{selected.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <div className="relative">
                  <button
                    onClick={() => setShowFolderPicker((p) => !p)}
                    disabled={selected.size === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40"
                    style={{ backgroundColor: '#0a84ff22', color: '#0a84ff' }}
                  >
                    <FolderInput size={13} /> Move
                  </button>
                  {showFolderPicker && (
                    <div className="absolute right-0 top-10 rounded-xl shadow-xl z-30 overflow-hidden" style={{ backgroundColor: '#2c2c2e', minWidth: 160 }}>
                      <button onClick={() => handleMoveToFolder(undefined)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10" style={{ color: 'rgba(235,235,245,0.5)' }}>— No folder —</button>
                      {folders.map((f) => (
                        <button key={f.id} onClick={() => handleMoveToFolder(f.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/10" style={{ color: 'rgba(235,235,245,0.8)' }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />{f.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleDeleteSelected} disabled={selected.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40" style={{ backgroundColor: '#ff453a22', color: '#ff453a' }}>
                  <Trash2 size={13} /> Delete
                </button>
                <button onClick={exitSelectMode} className="p-1.5 rounded-xl" style={{ backgroundColor: '#2c2c2e' }}>
                  <X size={13} style={{ color: 'rgba(235,235,245,0.5)' }} />
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 px-3 rounded-xl" style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', minHeight: 44 }}>
              <Search size={15} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.3)', flexShrink: 0 }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent text-white outline-none text-sm" placeholder="Search progressions…" />
            </div>
          </div>

          {/* Folder chips */}
          {folders.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
              <button onClick={() => setActiveFolderId(null)} className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: activeFolderId === null ? '#bf5af2' : '#1c1c1e', color: activeFolderId === null ? '#fff' : 'rgba(235,235,245,0.4)', border: '1px solid #2c2c2e' }}>
                All
              </button>
              {folders.map((folder: ChordLibraryFolder) => {
                const isActive = activeFolderId === folder.id
                return (
                  <button key={folder.id} onClick={() => setActiveFolderId(isActive ? null : folder.id)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: isActive ? `${folder.color}33` : '#1c1c1e', color: isActive ? folder.color : 'rgba(235,235,245,0.5)', border: `1px solid ${isActive ? folder.color + '66' : '#2c2c2e'}` }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: folder.color }} />
                    {folder.name}
                  </button>
                )
              })}
              <button onClick={() => setShowFolderManager(true)} className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', minWidth: 28, minHeight: 28 }}>
                <Settings2 size={12} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.4)' }} />
              </button>
            </div>
          )}

          {folders.length === 0 && (
            <button onClick={() => setShowFolderManager(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs mb-3" style={{ backgroundColor: '#1c1c1e', color: 'rgba(235,235,245,0.3)', border: '1px dashed #3c3c3e' }}>
              <FolderOpen size={12} strokeWidth={1.5} /> Add folder
            </button>
          )}

          {/* Progressions list */}
          {filtered.length === 0 ? (
            <div className="text-center mt-20">
              <Music2 size={40} strokeWidth={1} style={{ color: 'rgba(235,235,245,0.15)', margin: '0 auto 12px' }} />
              <p style={{ color: 'rgba(235,235,245,0.35)', fontSize: 15 }}>
                {progressions.length === 0 ? 'No progressions yet. Tap "New" to create one.' : 'No progressions match your search.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => {
                const folder = p.folderId ? folders.find((f) => f.id === p.folderId) : undefined
                const isSelected = selected.has(p.id)
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl p-4 transition-all"
                    style={{
                      backgroundColor: isSelected ? '#bf5af222' : '#1c1c1e',
                      border: isSelected ? '1px solid #bf5af266' : '1px solid transparent',
                      borderLeft: folder ? `3px solid ${folder.color}` : isSelected ? '3px solid #bf5af2' : undefined,
                    }}
                    onClick={selectMode ? () => toggleSelect(p.id) : undefined}
                  >
                    <div className="flex items-start gap-3">
                      {selectMode && (
                        <div className="flex-shrink-0 mt-0.5">
                          {isSelected
                            ? <CheckSquare size={18} strokeWidth={1.5} style={{ color: '#bf5af2' }} />
                            : <Square size={18} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.3)' }} />
                          }
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-semibold text-white text-sm">{p.name}</span>
                          {p.key && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#bf5af222', color: '#bf5af2' }}>
                              {p.key}
                            </span>
                          )}
                          {folder && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
                              <span className="text-xs" style={{ color: folder.color + 'cc' }}>{folder.name}</span>
                            </div>
                          )}
                        </div>
                        {/* Chord chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {p.chords.map((chord, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <span
                                className="text-sm font-bold px-2.5 py-1 rounded-lg"
                                style={{ backgroundColor: CHORD_COLORS[i % CHORD_COLORS.length] + '22', color: CHORD_COLORS[i % CHORD_COLORS.length] }}
                              >
                                {chord}
                              </span>
                              {i < p.chords.length - 1 && (
                                <span style={{ color: 'rgba(235,235,245,0.2)', fontSize: 12 }}>→</span>
                              )}
                            </span>
                          ))}
                        </div>
                        {p.description && (
                          <p className="text-xs mt-1.5" style={{ color: 'rgba(235,235,245,0.35)' }}>{p.description}</p>
                        )}
                      </div>
                      {!selectMode && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(p)} className="p-2 rounded-xl hover:bg-white/5" title="Edit">
                            <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.3)' }} />
                          </button>
                          <button onClick={() => { if (confirm('Delete this progression?')) deleteProgression(p.id) }} className="p-2 rounded-xl hover:bg-white/5">
                            <Trash2 size={14} strokeWidth={1.5} style={{ color: '#ff453a' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'reference' && (
        <>
          {/* Reference search */}
          <div className="flex items-center gap-2 px-3 rounded-xl mb-4" style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', minHeight: 44 }}>
            <Search size={15} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.3)', flexShrink: 0 }} />
            <input value={refQuery} onChange={(e) => setRefQuery(e.target.value)} className="flex-1 bg-transparent text-white outline-none text-sm" placeholder="Search chords (e.g. Am, F#m, Cmaj7)…" />
          </div>
          <p className="text-xs mb-3 px-1" style={{ color: 'rgba(235,235,245,0.3)' }}>
            Built-in guitar chord reference · {filteredRefChords.length} chords
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filteredRefChords.map((name) => {
              const voicing = getGuitarChord(name)
              if (!voicing) return null
              return (
                <div key={name} className="flex flex-col items-center rounded-2xl p-3" style={{ backgroundColor: '#1c1c1e' }}>
                  <GuitarDiagram
                    chord={name}
                    customDiagram={voicing}
                    size={80}
                    dotColor={guitarDotColor}
                    flipped={guitarFlipped}
                  />
                  <span className="text-xs font-semibold text-white mt-1">{name}</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Modals */}
      {showFolderManager && <ChordLibraryFolderManager onClose={() => setShowFolderManager(false)} />}
      {showBuilder && (
        <ProgressionBuilder
          progression={editingProgression}
          onClose={() => { setShowBuilder(false); setEditingProgression(undefined) }}
        />
      )}
    </div>
  )
}
