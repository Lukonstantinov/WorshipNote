import { useState } from 'react'
import { X, Plus, Pencil, Trash2, Check, FolderOpen } from 'lucide-react'
import { useFolderStore } from '../../store/folderStore'
import { useTranslation } from 'react-i18next'

const PRESET_COLORS = [
  'var(--color-error)', 'var(--color-warning)', '#ffd60a', 'var(--color-chord)',
  'var(--color-info)', 'var(--color-accent)', 'var(--color-info)', '#ebebf5',
]

interface Props {
  onClose: () => void
}

export function FolderManager({ onClose }: Props) {
  const { t } = useTranslation()
  const { folders, addFolder, updateFolder, deleteFolder } = useFolderStore()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    addFolder(trimmed, newColor)
    setNewName('')
    setNewColor(PRESET_COLORS[0])
  }

  const startEdit = (id: string, name: string, color: string) => {
    setEditingId(id)
    setEditName(name)
    setEditColor(color)
  }

  const saveEdit = () => {
    if (!editingId) return
    updateFolder(editingId, { name: editName.trim() || editName, color: editColor })
    setEditingId(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-t-3xl md:rounded-2xl p-4 pb-8 md:pb-4"
        style={{ backgroundColor: 'var(--color-card)', maxHeight: '80vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
            <h2 className="font-semibold">{t('folders')}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--color-card-raised)', minWidth: 36, minHeight: 36 }}
          >
            <X size={16} strokeWidth={2} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Existing folders */}
        <div className="space-y-2 mb-4">
          {folders.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
              {t('noFolder')}
            </p>
          )}
          {folders.map((folder) => (
            <div key={folder.id}>
              {editingId === folder.id ? (
                <div className="flex items-center gap-2 p-2 rounded-xl" style={{ backgroundColor: 'var(--color-card-raised)' }}>
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: editColor }}
                  />
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                  />
                  <div className="flex gap-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className="w-4 h-4 rounded-full transition-all"
                        style={{
                          backgroundColor: c,
                          outline: editColor === c ? `2px solid white` : 'none',
                          outlineOffset: 1,
                        }}
                      />
                    ))}
                  </div>
                  <button onClick={saveEdit}>
                    <Check size={16} strokeWidth={2.5} style={{ color: 'var(--color-chord)' }} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--color-card-raised)' }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: folder.color }} />
                  <span className="flex-1 text-sm">{folder.name}</span>
                  <button
                    onClick={() => startEdit(folder.id, folder.name, folder.color)}
                    className="p-1"
                  >
                    <Pencil size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />
                  </button>
                  <button
                    onClick={() => deleteFolder(folder.id)}
                    className="p-1"
                  >
                    <Trash2 size={14} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new folder */}
        <div className="border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('addFolder')}</p>
          <div className="flex gap-2 mb-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="flex-1 h-6 rounded-lg transition-all"
                style={{
                  backgroundColor: c,
                  outline: newColor === c ? `2px solid white` : 'none',
                  outlineOffset: 1,
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 text-sm rounded-xl px-3 outline-none"
              style={{ backgroundColor: 'var(--color-card-raised)', minHeight: 44 }}
              placeholder={t('folderName')}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                backgroundColor: newName.trim() ? 'var(--color-accent)' : 'var(--color-card-raised)',
                color: newName.trim() ? '#fff' : 'var(--color-text-muted)',
                minWidth: 44,
                minHeight: 44,
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
