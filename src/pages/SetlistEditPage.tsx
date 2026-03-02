import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Plus, ChevronLeft } from 'lucide-react'
import { useSetlistStore } from '../store/setlistStore'
import { useSongStore } from '../store/songStore'
import { generateId } from '../shared/lib/storage'
import type { SetlistSong } from '../store/setlistStore'

interface SortableItemProps {
  ss: SetlistSong
  idx: number
  songTitle: string
  songKey?: string
  onRemove: (id: string) => void
}

function SortableItem({ ss, idx, songTitle, songKey, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ss.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: '#1c1c1e' }}
      className="flex items-center gap-3 p-3 rounded-xl"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        style={{ color: 'rgba(235,235,245,0.2)', minWidth: 32, minHeight: 44 }}
      >
        <GripVertical size={18} strokeWidth={1.5} />
      </button>
      <span className="text-xs font-semibold" style={{ color: 'rgba(235,235,245,0.25)', minWidth: 20 }}>
        {idx + 1}
      </span>
      <span className="flex-1 text-sm text-white">{songTitle}</span>
      {songKey && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: 'rgba(50,215,75,0.12)', color: '#32d74b' }}
        >
          {songKey}
        </span>
      )}
      <button
        onClick={() => onRemove(ss.id)}
        className="flex items-center justify-center rounded-xl transition-all active:scale-95"
        style={{ minWidth: 40, minHeight: 40 }}
        title="Удалить"
      >
        <X size={16} strokeWidth={2} style={{ color: '#ff453a' }} />
      </button>
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
  const [selectedSongs, setSelectedSongs] = useState<SetlistSong[]>(
    (existing?.songs ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)
  )

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const addSongToSetlist = (songId: string) => {
    if (selectedSongs.find((s) => s.song_id === songId)) return
    setSelectedSongs((prev) => [
      ...prev,
      {
        id: generateId(),
        song_id: songId,
        sort_order: prev.length,
        transpose_steps: 0,
        capo_fret: 0,
      },
    ])
  }

  const removeSong = (ssId: string) => {
    setSelectedSongs((prev) =>
      prev.filter((s) => s.id !== ssId).map((s, i) => ({ ...s, sort_order: i }))
    )
  }

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
        id: generateId(),
        title,
        service_date: date || undefined,
        notes: notes || undefined,
        songs: songsWithOrder,
        created_at: now,
        updated_at: now,
      })
    }
    navigate('/setlists')
  }

  const unusedSongs = songs.filter((s) => !selectedSongs.find((ss) => ss.song_id === s.id))

  const inputStyle = {
    backgroundColor: '#1c1c1e',
    border: '1px solid #2c2c2e',
    color: '#ffffff',
    minHeight: 44,
  } as const

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100%' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ backgroundColor: '#111111', borderColor: '#2c2c2e' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-xl transition-all"
          style={{ color: '#bf5af2', minWidth: 44, minHeight: 44 }}
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-base font-semibold text-white">
          {existing ? t('edit') : t('newSetlist')}
        </h1>
      </div>

      <div className="p-4 space-y-4 pb-24 max-w-2xl mx-auto">
        {/* Title */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(235,235,245,0.4)' }}>{t('title')}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl outline-none"
            style={inputStyle}
            placeholder="Воскресное богослужение"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(235,235,245,0.4)' }}>{t('date')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl outline-none"
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'rgba(235,235,245,0.4)' }}>{t('notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl outline-none resize-none"
            style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', color: '#ffffff' }}
          />
        </div>

        {/* Selected songs */}
        <div>
          <h3 className="text-xs mb-2" style={{ color: 'rgba(235,235,245,0.4)' }}>
            ПЕСНИ В СЛУЖЕНИИ ({selectedSongs.length})
          </h3>
          {selectedSongs.length === 0 ? (
            <p className="text-sm py-4 text-center rounded-xl" style={{ color: 'rgba(235,235,245,0.2)', backgroundColor: '#1c1c1e' }}>
              Добавьте песни из списка ниже
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedSongs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {selectedSongs.map((ss, i) => {
                    const song = songs.find((s) => s.id === ss.song_id)
                    if (!song) return null
                    return (
                      <SortableItem
                        key={ss.id}
                        ss={ss}
                        idx={i}
                        songTitle={song.title}
                        songKey={song.original_key}
                        onRemove={removeSong}
                      />
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Add songs */}
        {unusedSongs.length > 0 && (
          <div>
            <h3 className="text-xs mb-2" style={{ color: 'rgba(235,235,245,0.4)' }}>
              {t('addSong').toUpperCase()}
            </h3>
            <div className="space-y-1">
              {unusedSongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => addSongToSetlist(song.id)}
                  className="w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all active:scale-[0.99]"
                  style={{ backgroundColor: '#1c1c1e', minHeight: 44 }}
                >
                  <Plus size={16} strokeWidth={2} style={{ color: '#32d74b', flexShrink: 0 }} />
                  <span className="text-sm flex-1" style={{ color: '#ffffff' }}>{song.title}</span>
                  {song.original_key && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'rgba(50,215,75,0.12)', color: '#32d74b' }}
                    >
                      {song.original_key}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#bf5af2', minHeight: 44 }}
          >
            {t('save')}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.5)', minHeight: 44 }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
