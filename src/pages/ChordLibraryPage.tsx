import { useState, useMemo, useRef } from 'react'
import { Search, Plus, Trash2, FolderOpen, Settings2, Music2, Guitar, CheckSquare, Square, FolderInput, X, ChevronRight, ChevronDown, Pencil, TableProperties } from 'lucide-react'
import { useChordLibraryStore } from '../store/chordLibraryStore'
import type { ChordProgression, ChordLibraryFolder } from '../store/chordLibraryStore'
import { TabEditor } from '../features/songs/components/TabEditor'
import type { GuitarTab } from '../features/songs/types'
import { generateAsciiTab } from '../features/songs/lib/tabUtils'
import { useSettingsStore } from '../store/settingsStore'
import { GuitarDiagram } from '../features/songs/components/GuitarDiagram'
import { MiniGuitarDiagram } from '../features/songs/components/MiniGuitarDiagram'
import { MiniPianoDiagram } from '../features/songs/components/MiniPianoDiagram'
import { MiniBassDiagram } from '../features/songs/components/MiniBassDiagram'
import { UkuleleDiagram } from '../features/songs/components/UkuleleDiagram'
import { ChordDiagramEditor } from '../features/songs/components/ChordDiagramEditor'
import { ChordDetailModal } from '../features/songs/components/ChordDetailModal'
import { ChordLibraryFolderManager } from '../features/chordLibrary/components/ChordLibraryFolderManager'
import { ProgressionBuilder } from '../features/chordLibrary/components/ProgressionBuilder'
import { getAllChordNames, getGuitarChord, getChordCategory, CHORD_CATEGORIES } from '../features/songs/lib/chordData'
import type { ChordCategory } from '../features/songs/lib/chordData'
import { getAllUkuleleChordNames } from '../features/songs/lib/ukuleleChordData'
import { getAllBassChordNames } from '../features/songs/lib/bassChordData'

type Tab = 'progressions' | 'reference' | 'tabs'

const CHORD_COLORS = ['var(--color-accent)', 'var(--color-info)', 'var(--color-chord)', 'var(--color-warning)', 'var(--color-error)', 'var(--color-info)']

function ProgressionDiagrams({ chords, onEditChord }: { chords: string[]; onEditChord: (chord: string) => void }) {
  const {
    selectedInstrument, instruments,
    customChords, customPianoChords,
    guitarDotColor, pianoHighlightColor, guitarFlipped, diagramScale,
  } = useSettingsStore()

  const instrument = instruments.find((i) => i.id === selectedInstrument)
  const instrType = instrument?.type ?? 'guitar'
  const showPiano = instrType === 'piano' || instrType === 'keyboard'
  const showBass = instrType === 'bass'
  const scale = diagramScale ?? 1
  const miniSz = Math.round(64 * scale)

  return (
    <div
      className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none"
      style={{ borderTop: '1px solid var(--color-border-subtle)' }}
    >
      {chords.map((chord, i) => (
        <button
          key={`${chord}-${i}`}
          className="flex-shrink-0 flex flex-col items-center gap-1 pt-3 rounded-xl px-1 transition-all active:scale-95 hover-bg"
          title="Tap to edit chord diagram"
          onClick={() => onEditChord(chord)}
        >
          {showPiano ? (
            <MiniPianoDiagram chord={chord} customDiagram={customPianoChords[chord]} size={miniSz} highlightColor={pianoHighlightColor} />
          ) : showBass ? (
            <MiniBassDiagram chord={chord} customDiagram={customChords[chord]} size={miniSz} dotColor={guitarDotColor} flipped={guitarFlipped} />
          ) : (
            <MiniGuitarDiagram chord={chord} customDiagram={customChords[chord]} size={miniSz} dotColor={guitarDotColor} flipped={guitarFlipped} />
          )}
          <span className="text-xs font-semibold" style={{ color: 'var(--color-chord)' }}>{chord}</span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: 9 }}>edit</span>
        </button>
      ))}
    </div>
  )
}

export default function ChordLibraryPage() {
  const { progressions, folders, deleteProgression, deleteProgressions, moveProgressionsToFolder, tabs, addTab, updateTab, deleteTab } = useChordLibraryStore()
  const { guitarDotColor, guitarFlipped, customChords, customPianoChords, deleteCustomChord, deleteCustomPianoChord, pianoHighlightColor, selectedInstrument, instruments } = useSettingsStore()
  const progInstrument = instruments.find((i) => i.id === selectedInstrument)
  const progInstrType = progInstrument?.type ?? 'guitar'

  const [tab, setTab] = useState<Tab>('progressions')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [showFolderManager, setShowFolderManager] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingProgression, setEditingProgression] = useState<ChordProgression | undefined>()

  // Bulk selection
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showFolderPicker, setShowFolderPicker] = useState(false)

  // Tabs tab
  const [tabQuery, setTabQuery] = useState('')
  const [showTabEditor, setShowTabEditor] = useState(false)
  const [editingTab, setEditingTab] = useState<GuitarTab | undefined>()
  const [tabActiveFolderId, setTabActiveFolderId] = useState<string | null>(null)

  // Reference tab
  const [refQuery, setRefQuery] = useState('')
  const [refInstrument, setRefInstrument] = useState<'guitar' | 'bass' | 'piano' | 'ukulele'>('guitar')
  const [refCategory, setRefCategory] = useState<'all' | ChordCategory | 'custom'>('all')
  const [editingCustomChord, setEditingCustomChord] = useState<string | null>(null)
  const [showCustomNameInput, setShowCustomNameInput] = useState(false)
  const [customChordNameInput, setCustomChordNameInput] = useState('')
  // Select-to-build mode: user taps chords to queue them up, then builds a progression
  const [refSelectMode, setRefSelectMode] = useState(false)
  const [refSelectedChords, setRefSelectedChords] = useState<string[]>([])
  // Edit diagram within expanded progression card
  const [editingProgressionChord, setEditingProgressionChord] = useState<string | null>(null)
  // Chord detail modal (enlarged view + suggested progressions)
  const [detailChord, setDetailChord] = useState<string | null>(null)
  const customChordInputRef = useRef<HTMLInputElement>(null)

  const allChordNames = useMemo(() => getAllChordNames(), [])
  const allUkuleleNames = useMemo(() => getAllUkuleleChordNames(), [])
  const allBassNames = useMemo(() => getAllBassChordNames(), [])

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
    const q = refQuery.toLowerCase()

    // Get base list for instrument
    let baseNames: string[]
    if (refInstrument === 'ukulele') {
      baseNames = allUkuleleNames
    } else if (refInstrument === 'bass') {
      baseNames = refCategory === 'custom' ? Object.keys(customChords) : allBassNames
    } else if (refCategory === 'custom') {
      baseNames = Object.keys(customChords)
    } else {
      baseNames = allChordNames
    }

    // Add custom chord names to guitar/bass/piano view (those not already in the built-in list)
    if (refInstrument !== 'ukulele' && refCategory !== 'custom') {
      const customNames = Object.keys(customChords).filter((n) => !baseNames.includes(n))
      if (customNames.length > 0) baseNames = [...baseNames, ...customNames]
    }

    // Filter by category
    let names = baseNames
    if (refCategory !== 'all' && refCategory !== 'custom') {
      names = names.filter((n) => getChordCategory(n) === refCategory)
    }

    // Filter by search
    if (q) names = names.filter((n) => n.toLowerCase().includes(q))

    return names
  }, [allChordNames, allUkuleleNames, refQuery, refInstrument, refCategory, customChords])

  const filteredTabs = useMemo(() => {
    const q = tabQuery.toLowerCase()
    return tabs.filter((t) => {
      const matchQuery = t.name.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q) ?? false)
      const matchFolder = tabActiveFolderId ? t.folderId === tabActiveFolderId : true
      return matchQuery && matchFolder
    })
  }, [tabs, tabQuery, tabActiveFolderId])

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
        <h2 className="text-2xl font-bold tracking-tight">Chord Library</h2>
        <div className="flex items-center gap-2">
          {tab === 'progressions' && (
            <>
              <button
                onClick={() => { setSelectMode((p) => !p); if (selectMode) exitSelectMode() }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{
                  backgroundColor: selectMode ? 'var(--color-accent)' : 'var(--color-card)',
                  color: selectMode ? '#fff' : 'var(--color-text-tertiary)',
                  minHeight: 44,
                  border: '1px solid var(--color-border)',
                }}
              >
                <CheckSquare size={15} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-primary)', minHeight: 44 }}
              >
                <Plus size={16} strokeWidth={2.5} />
                New
              </button>
            </>
          )}
          {tab === 'tabs' && (
            <button
              onClick={() => { setEditingTab(undefined); setShowTabEditor(true) }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-accent)', color: '#fff', minHeight: 44 }}
            >
              <Plus size={16} strokeWidth={2.5} />
              New Tab
            </button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 rounded-2xl p-1" style={{ backgroundColor: 'var(--color-card)' }}>
        {([
          { key: 'progressions' as Tab, label: 'Progressions', icon: <Music2 size={14} strokeWidth={1.5} /> },
          { key: 'reference' as Tab, label: 'Reference', icon: <Guitar size={14} strokeWidth={1.5} /> },
          { key: 'tabs' as Tab, label: 'Tabs', icon: <TableProperties size={14} strokeWidth={1.5} /> },
        ]).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === key ? 'var(--color-card-raised)' : 'transparent',
              color: tab === key ? '#ffffff' : 'var(--color-text-tertiary)',
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
              style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            >
              <button
                onClick={() => selected.size === filtered.length
                  ? setSelected(new Set())
                  : setSelected(new Set(filtered.map((p) => p.id)))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)' }}
              >
                {selected.size === filtered.length ? <Square size={12} /> : <CheckSquare size={12} />}
                {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{selected.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <div className="relative">
                  <button
                    onClick={() => setShowFolderPicker((p) => !p)}
                    disabled={selected.size === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40"
                    style={{ backgroundColor: '#0a84ff22', color: 'var(--color-info)' }}
                  >
                    <FolderInput size={13} /> Move
                  </button>
                  {showFolderPicker && (
                    <div className="absolute right-0 top-10 rounded-xl shadow-xl z-30 overflow-hidden" style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 160 }}>
                      <button onClick={() => handleMoveToFolder(undefined)} className="w-full text-left px-4 py-2.5 text-sm hover-bg" style={{ color: 'var(--color-text-tertiary)' }}>— No folder —</button>
                      {folders.map((f) => (
                        <button key={f.id} onClick={() => handleMoveToFolder(f.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover-bg" style={{ color: 'var(--color-text-secondary)' }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />{f.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleDeleteSelected} disabled={selected.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40" style={{ backgroundColor: '#ff453a22', color: 'var(--color-error)' }}>
                  <Trash2 size={13} /> Delete
                </button>
                <button onClick={exitSelectMode} className="p-1.5 rounded-xl" style={{ backgroundColor: 'var(--color-card-raised)' }}>
                  <X size={13} style={{ color: 'var(--color-text-tertiary)' }} />
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 px-3 rounded-xl" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', minHeight: 44 }}>
              <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" placeholder="Search progressions…" />
            </div>
          </div>

          {/* Folder chips */}
          {folders.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
              <button onClick={() => setActiveFolderId(null)} className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: activeFolderId === null ? 'var(--color-accent)' : 'var(--color-card)', color: activeFolderId === null ? '#fff' : 'var(--color-text-tertiary)', border: '1px solid var(--color-border)' }}>
                All
              </button>
              {folders.map((folder: ChordLibraryFolder) => {
                const isActive = activeFolderId === folder.id
                return (
                  <button key={folder.id} onClick={() => setActiveFolderId(isActive ? null : folder.id)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: isActive ? `${folder.color}33` : 'var(--color-card)', color: isActive ? folder.color : 'var(--color-text-tertiary)', border: `1px solid ${isActive ? folder.color + '66' : 'var(--color-card-raised)'}` }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: folder.color }} />
                    {folder.name}
                  </button>
                )
              })}
              <button onClick={() => setShowFolderManager(true)} className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', minWidth: 28, minHeight: 28 }}>
                <Settings2 size={12} strokeWidth={2} style={{ color: 'var(--color-text-tertiary)' }} />
              </button>
            </div>
          )}

          {folders.length === 0 && (
            <button onClick={() => setShowFolderManager(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs mb-3" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}>
              <FolderOpen size={12} strokeWidth={1.5} /> Add folder
            </button>
          )}

          {/* Progressions list */}
          {filtered.length === 0 ? (
            <div className="text-center mt-20">
              <Music2 size={40} strokeWidth={1} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 15 }}>
                {progressions.length === 0 ? 'No progressions yet. Tap "New" to create one.' : 'No progressions match your search.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => {
                const folder = p.folderId ? folders.find((f) => f.id === p.folderId) : undefined
                const isSelected = selected.has(p.id)
                const isExpanded = expandedId === p.id
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl transition-all overflow-hidden"
                    style={{
                      background: p.color && !isSelected
                        ? `linear-gradient(135deg, ${p.color}28, ${p.color}0a), var(--color-card)`
                        : isSelected ? 'var(--color-accent-dim)' : 'var(--color-card)',
                      border: isSelected ? `1px solid var(--color-accent)` : p.color ? `1px solid ${p.color}44` : '1px solid transparent',
                      borderLeft: folder ? `3px solid ${folder.color}` : p.color ? `3px solid ${p.color}` : isSelected ? '3px solid var(--color-accent)' : undefined,
                    }}
                    onClick={selectMode ? () => toggleSelect(p.id) : undefined}
                  >
                    <div className="flex items-start gap-3 p-4">
                      {selectMode && (
                        <div className="flex-shrink-0 mt-0.5">
                          {isSelected
                            ? <CheckSquare size={18} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                            : <Square size={18} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
                          }
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-semibold text-sm">{p.name}</span>
                          {p.key && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}>
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
                                <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>→</span>
                              )}
                            </span>
                          ))}
                        </div>
                        {p.description && (
                          <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-tertiary)' }}>{p.description}</p>
                        )}
                      </div>
                      {!selectMode && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : p.id)}
                            className="p-2 rounded-xl hover-bg transition-transform"
                            title={isExpanded ? 'Collapse' : 'Show chord diagrams'}
                          >
                            <ChevronDown
                              size={16}
                              strokeWidth={1.5}
                              style={{
                                color: isExpanded ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </button>
                          <button onClick={() => handleEdit(p)} className="p-2 rounded-xl hover-bg" title="Edit">
                            <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
                          </button>
                          <button onClick={() => { if (confirm('Delete this progression?')) deleteProgression(p.id) }} className="p-2 rounded-xl hover-bg">
                            <Trash2 size={14} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expanded chord diagrams — tap to edit */}
                    {isExpanded && p.chords.length > 0 && (
                      <ProgressionDiagrams chords={p.chords} onEditChord={(chord) => setEditingProgressionChord(chord)} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'reference' && (
        <>
          {/* Instrument tabs */}
          <div className="flex gap-1 mb-3 rounded-xl p-1" style={{ backgroundColor: 'var(--color-card)' }}>
            {(['guitar', 'bass', 'piano', 'ukulele'] as const).map((instr) => (
              <button
                key={instr}
                onClick={() => { setRefInstrument(instr); setRefCategory('all') }}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  backgroundColor: refInstrument === instr ? 'var(--color-accent)' : 'transparent',
                  color: refInstrument === instr ? '#fff' : 'var(--color-text-tertiary)',
                }}
              >
                {instr}
              </button>
            ))}
          </div>

          {/* Category filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
            {[...CHORD_CATEGORIES, { key: 'custom' as const, label: 'Custom' }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRefCategory(key)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: refCategory === key ? 'var(--color-accent)' : 'var(--color-card)',
                  color: refCategory === key ? '#fff' : 'var(--color-text-tertiary)',
                  border: `1px solid ${refCategory === key ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Reference search + actions */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 px-3 rounded-xl" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', minHeight: 44 }}>
              <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input value={refQuery} onChange={(e) => setRefQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" placeholder={`Search ${refInstrument} chords…`} />
            </div>
            {/* Select mode toggle */}
            <button
              onClick={() => { setRefSelectMode((v) => !v); setRefSelectedChords([]) }}
              className="flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 flex-shrink-0"
              style={{
                backgroundColor: refSelectMode ? 'var(--color-info)' : 'var(--color-card)',
                color: refSelectMode ? '#fff' : 'var(--color-text-tertiary)',
                border: `1px solid ${refSelectMode ? 'var(--color-info)' : 'var(--color-border)'}`,
                minHeight: 44,
              }}
              title="Select chords to build progression"
            >
              <CheckSquare size={15} strokeWidth={1.5} />
              Select
            </button>
            <button
              onClick={() => { setShowCustomNameInput(true); setCustomChordNameInput(''); setTimeout(() => customChordInputRef.current?.focus(), 50) }}
              className="flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-accent)', color: '#fff', minHeight: 44 }}
              title="Create custom chord"
            >
              <Plus size={16} strokeWidth={2.5} />
              Custom
            </button>
          </div>

          {/* Select mode: selected chord queue + build button */}
          {refSelectMode && (
            <div className="mb-3 p-3 rounded-2xl" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-info)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-info)' }}>
                  {refSelectedChords.length === 0 ? 'Tap chords below to add to progression' : `${refSelectedChords.length} chord${refSelectedChords.length !== 1 ? 's' : ''} selected`}
                </span>
                {refSelectedChords.length > 0 && (
                  <button onClick={() => setRefSelectedChords([])} className="text-xs px-2 py-0.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>Clear</button>
                )}
              </div>
              {refSelectedChords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {refSelectedChords.map((chord, idx) => (
                    <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--color-card-raised)' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-chord)' }}>{chord}</span>
                      <button onClick={() => setRefSelectedChords((prev) => prev.filter((_, i) => i !== idx))}>
                        <X size={10} strokeWidth={2.5} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                disabled={refSelectedChords.length === 0}
                onClick={() => {
                  setShowBuilder(true)
                  setEditingProgression(undefined)
                  setRefSelectMode(false)
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-info)', color: '#fff' }}
              >
                Build Progression →
              </button>
            </div>
          )}

          {/* Custom chord name input */}
          {showCustomNameInput && (
            <div className="flex gap-2 mb-3 p-3 rounded-2xl" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <div className="flex-1">
                <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>Enter chord name (e.g. Xmaj, MyChord):</p>
                <input
                  ref={customChordInputRef}
                  value={customChordNameInput}
                  onChange={(e) => setCustomChordNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customChordNameInput.trim()) {
                      setEditingCustomChord(customChordNameInput.trim())
                      setShowCustomNameInput(false)
                    } else if (e.key === 'Escape') {
                      setShowCustomNameInput(false)
                    }
                  }}
                  className="w-full bg-transparent outline-none text-sm px-2 py-1 rounded-lg"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="e.g. Cadd2"
                />
              </div>
              <div className="flex flex-col gap-1 justify-center">
                <button
                  onClick={() => { if (customChordNameInput.trim()) { setEditingCustomChord(customChordNameInput.trim()); setShowCustomNameInput(false) } }}
                  disabled={!customChordNameInput.trim()}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCustomNameInput(false)}
                  className="px-3 py-1.5 rounded-xl text-xs"
                  style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-tertiary)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <p className="text-xs mb-3 px-1" style={{ color: 'var(--color-text-muted)' }}>
            {refInstrument.charAt(0).toUpperCase() + refInstrument.slice(1)} chord reference · {filteredRefChords.length} chords · Tap to view
          </p>

          {/* Chord grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filteredRefChords.map((chordName) => {
              const isCustom = !!customChords[chordName]
              const selCount = refSelectedChords.filter((c) => c === chordName).length
              const isInSelection = selCount > 0
              return (
                <div
                  key={chordName}
                  className="relative flex flex-col items-center rounded-2xl p-3 cursor-pointer transition-all active:scale-95"
                  style={{
                    backgroundColor: isInSelection ? 'var(--color-info)' + '22' : 'var(--color-card)',
                    border: isInSelection ? '2px solid var(--color-info)' : isCustom ? '1px solid var(--color-accent)' : '1px solid transparent',
                  }}
                  onClick={() => {
                    if (refSelectMode) {
                      // In select mode: add to queue (allows duplicates)
                      setRefSelectedChords((prev) => [...prev, chordName])
                    } else {
                      // Default: open enlarged chord detail view
                      setDetailChord(chordName)
                    }
                  }}
                >
                  {/* Selection count badge */}
                  {isInSelection && (
                    <div
                      className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: 'var(--color-info)', color: '#fff', fontSize: 10 }}
                    >
                      {selCount}
                    </div>
                  )}
                  {/* Custom badge */}
                  {isCustom && (
                    <span
                      className="absolute top-1 right-1 px-1 rounded text-xs font-bold"
                      style={{ backgroundColor: 'var(--color-accent)', color: '#fff', fontSize: 8, lineHeight: '14px' }}
                    >
                      custom
                    </span>
                  )}

                  {/* Diagram */}
                  {refInstrument === 'guitar' && (
                    <GuitarDiagram
                      chord={chordName}
                      customDiagram={customChords[chordName] ?? getGuitarChord(chordName) ?? undefined}
                      size={80}
                      dotColor={guitarDotColor}
                      flipped={guitarFlipped}
                    />
                  )}
                  {refInstrument === 'bass' && (
                    <MiniBassDiagram
                      chord={chordName}
                      customDiagram={customChords[chordName]}
                      size={80}
                      dotColor={guitarDotColor}
                      flipped={guitarFlipped}
                    />
                  )}
                  {refInstrument === 'piano' && (
                    <MiniPianoDiagram
                      chord={chordName}
                      customDiagram={customPianoChords[chordName]}
                      size={80}
                      highlightColor={pianoHighlightColor}
                    />
                  )}
                  {refInstrument === 'ukulele' && (
                    <UkuleleDiagram
                      chord={chordName}
                      customDiagram={customChords[chordName]}
                      size={80}
                      dotColor={guitarDotColor}
                      flipped={guitarFlipped}
                    />
                  )}

                  <span className="text-xs font-semibold mt-1 text-center leading-tight">{chordName}</span>

                  {/* Edit/delete for custom chords on hover */}
                  {isCustom && (
                    <div className="flex gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingCustomChord(chordName)}
                        className="p-1 rounded-lg hover-bg"
                        title="Edit diagram"
                      >
                        <Pencil size={10} strokeWidth={2} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete custom chord "${chordName}"?`)) { deleteCustomChord(chordName); deleteCustomPianoChord(chordName) } }}
                        className="p-1 rounded-lg hover-bg"
                        title="Delete"
                      >
                        <Trash2 size={10} strokeWidth={2} style={{ color: 'var(--color-error)' }} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Tabs section ─────────────────────────────────────── */}
      {tab === 'tabs' && (
        <>
          {/* Folder filter */}
          {folders.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => setTabActiveFolderId(null)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  backgroundColor: tabActiveFolderId === null ? 'var(--color-accent)' : 'var(--color-card)',
                  color: tabActiveFolderId === null ? '#fff' : 'var(--color-text-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                All
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTabActiveFolderId(tabActiveFolderId === f.id ? null : f.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    backgroundColor: tabActiveFolderId === f.id ? f.color : 'var(--color-card)',
                    color: tabActiveFolderId === f.id ? '#fff' : 'var(--color-text-tertiary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={tabQuery}
              onChange={(e) => setTabQuery(e.target.value)}
              placeholder="Search tabs…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Tab cards */}
          {filteredTabs.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
              <TableProperties size={32} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{tabs.length === 0 ? 'No tabs yet. Create the first one!' : 'No tabs match your search.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTabs.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }}
                >
                  {/* Card header */}
                  <div
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border-subtle)' }}
                  >
                    <span className="font-semibold text-sm flex-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {t.name}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
                    >
                      {t.instrument === 'guitar' ? 'Guitar' : t.instrument === 'bass' ? 'Bass' : 'Ukulele'}
                    </span>
                    {folders.find((f) => f.id === t.folderId) && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `${folders.find((f) => f.id === t.folderId)?.color}22`,
                          color: folders.find((f) => f.id === t.folderId)?.color,
                        }}
                      >
                        {folders.find((f) => f.id === t.folderId)?.name}
                      </span>
                    )}
                    <button
                      onClick={() => { setEditingTab(t); setShowTabEditor(true) }}
                      className="flex items-center justify-center rounded-lg p-1.5 transition-all hover-bg flex-shrink-0"
                      title="Edit"
                    >
                      <Pencil size={13} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete tab "${t.name}"?`)) deleteTab(t.id) }}
                      className="flex items-center justify-center rounded-lg p-1.5 transition-all hover-bg flex-shrink-0"
                      title="Delete"
                    >
                      <Trash2 size={13} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
                    </button>
                  </div>
                  {/* ASCII preview (truncated) */}
                  <div className="overflow-x-auto">
                    <pre
                      className="px-4 py-3 text-xs leading-relaxed"
                      style={{
                        fontFamily: 'JetBrains Mono, Fira Code, Menlo, Courier New, monospace',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'pre',
                        margin: 0,
                        maxHeight: 120,
                        overflow: 'hidden',
                      }}
                    >
                      {t.columns.length === 0 ? '(empty tab)' : generateAsciiTab(t)}
                    </pre>
                  </div>
                  {t.description && (
                    <p className="px-4 pb-3 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      {t.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showFolderManager && <ChordLibraryFolderManager onClose={() => setShowFolderManager(false)} />}
      {showBuilder && (
        <ProgressionBuilder
          progression={editingProgression}
          initialChords={refSelectedChords.length > 0 && !editingProgression ? refSelectedChords : undefined}
          onClose={() => { setShowBuilder(false); setEditingProgression(undefined); setRefSelectedChords([]) }}
        />
      )}
      {editingCustomChord && (
        <ChordDiagramEditor
          chordName={editingCustomChord}
          instrumentType={refInstrument === 'piano' ? 'piano' : refInstrument === 'bass' ? 'bass' : 'guitar'}
          onClose={() => setEditingCustomChord(null)}
        />
      )}
      {editingProgressionChord && (
        <ChordDiagramEditor
          chordName={editingProgressionChord}
          instrumentType={progInstrType}
          onClose={() => setEditingProgressionChord(null)}
        />
      )}
      {detailChord && (
        <ChordDetailModal
          chord={detailChord}
          instrument={refInstrument}
          customDiagram={customChords[detailChord]}
          customPianoDiagram={customPianoChords[detailChord]}
          dotColor={guitarDotColor}
          pianoColor={pianoHighlightColor}
          flipped={guitarFlipped}
          onClose={() => setDetailChord(null)}
          onEdit={() => { setEditingCustomChord(detailChord); setDetailChord(null) }}
          onBuildProgression={(chords) => {
            setRefSelectedChords(chords)
            setShowBuilder(true)
            setEditingProgression(undefined)
          }}
        />
      )}

      {/* Tab Editor modal */}
      {showTabEditor && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-auto"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => { setShowTabEditor(false); setEditingTab(undefined) }}
              className="flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{ color: 'var(--color-accent)', minWidth: 44, minHeight: 44 }}
            >
              <X size={20} strokeWidth={2} />
            </button>
            <h2 className="text-base font-semibold flex-1">
              {editingTab ? 'Edit Tab' : 'New Tab'}
            </h2>
          </div>
          <div className="flex-1 overflow-auto">
            <TabEditor
              initial={editingTab}
              folders={folders}
              onCancel={() => { setShowTabEditor(false); setEditingTab(undefined) }}
              onSave={(data) => {
                if (editingTab) {
                  updateTab(editingTab.id, data)
                } else {
                  addTab(data)
                }
                setShowTabEditor(false)
                setEditingTab(undefined)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
