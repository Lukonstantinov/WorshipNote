import { useState, useMemo, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search, Plus, Music2, ArrowUpDown, FolderOpen, Settings2, CheckSquare, Square, Trash2,
  FolderInput, X, Sparkles, BookOpen, SearchX, Check,
} from 'lucide-react'
import { useSongStore } from '../store/songStore'
import { useFolderStore } from '../store/folderStore'
import { useSettingsStore } from '../store/settingsStore'
import { FolderManager } from '../features/folders/FolderManager'
import { PageHeader, sectionButtonStyle } from '../shared/components/PageHeader'
import { alpha, keyColor } from '../shared/lib/color'
import { useClickOutside } from '../shared/lib/useClickOutside'
import type { Song, Folder } from '../features/songs/types'

type SortKey = 'az' | 'key' | 'bpm' | 'date'

/** Lyrics without chords/cues, lower-cased, for searching. */
function lyricsText(content: string): string {
  return content.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').toLowerCase()
}

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

  const sortRef = useRef<HTMLDivElement>(null)
  const folderPickerRef = useRef<HTMLDivElement>(null)
  const closeSort = useCallback(() => setShowSort(false), [])
  const closeFolderPicker = useCallback(() => setShowFolderPicker(false), [])
  useClickOutside(sortRef, showSort, closeSort)
  useClickOutside(folderPickerRef, showFolderPicker, closeFolderPicker)

  const allTags = useMemo(() => {
    const s = new Set<string>()
    songs.forEach((song) => song.tags.forEach((tag) => s.add(tag)))
    return Array.from(s).sort()
  }, [songs])

  const lyricsIndex = useMemo(() => new Map(songs.map((s) => [s.id, lyricsText(s.content)])), [songs])

  const folderById = useMemo(() => new Map(folders.map((f) => [f.id, f])), [folders])

  const { filtered, lyricHits } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const lyricHits = new Set<string>()
    let result = songs.filter((s) => {
      if (activeTag && !s.tags.includes(activeTag)) return false
      if (activeFolderId && s.folderId !== activeFolderId) return false
      if (!q) return true
      const metaMatch =
        s.title.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (s.original_key?.toLowerCase() === q)
      if (metaMatch) return true
      if (lyricsIndex.get(s.id)?.includes(q)) {
        lyricHits.add(s.id)
        return true
      }
      return false
    })
    result = [...result].sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title)
      if (sort === 'key') return (a.original_key ?? '').localeCompare(b.original_key ?? '')
      if (sort === 'bpm') return (a.bpm ?? 0) - (b.bpm ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return { filtered: result, lyricHits }
  }, [songs, query, sort, activeTag, activeFolderId, lyricsIndex])

  const hasFilters = !!query || !!activeTag || !!activeFolderId
  const clearFilters = () => { setQuery(''); setActiveTag(null); setActiveFolderId(null) }

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

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id))
  const toggleSelectAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((s) => s.id)))

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
    setShowFolderPicker(false)
  }

  const handleDeleteSelected = () => {
    if (selected.size === 0) return
    if (confirm(t('confirmDeleteSongs', { count: selected.size }))) {
      deleteSongs(Array.from(selected))
      exitSelectMode()
    }
  }

  const handleMoveToFolder = (folderId: string | undefined) => {
    if (selected.size === 0) return
    moveSongsToFolder(Array.from(selected), folderId)
    exitSelectMode()
  }

  const chipStyle = (active: boolean, color?: string): React.CSSProperties => ({
    backgroundColor: active ? (color ?? 'var(--sec-library)') : color ? alpha(color, 14) : 'var(--color-card)',
    color: active ? '#fff' : (color ?? 'var(--color-text-secondary)'),
    border: `1px solid ${active ? 'transparent' : color ? alpha(color, 30) : 'var(--color-border-subtle)'}`,
    minHeight: 32,
  })

  return (
    <div className="p-4 pb-8 max-w-3xl mx-auto">
      <PageHeader
        title={t('library')}
        subtitle={t('librarySubtitle', { count: songs.length })}
        Icon={BookOpen}
        color="library"
        actions={
          <>
            <button
              onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
              className="btn-icon"
              style={selectMode ? { backgroundColor: 'var(--sec-library)', color: '#fff' } : undefined}
              title={selectMode ? t('cancel') : t('select')}
              aria-pressed={selectMode}
            >
              {selectMode ? <X size={18} strokeWidth={2} /> : <CheckSquare size={18} strokeWidth={1.75} />}
            </button>
            <Link to="/songs/new" className="btn-primary" style={sectionButtonStyle('library')} title={t('newSong')}>
              <Plus size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">{t('newSong')}</span>
            </Link>
          </>
        }
      />

      {/* Bulk action bar */}
      {selectMode && (
        <div
          className="flex items-center gap-2 mb-3 px-3 py-2 rounded-2xl flex-wrap"
          style={{ backgroundColor: alpha('var(--sec-library)', 10), border: `1px solid ${alpha('var(--sec-library)', 30)}` }}
        >
          <button
            onClick={toggleSelectAll}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-secondary)', minHeight: 36 }}
          >
            {allSelected ? <Square size={13} strokeWidth={2} /> : <CheckSquare size={13} strokeWidth={2} />}
            {allSelected ? t('deselectAll') : t('selectAll')}
          </button>
          <span className="text-xs font-semibold" style={{ color: 'var(--sec-library)' }}>
            {t('selectedCount', { count: selected.size })}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative" ref={folderPickerRef}>
              <button
                onClick={() => setShowFolderPicker((p) => !p)}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-info-dim)', color: 'var(--color-info)', minHeight: 36 }}
              >
                <FolderInput size={14} strokeWidth={1.75} />
                {t('moveToFolder')}
              </button>
              {showFolderPicker && (
                <div
                  className="absolute right-0 top-11 rounded-xl shadow-xl z-30 overflow-hidden py-1"
                  style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 190, border: '1px solid var(--color-border)' }}
                >
                  <button
                    onClick={() => handleMoveToFolder(undefined)}
                    className="w-full text-left px-4 py-2.5 text-sm transition-all hover-bg"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    — {t('noFolder')} —
                  </button>
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleMoveToFolder(f.id)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-all hover-bg"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
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
              style={{ backgroundColor: 'var(--color-error-dim)', color: 'var(--color-error)', minHeight: 36 }}
            >
              <Trash2 size={14} strokeWidth={1.75} />
              {t('delete')}
            </button>
          </div>
        </div>
      )}

      {/* Search + Sort row */}
      <div className="flex gap-2 mb-3">
        <label
          className="flex-1 flex items-center gap-2 px-3 rounded-2xl transition-all focus-within:shadow-lg"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', minHeight: 46 }}
        >
          <Search size={17} strokeWidth={2} style={{ color: 'var(--sec-library)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm"
            placeholder={t('searchSongsPlaceholder')}
            type="search"
            enterKeyHint="search"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-full" style={{ color: 'var(--color-text-tertiary)' }} aria-label={t('clearFilters')}>
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </label>
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setShowSort((p) => !p)}
            className="flex items-center gap-1.5 px-3 rounded-2xl text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              minHeight: 46,
              minWidth: 46,
            }}
            title={t('sortBy')}
            aria-expanded={showSort}
          >
            <ArrowUpDown size={16} strokeWidth={2} />
            <span className="hidden sm:inline">{SORT_OPTIONS.find((o) => o.key === sort)?.label}</span>
          </button>
          {showSort && (
            <div
              className="absolute right-0 top-12 rounded-xl shadow-xl z-20 overflow-hidden py-1"
              style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 150, border: '1px solid var(--color-border)' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setSort(opt.key); setShowSort(false) }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm transition-all hover-bg"
                  style={{ color: sort === opt.key ? 'var(--sec-library)' : 'var(--color-text-secondary)', fontWeight: sort === opt.key ? 600 : 400 }}
                >
                  <span className="flex-1">{opt.label}</span>
                  {sort === opt.key && <Check size={14} strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Folder chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2 scrollbar-none">
        {folders.length > 0 && (
          <button
            onClick={() => setActiveFolderId(null)}
            className="flex-shrink-0 flex items-center gap-1 px-3 rounded-full text-xs font-medium transition-all"
            style={chipStyle(activeFolderId === null)}
          >
            <FolderOpen size={13} strokeWidth={2} />
            {t('allFolders')}
          </button>
        )}
        {folders.map((folder) => {
          const isActive = activeFolderId === folder.id
          return (
            <button
              key={folder.id}
              onClick={() => setActiveFolderId(isActive ? null : folder.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 rounded-full text-xs font-medium transition-all"
              style={chipStyle(isActive, folder.color)}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: isActive ? '#fff' : folder.color }} />
              {folder.name}
            </button>
          )
        })}
        <button
          onClick={() => setShowFolderManager(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 rounded-full text-xs font-medium"
          style={{ border: '1px dashed var(--color-border)', color: 'var(--color-text-tertiary)', minHeight: 32 }}
          title={t('manageFolders')}
        >
          {folders.length === 0 ? <><FolderOpen size={13} strokeWidth={1.75} />{t('addFolder')}</> : <Settings2 size={13} strokeWidth={2} />}
        </button>
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
          {allTags.map((tag) => {
            const isActive = activeTag === tag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(isActive ? null : tag)}
                className="flex-shrink-0 px-3 rounded-full text-xs font-medium transition-all"
                style={chipStyle(isActive, tagColors[tag])}
              >
                #{tag}
              </button>
            )
          })}
        </div>
      )}

      {/* Song list */}
      {filtered.length === 0 ? (
        <div className="text-center mt-16 flex flex-col items-center gap-3">
          <span
            className="flex items-center justify-center rounded-3xl"
            style={{ width: 72, height: 72, background: alpha('var(--sec-library)', 14), color: 'var(--sec-library)' }}
          >
            {hasFilters ? <SearchX size={34} strokeWidth={1.5} /> : <Music2 size={34} strokeWidth={1.5} />}
          </span>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>{hasFilters ? t('noMatches') : t('noSongs')}</p>
          {hasFilters ? (
            <button onClick={clearFilters} className="btn-icon px-4 text-sm font-medium">{t('clearFilters')}</button>
          ) : (
            <Link to="/songs/new" className="btn-primary" style={sectionButtonStyle('library')}>
              <Plus size={18} strokeWidth={2.5} />
              {t('newSong')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              folder={song.folderId ? folderById.get(song.folderId) : undefined}
              tagColors={tagColors}
              selectMode={selectMode}
              selected={selected.has(song.id)}
              lyricHit={lyricHits.has(song.id)}
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
  folder,
  tagColors,
  selectMode,
  selected,
  lyricHit,
  onToggleSelect,
}: {
  song: Song
  folder?: Folder
  tagColors: Record<string, string>
  selectMode: boolean
  selected: boolean
  lyricHit: boolean
  onToggleSelect: () => void
}) {
  const { t } = useTranslation()
  const kc = keyColor(song.original_key)

  const content = (
    <div
      className="card-lift flex items-center gap-3 p-3 pr-4 rounded-2xl relative overflow-hidden"
      style={{
        backgroundColor: selected ? alpha('var(--sec-library)', 12) : 'var(--color-card)',
        border: `1px solid ${selected ? 'var(--sec-library)' : 'var(--color-border-subtle)'}`,
      }}
    >
      {folder && <span className="absolute left-0 top-0 bottom-0" style={{ width: 4, backgroundColor: folder.color }} />}

      {selectMode ? (
        <span className="flex items-center justify-center flex-shrink-0" style={{ width: 46, height: 46 }}>
          {selected
            ? <CheckSquare size={22} strokeWidth={2} style={{ color: 'var(--sec-library)' }} />
            : <Square size={22} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />}
        </span>
      ) : (
        /* Key badge — colour follows the circle of fifths */
        <span
          className="flex flex-col items-center justify-center flex-shrink-0 rounded-2xl font-bold"
          style={{
            width: 46,
            height: 46,
            background: song.original_key ? `linear-gradient(135deg, ${kc}, ${alpha(kc, 70)})` : 'var(--color-card-raised)',
            color: song.original_key ? '#fff' : 'var(--color-text-muted)',
            fontSize: (song.original_key?.length ?? 0) > 2 ? 13 : 16,
            boxShadow: song.original_key ? `0 3px 10px ${alpha(kc, 30)}` : undefined,
          }}
        >
          {song.original_key || <Music2 size={18} strokeWidth={1.75} />}
        </span>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="font-semibold text-[15px] leading-snug truncate">{song.title}</h3>
          {song.isPreset && (
            <span
              className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: 'var(--color-accent-dim)', color: 'var(--color-accent)' }}
            >
              <Sparkles size={9} strokeWidth={2} />
              {t('preset')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {song.bpm ? <span>♩ {song.bpm}</span> : null}
          {folder && (
            <span className="flex items-center gap-1" style={{ color: folder.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
              {folder.name}
            </span>
          )}
          {lyricHit && (
            <span className="px-1.5 rounded-full" style={{ backgroundColor: 'var(--color-info-dim)', color: 'var(--color-info)' }}>
              {t('lyricsMatch')}
            </span>
          )}
          {song.tags.map((tag) => {
            const color = tagColors[tag]
            return (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: color ? alpha(color, 14) : 'var(--color-card-raised)',
                  color: color ?? 'var(--color-text-tertiary)',
                }}
              >
                {tag}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )

  if (selectMode) {
    return (
      <button className="w-full text-left active:scale-[0.99] transition-transform" onClick={onToggleSelect} aria-pressed={selected}>
        {content}
      </button>
    )
  }

  return (
    <Link to={`/songs/${song.id}`} className="block active:scale-[0.99] transition-transform">
      {content}
    </Link>
  )
}
