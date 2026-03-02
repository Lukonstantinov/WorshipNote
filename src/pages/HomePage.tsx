import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Music2, ChevronDown } from 'lucide-react'
import { useSongStore } from '../store/songStore'
import type { Song } from '../features/songs/types'

type SortKey = 'az' | 'key' | 'bpm' | 'date'

export default function HomePage() {
  const { t } = useTranslation()
  const { songs } = useSongStore()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('az')
  const [showSort, setShowSort] = useState(false)

  // Collect all unique tags for filtering
  const allTags = useMemo(() => {
    const s = new Set<string>()
    songs.forEach((song) => song.tags.forEach((tag) => s.add(tag)))
    return Array.from(s).sort()
  }, [songs])

  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = songs.filter((s) => {
      const matchesQuery =
        s.title.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (s.original_key?.toLowerCase().includes(q) ?? false)
      const matchesTag = activeTag ? s.tags.includes(activeTag) : true
      return matchesQuery && matchesTag
    })

    result = [...result].sort((a, b) => {
      if (sort === 'az') return a.title.localeCompare(b.title)
      if (sort === 'key') return (a.original_key ?? '').localeCompare(b.original_key ?? '')
      if (sort === 'bpm') return (a.bpm ?? 0) - (b.bpm ?? 0)
      // date: newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return result
  }, [songs, query, sort, activeTag])

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'az',   label: t('sortAZ') },
    { key: 'key',  label: t('sortKey') },
    { key: 'bpm',  label: t('sortBpm') },
    { key: 'date', label: t('sortDate') },
  ]

  return (
    <div className="p-4 pb-28 md:pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-white tracking-tight">{t('library')}</h2>
        <Link
          to="/songs/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
          style={{ backgroundColor: '#bf5af2', color: '#fff', minHeight: 44 }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {t('newSong')}
        </Link>
      </div>

      {/* Search + Sort row */}
      <div className="flex gap-2 mb-3">
        {/* Search */}
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

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSort((p) => !p)}
            className="flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: '#1c1c1e',
              border: '1px solid #2c2c2e',
              color: 'rgba(235,235,245,0.6)',
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
              style={{ backgroundColor: '#2c2c2e', minWidth: 140 }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setSort(opt.key); setShowSort(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-white/10"
                  style={{ color: sort === opt.key ? '#bf5af2' : 'rgba(235,235,245,0.8)' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
          <button
            onClick={() => setActiveTag(null)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: activeTag === null ? '#bf5af2' : '#2c2c2e',
              color: activeTag === null ? '#fff' : 'rgba(235,235,245,0.5)',
            }}
          >
            Все
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: activeTag === tag ? '#bf5af2' : '#2c2c2e',
                color: activeTag === tag ? '#fff' : 'rgba(235,235,245,0.5)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Song list */}
      {filtered.length === 0 ? (
        <div className="text-center mt-20">
          <Music2 size={40} strokeWidth={1} style={{ color: 'rgba(235,235,245,0.15)', margin: '0 auto 12px' }} />
          <p style={{ color: 'rgba(235,235,245,0.35)', fontSize: 15 }}>{t('noSongs')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  )
}

function SongCard({ song }: { song: Song }) {
  const { t } = useTranslation()
  return (
    <Link
      to={`/songs/${song.id}`}
      className="block p-4 rounded-2xl transition-all active:scale-[0.99] hover:opacity-90"
      style={{ backgroundColor: '#1c1c1e' }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-white text-base leading-snug">{song.title}</h3>
        <div className="flex gap-1.5 text-xs flex-shrink-0">
          {song.original_key && (
            <span
              className="px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: 'rgba(50,215,75,0.15)', color: '#32d74b' }}
            >
              {song.original_key}
            </span>
          )}
          {song.bpm && (
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.4)' }}
            >
              {song.bpm} {t('bpm')}
            </span>
          )}
        </div>
      </div>
      {song.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {song.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.35)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
