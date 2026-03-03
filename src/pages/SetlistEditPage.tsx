import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Plus, ChevronLeft, User, Search } from 'lucide-react'
import { useSetlistStore } from '../store/setlistStore'
import { useSongStore } from '../store/songStore'
import { generateId } from '../shared/lib/storage'
import type { SetlistSong } from '../store/setlistStore'

const VOCAL_COLORS = [
  '#0a84ff', '#32d74b', '#ff9f0a', '#ff453a', '#bf5af2', '#64d2ff', '#ffd60a', '#ebebf5',
]

interface SortableItemProps {
  ss: SetlistSong
  idx: number
  songTitle: string
  songKey?: string
  onRemove: (id: string) => void
  onUpdateVocalist: (id: string, vocalist: string, vocalColor: string) => void
}

function SortableItem({ ss, idx, songTitle, songKey, onRemove, onUpdateVocalist }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ss.id })
  const [showVocalist, setShowVocalist] = useState(!!(ss.vocalist))
  const [vocalistName, setVocalistName] = useState(ss.vocalist ?? '')
  const [vocalistColor, setVocalistColor] = useState(ss.vocalColor ?? '#0a84ff')

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleVocalistChange = (name: string, color: string) => {
    setVocalistName(name)
    setVocalistColor(color)
    onUpdateVocalist(ss.id, name, color)
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl overflow-hidden" >
      <div className="flex items-center gap-3 p-3" style={{ backgroundColor: '#1c1c1e' }}>
        <button {...attributes} {...listeners} className="flex items-center justify-center cursor-grab active:cursor-grabbing touch-none" style={{ color: 'rgba(235,235,245,0.2)', minWidth: 32, minHeight: 44 }}>
          <GripVertical size={18} strokeWidth={1.5} />
        </button>
        <span className="text-xs font-semibold" style={{ color: 'rgba(235,235,245,0.25)', minWidth: 20 }}>{idx + 1}</span>
        <div className="flex-1 min-w-0">
          {ss.vocalist && (
            <span className="text-xs font-semibold mr-1" style={{ color: ss.vocalColor ?? '#0a84ff' }}>({ss.vocalist})</span>
          )}
          <span className="text-sm text-white">{songTitle}</span>
        </div>
        {songKey && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ backgroundColor: 'rgba(50,215,75,0.12)', color: '#32d74b' }}>
            {songKey}
          </span>
        )}
        <button
          onClick={() => setShowVocalist((v) => !v)}
          className="flex items-center justify-center rounded-xl transition-all"
          style={{ minWidth: 34, minHeight: 34, backgroundColor: showVocalist ? '#0a84ff22' : 'transparent', color: showVocalist ? '#0a84ff' : 'rgba(235,235,245,0.3)' }}
          title="Set vocalist"
        >
          <User size={14} strokeWidth={2} />
        </button>
        <button onClick={() => onRemove(ss.id)} className="flex items-center justify-center rounded-xl transition-all active:scale-95" style={{ minWidth: 40, minHeight: 40 }}>
          <X size={16} strokeWidth={2} style={{ color: '#ff453a' }} />
        </button>
      </div>
      {showVocalist && (
        <div className="px-3 pb-3 pt-1 space-y-2" style={{ backgroundColor: '#151515' }}>
          <input
            type="text"
            placeholder="Vocalist name..."
            value={vocalistName}
            onChange={(e) => handleVocalistChange(e.target.value, vocalistColor)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: '#2c2c2e', color: '#fff', border: 'none' }}
          />
          <div className="flex gap-2 flex-wrap">
            {VOCAL_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => handleVocalistChange(vocalistName, c)}
                className="rounded-full transition-all"
                style={{ width: 22, height: 22, backgroundColor: c, border: vocalistColor === c ? '2px solid #fff' : '2px solid transparent' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SetlistEditPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getSetlistById, addSetlist, updateSetlist } = useSetlistStore()
  const { songs } = useSongStore()

  const existing = id ? getSetlistById(id) : undefined

  const [title, setTitle] = useState(existing?.title ?? '')
  const [date, setDate] = useState(existing?.service_date ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [songSearch, setSongSearch] = useState('')
  const [selectedSongs, setSelectedSongs] = useState<SetlistSong[]>(
    (existing?.songs ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)
  )

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const addSongToSetlist = (songId: string) => {
    if (selectedSongs.find((s) => s.song_id === songId)) return
    setSelectedSongs((prev) => [
      ...prev,
      { id: generateId(), song_id: songId, sort_order: prev.length, transpose_steps: 0, capo_fret: 0 },
    ])
  }

  const removeSong = (ssId: string) =>
    setSelectedSongs((prev) => prev.filter((s) => s.id !== ssId).map((s, i) => ({ ...s, sort_order: i })))

  const updateVocalist = (ssId: string, vocalist: string, vocalColor: string) =>
    setSelectedSongs((prev) => prev.map((s) => s.id === ssId ? { ...s, vocalist: vocalist || undefined, vocalColor: vocalist ? vocalColor : undefined } : s))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSelectedSongs((prev) => {
      const oldIdx = prev.findIndex((s) => s.id === active.id)
      const newIdx = prev.findIndex((s) => s.id === over.id)
      return arrayMove(prev, oldIdx, newIdx).map((s, i) => ({ ...s, sort_order: i }))
    })
  }

  const handleSave = () => {
    const now = new Date().toISOString()
    const songsWithOrder = selectedSongs.map((s, i) => ({ ...s, sort_order: i }))
    if (existing) {
      updateSetlist(existing.id, { title, service_date: date, notes, songs: songsWithOrder })
    } else {
      addSetlist({
        id: generateId(), title, service_date: date || undefined, notes: notes || undefined,
        songs: songsWithOrder, created_at: now, updated_at: now,
      })
    }
    navigate('/setlists')
  }

  const unusedSongs = songs.filter((s) => !selectedSongs.find((ss) => ss.song_id === s.id))
  const filteredSongs = songSearch.trim()
    ? unusedSongs.filter((s) =>
        s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
        s.tags.some((tag) => tag.toLowerCase().includes(songSearch.toLowerCase()))
      )
    : unusedSongs

  const inputStyle = { backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', color: '#ffffff', minHeight: 44 } as const

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100%' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ backgroundColor: '#111111', borderColor: '#2c2c2e' }}>
        <button onClick={() => navigate(-1)} className="flex items-center justify-center rounded-xl transition-all" style={{ color: '#bf5af2', minWidth: 44, minHeight: 44 }}>
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-base font-semibold text-white">{existing ? t('edit') : t('newSetlist')}</h1>
      </div>

      <div className="p-4 space-y-4 pb-24 max-w-2xl mx-auto">
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(235,235,245,0.4)' }}>{t('title')}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Воскресное богослужение" />
        </div>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(235,235,245,0.4)' }}>{t('date')}</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 rounded-xl outline-none" style={{ ...inputStyle, colorScheme: 'dark' }} />
        </div>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(235,235,245,0.4)' }}>{t('notes')}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl outline-none resize-none" style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', color: '#ffffff' }} />
        </div>

        {/* Selected songs */}
        <div>
          <h3 className="text-xs mb-2" style={{ color: 'rgba(235,235,245,0.4)' }}>
            ПЕСНИ В СЛУЖЕНИИ ({selectedSongs.length})
          </h3>
          {selectedSongs.length === 0 ? (
            <p className="text-sm py-4 text-center rounded-xl" style={{ color: 'rgba(235,235,245,0.2)', backgroundColor: '#1c1c1e' }}>Добавьте песни из списка ниже</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedSongs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {selectedSongs.map((ss, i) => {
                    const song = songs.find((s) => s.id === ss.song_id)
                    if (!song) return null
                    return (
                      <SortableItem
                        key={ss.id} ss={ss} idx={i}
                        songTitle={song.title} songKey={song.original_key}
                        onRemove={removeSong} onUpdateVocalist={updateVocalist}
                      />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Add songs with search */}
        {unusedSongs.length > 0 && (
          <div>
            <h3 className="text-xs mb-2" style={{ color: 'rgba(235,235,245,0.4)' }}>{t('addSong').toUpperCase()}</h3>
            {/* Search bar */}
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(235,235,245,0.3)' }} />
              <input
                type="text" value={songSearch} onChange={(e) => setSongSearch(e.target.value)}
                placeholder={t('search') + '...'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', color: '#fff' }}
              />
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {filteredSongs.length === 0 ? (
                <p className="text-sm py-3 text-center" style={{ color: 'rgba(235,235,245,0.3)' }}>No matching songs</p>
              ) : (
                filteredSongs.map((song) => (
                  <button
                    key={song.id} onClick={() => addSongToSetlist(song.id)}
                    className="w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all active:scale-[0.99]"
                    style={{ backgroundColor: '#1c1c1e', minHeight: 44 }}
                  >
                    <Plus size={16} strokeWidth={2} style={{ color: '#32d74b', flexShrink: 0 }} />
                    <span className="text-sm flex-1" style={{ color: '#ffffff' }}>{song.title}</span>
                    {song.original_key && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(50,215,75,0.12)', color: '#32d74b' }}>
                        {song.original_key}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-semibold text-white transition-all active:scale-[0.98]" style={{ backgroundColor: '#bf5af2', minHeight: 44 }}>
            {t('save')}
          </button>
          <button onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]" style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.5)', minHeight: 44 }}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
