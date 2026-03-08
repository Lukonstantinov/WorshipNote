import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Music2, ChevronDown, FolderOpen, Settings2, CheckSquare, Square, Trash2, FolderInput, X } from 'lucide-react'
import { useSongStore } from '../store/songStore'
import { useFolderStore } from '../store/folderStore'
import { useSettingsStore } from '../store/settingsStore'
import { FolderManager } from '../features/folders/FolderManager'
import type { Song } from '../features/songs/types'

type SortKey = 'az' | 'key' | 'bpm' | 'date'

export default function HomePage() {
  const { t } = useTranslation()
  const { songs, deleteSongs, moveSongsToFolder } = useSongStore()
  const { folders } = useFolderStore()
  const { tagColors } = useSettingsStore()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('az')
  const [showSort, setShowSort] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [showFolderManager, setShowFolderManager] = useState(false)

  // Bulk selection state
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showFolderPicker, setShowFolderPicker] = useState(false)

  const allTags = useMemo(() => {
    const s = new Set<string>()
    songs.forEach((song) => song.tags.forEach((tag) => s.add(tag)))
    return Array.from(s).sort()
  }, [songs])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = songs.filter((s) => {
      const matchesQuery =
        s.title.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (s.original_key?.toLowerCase().includes(q) ?? false)
      const matchesTag = activeTag ? s.tags.includes(activeTag) : true
      const matchesFolder = activeFolderId ? s.folderId === activeFolderId : true
      return matchesQuery && matchesTag && matchesFolder
    })
    result = [...result].sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title)
      if (sort === 'key') return (a.original_key ?? '').localeCompare(b.original_key ?? '')
      if (sort === 'bpm') return (a.bpm ?? 0) - (b.bpm ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return result
  }, [songs, query, sort, activeTag, activeFolderId])

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'az',   label: t('sortAZ') },
    { key: 'key',  label: t('sortKey') },
    { key: 'bpm',  label: t('sortBpm') },
    { key: 'date', label: t('sortDate') },
  ]

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(filtered.map((s) => s.id)))
  const deselectAll = () => setSelected(new Set())

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
    setShowFolderPicker(false)
  }

  const handleDeleteSelected = () => {
    if (selected.size === 0) return
    if (confirm(`Delete ${selected.size} psalm(s)? This cannot be undone.`)) {
      deleteSongs(Array.from(selected))
      exitSelectMode()
    }
  }

  const handleMoveToFolder = (folderId: string | undefined) => {
    if (selected.size === 0) return
    moveSongsToFolder(Array.from(selected), folderId)
    setShowFolderPicker(false)
    exitSelectMode()
  }

  return (
    <div className="p-4 pb-28 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold tracking-tight">{t('library')}</h2>
        <div className="flex items-center gap-2">
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
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          <Link
            to="/songs/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text-primary)', minHeight: 44 }}
          >
            <Plus size={16} strokeWidth={2.5} />
            {t('newSong')}
          </Link>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectMode && (
        <div
          className="flex items-center gap-2 mb-3 px-3 py-2 rounded-2xl flex-wrap"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        >
          <button
            onClick={selected.size === filtered.length ? deselectAll : selectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)' }}
          >
            {selected.size === filtered.length
              ? <Square size={12} strokeWidth={2} />
              : <CheckSquare size={12} strokeWidth={2} />
            }
            {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
          </button>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <button
                onClick={() => setShowFolderPicker((p) => !p)}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
                style={{ backgroundColor: '#0a84ff22', color: 'var(--color-info)' }}
              >
                <FolderInput size={13} strokeWidth={1.5} />
                Move to folder
              </button>
              {showFolderPicker && (
                <div
                  className="absolute right-0 top-10 rounded-xl shadow-xl z-30 overflow-hidden"
                  style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 180 }}
                >
                  <button
                    onClick={() => handleMoveToFolder(undefined)}
                    className="w-full text-left px-4 py-2.5 text-sm transition-all hover-bg"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    — No folder —
                  </button>
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleMoveToFolder(f.id)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-all hover-bg"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleDeleteSelected}
              disabled={selected.size === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
              style={{ backgroundColor: '#ff453a22', color: 'var(--color-error)' }}
            >
              <Trash2 size={13} strokeWidth={1.5} />
              Delete
            </button>
            <button onClick={exitSelectMode} className="p-1.5 rounded-xl" style={{ backgroundColor: 'var(--color-card-raised)' }}>
              <X size={13} strokeWidth={2} style={{ color: 'var(--color-text-tertiary)' }} />
            </button>
          </div>
        </div>
      )}

      {/* Search + Sort row */}
      <div className="flex gap-2 mb-3">
        <div
          className="flex-1 flex items-center gap-2 px-3 rounded-xl"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', minHeight: 44 }}
        >
          <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            placeholder={t('search') + '…'}
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSort((p) => !p)}
            className="flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              minHeight: 44,
              minWidth: 44,
            }}
          >
            <span className="hidden sm:inline">{SORT_OPTIONS.find((o) => o.key === sort)?.label}</span>
            <ChevronDown size={14} strokeWidth={2} />
          </button>
          {showSort && (
            <div
              className="absolute right-0 top-12 rounded-xl shadow-xl z-20 overflow-hidden"
              style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 140 }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setSort(opt.key); setShowSort(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all hover-bg"
                  style={{ color: sort === opt.key ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Folder chips */}
      {folders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2 scrollbar-none">
          <button
            onClick={() => setActiveFolderId(null)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: activeFolderId === null ? 'var(--color-accent)' : 'var(--color-card)',
              color: activeFolderId === null ? '#fff' : 'var(--color-text-tertiary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {t('allFolders')}
          </button>
          {folders.map((folder) => {
            const isActive = activeFolderId === folder.id
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolderId(isActive ? null : folder.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive ? `${folder.color}33` : 'var(--color-card)',
                  color: isActive ? folder.color : 'var(--color-text-tertiary)',
                  border: `1px solid ${isActive ? folder.color + '66' : 'var(--color-card-raised)'}`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </button>
            )
          })}
          <button
            onClick={() => setShowFolderManager(true)}
            className="flex-shrink-0 flex items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', minWidth: 28, minHeight: 28 }}
            title={t('folders')}
          >
            <Settings2 size={12} strokeWidth={2} style={{ color: 'var(--color-text-tertiary)' }} />
          </button>
        </div>
      )}

      {/* Folder manager button when no folders yet */}
      {folders.length === 0 && (
        <button
          onClick={() => setShowFolderManager(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs mb-2 transition-all"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}
        >
          <FolderOpen size={12} strokeWidth={1.5} />
          {t('addFolder')}
        </button>
      )}

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
          <button
            onClick={() => setActiveTag(null)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: activeTag === null ? 'var(--color-accent)' : 'var(--color-card-raised)',
              color: activeTag === null ? '#fff' : 'var(--color-text-tertiary)',
            }}
          >
            {t('allFolders').split(' ')[0]}
          </button>
          {allTags.map((tag) => {
            const customColor = tagColors[tag]
            const isActive = activeTag === tag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(isActive ? null : tag)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive
                    ? (customColor ?? 'var(--color-accent)')
                    : customColor
                      ? `${customColor}22`
                      : 'var(--color-card-raised)',
                  color: isActive
                    ? '#fff'
                    : customColor ?? 'var(--color-text-tertiary)',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}

      {/* Song list */}
      {filtered.length === 0 ? (
        <div className="text-center mt-20">
          <Music2 size={40} strokeWidth={1} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 15 }}>{t('noSongs')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              tagColors={tagColors}
              selectMode={selectMode}
              selected={selected.has(song.id)}
              onToggleSelect={() => toggleSelect(song.id)}
            />
          ))}
        </div>
      )}

      {/* Folder manager modal */}
      {showFolderManager && <FolderManager onClose={() => setShowFolderManager(false)} />}
    </div>
  )
}

function SongCard({
  song,
  tagColors,
  selectMode,
  selected,
  onToggleSelect,
}: {
  song: Song
  tagColors: Record<string, string>
  selectMode: boolean
  selected: boolean
  onToggleSelect: () => void
}) {
  const { t } = useTranslation()
  const { folders } = useFolderStore()
  const folder = song.folderId ? folders.find((f) => f.id === song.folderId) : undefined

  const content = (
    <div
      className="block p-4 rounded-2xl transition-all"
      style={{
        backgroundColor: selected ? 'var(--color-accent-dim)' : 'var(--color-card)',
        borderLeft: folder ? `3px solid ${folder.color}` : selected ? '3px solid var(--color-accent)' : undefined,
        border: selected ? '1px solid var(--color-accent)' : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        {selectMode && (
          <div className="flex-shrink-0 mr-1">
            {selected
              ? <CheckSquare size={18} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
              : <Square size={18} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
            }
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-snug truncate">{song.title}</h3>
          {folder && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
              <span className="text-xs" style={{ color: folder.color + 'cc' }}>{folder.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1.5 text-xs flex-shrink-0">
          {song.original_key && (
            <span
              className="px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: 'rgba(50,215,75,0.15)', color: 'var(--color-chord)' }}
            >
              {song.original_key}
            </span>
          )}
          {song.bpm && (
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-tertiary)' }}
            >
              {song.bpm} {t('bpm')}
            </span>
          )}
        </div>
      </div>
      {song.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {song.tags.map((tag) => {
            const color = tagColors[tag]
            return (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: color ? `${color}22` : 'var(--color-card-raised)',
                  color: color ?? 'var(--color-text-tertiary)',
                }}
              >
                {tag}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )

  if (selectMode) {
    return (
      <button className="w-full text-left active:scale-[0.99]" onClick={onToggleSelect}>
        {content}
      </button>
    )
  }

  return (
    <Link to={`/songs/${song.id}`} className="block active:scale-[0.99] hover:opacity-90">
      {content}
    </Link>
  )
}
