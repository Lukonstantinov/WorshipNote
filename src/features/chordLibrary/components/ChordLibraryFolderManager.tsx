import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Plus, Trash2, Pencil } from 'lucide-react'
import { useChordLibraryStore } from '../../../store/chordLibraryStore'

const FOLDER_COLORS = [
  'var(--color-error)', 'var(--color-warning)', '#ffd60a', 'var(--color-chord)',
  'var(--color-info)', 'var(--color-accent)', 'var(--color-info)', '#ac8e68',
]

interface Props {
  onClose: () => void
}

export function ChordLibraryFolderManager({ onClose }: Props) {
  const { t } = useTranslation()
  const { folders, addFolder, updateFolder, deleteFolder } = useChordLibraryStore()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(FOLDER_COLORS[4])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = () => {
    if (!newName.trim()) return
    addFolder(newName.trim(), newColor)
    setNewName('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-overlay)' }}>
      <div className="rounded-2xl w-full max-w-sm" style={{ backgroundColor: 'var(--color-card)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-base font-semibold">{t('folders')}</h3>
          <button onClick={onClose} className="p-1">
            <X size={18} strokeWidth={2} style={{ color: 'var(--color-text-tertiary)' }} />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--color-card-raised)' }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: folder.color }} />
              {editingId === folder.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => { if (editName.trim()) updateFolder(folder.id, { name: editName.trim() }); setEditingId(null) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { if (editName.trim()) updateFolder(folder.id, { name: editName.trim() }); setEditingId(null) } }}
                  className="flex-1 bg-transparent text-sm outline-none"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm">{folder.name}</span>
              )}
              <button onClick={() => { setEditingId(folder.id); setEditName(folder.name) }}>
                <Pencil size={13} style={{ color: 'var(--color-text-tertiary)' }} />
              </button>
              <button onClick={() => { if (confirm(t('confirmDelete'))) deleteFolder(folder.id) }}>
                <Trash2 size={13} style={{ color: 'var(--color-error)' }} />
              </button>
            </div>
          ))}
        </div>

        <div className="px-4 pb-4">
          <div className="flex gap-1.5 mb-2">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="rounded-full transition-all"
                style={{
                  width: 24, height: 24, backgroundColor: c,
                  outline: newColor === c ? '2px solid #fff' : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-xl px-3 text-sm outline-none"
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
                minWidth: 44, minHeight: 44,
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
