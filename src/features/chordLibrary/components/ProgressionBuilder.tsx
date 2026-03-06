import { useState } from 'react'
import { X, Plus, GripVertical } from 'lucide-react'
import { useChordLibraryStore } from '../../../store/chordLibraryStore'
import type { ChordProgression } from '../../../store/chordLibraryStore'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const MINOR_NOTES = NOTES.map((n) => n + 'm')

// Simple Roman numeral analysis from root interval
function getRomanNumeral(chordName: string, keyRoot: string, isMinorKey: boolean): string {
  const normalize = (n: string) => n.replace('b', '#').replace('♭', '#')
  const enharmonic: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
  }
  const norm = (n: string) => enharmonic[n] ?? normalize(n)

  const notes12 = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const keyIdx = notes12.indexOf(norm(keyRoot))
  const chordRoot = chordName.match(/^([A-G][#b]?)/)?.[1] ?? chordName
  const chordIdx = notes12.indexOf(norm(chordRoot))

  if (keyIdx === -1 || chordIdx === -1) return ''

  const interval = (chordIdx - keyIdx + 12) % 12
  const majorIntervals: Record<number, string> = {
    0: 'I', 2: 'II', 4: 'III', 5: 'IV', 7: 'V', 9: 'VI', 11: 'VII',
  }
  const minorIntervals: Record<number, string> = {
    0: 'i', 2: 'ii°', 3: 'III', 5: 'iv', 7: 'v', 8: 'VI', 10: 'VII',
  }

  const map = isMinorKey ? minorIntervals : majorIntervals
  return map[interval] ?? ''
}

interface Props {
  progression?: ChordProgression
  onClose: () => void
}

export function ProgressionBuilder({ progression, onClose }: Props) {
  const { addProgression, updateProgression, folders } = useChordLibraryStore()

  const [name, setName] = useState(progression?.name ?? '')
  const [key, setKey] = useState(progression?.key ?? '')
  const [description, setDescription] = useState(progression?.description ?? '')
  const [folderId, setFolderId] = useState(progression?.folderId ?? '')
  const [chords, setChords] = useState<string[]>(progression?.chords ?? [])
  const [newChord, setNewChord] = useState('')

  const isMinorKey = key.endsWith('m') || key.toLowerCase().endsWith('min')
  const keyRoot = key.replace(/m(in)?$/, '').trim()

  const addChord = () => {
    const chord = newChord.trim()
    if (!chord) return
    setChords((prev) => [...prev, chord])
    setNewChord('')
  }

  const removeChord = (idx: number) => {
    setChords((prev) => prev.filter((_, i) => i !== idx))
  }

  const moveChord = (from: number, to: number) => {
    setChords((prev) => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  const handleSave = () => {
    if (!name.trim()) return
    const data = {
      name: name.trim(),
      key: key.trim() || undefined,
      description: description.trim() || undefined,
      chords,
      folderId: folderId || undefined,
    }
    if (progression) {
      updateProgression(progression.id, data)
    } else {
      addProgression(data)
    }
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#1c1c1e',
    border: '1px solid #2c2c2e',
    color: '#ffffff',
    borderRadius: 12,
    outline: 'none',
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    minHeight: 44,
  }

  const COMMON_CHORDS = ['C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm', 'A', 'Am', 'B', 'Bm',
    'C7', 'D7', 'E7', 'G7', 'A7', 'Cmaj7', 'Dmaj7', 'Emaj7', 'Gmaj7', 'Amaj7',
    'Dm7', 'Em7', 'Am7', 'Bm7', 'Csus2', 'Dsus2', 'Gsus2', 'Asus2',
    'Cadd9', 'Gadd9', 'Aadd9']

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#111111', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: '#2c2c2e' }}>
          <h2 className="flex-1 font-bold text-white text-lg">
            {progression ? 'Edit Progression' : 'New Progression'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ backgroundColor: '#2c2c2e' }}>
            <X size={18} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.6)' }} />
          </button>
        </div>

        <div className="overflow-auto flex-1 p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Sunday Chorus, Verse 1 progression…"
            />
          </div>

          {/* Key + Folder */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Key (optional)
              </label>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="" style={{ backgroundColor: '#1c1c1e' }}>— No key —</option>
                {NOTES.map((n) => <option key={n} value={n} style={{ backgroundColor: '#1c1c1e' }}>{n} major</option>)}
                {MINOR_NOTES.map((n) => <option key={n} value={n} style={{ backgroundColor: '#1c1c1e' }}>{n} minor</option>)}
              </select>
            </div>
            {folders.length > 0 && (
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Folder
                </label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="" style={{ backgroundColor: '#1c1c1e' }}>— None —</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id} style={{ backgroundColor: '#1c1c1e' }}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Notes (optional)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={inputStyle}
              placeholder="Used in the chorus, slow strum…"
            />
          </div>

          {/* Chord sequence display */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Chord Sequence
            </label>
            {chords.length === 0 ? (
              <p className="text-sm py-3 text-center rounded-xl" style={{ backgroundColor: '#1c1c1e', color: 'rgba(235,235,245,0.3)' }}>
                No chords yet. Add chords below.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 rounded-xl" style={{ backgroundColor: '#1c1c1e' }}>
                {chords.map((chord, idx) => {
                  const roman = key && keyRoot ? getRomanNumeral(chord, keyRoot, isMinorKey) : ''
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-0.5"
                    >
                      {roman && (
                        <span className="text-xs font-medium" style={{ color: '#bf5af2', fontSize: 9, letterSpacing: '0.04em' }}>
                          {roman}
                        </span>
                      )}
                      <div
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
                        style={{ backgroundColor: '#2c2c2e' }}
                      >
                        <button
                          onClick={() => idx > 0 && moveChord(idx, idx - 1)}
                          disabled={idx === 0}
                          className="opacity-30 hover:opacity-70 disabled:opacity-10"
                        >
                          <GripVertical size={12} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.6)' }} />
                        </button>
                        <span className="text-sm font-semibold text-white">{chord}</span>
                        <button onClick={() => removeChord(idx)} className="opacity-40 hover:opacity-80">
                          <X size={12} strokeWidth={2.5} style={{ color: '#ff453a' }} />
                        </button>
                      </div>
                      {idx < chords.length - 1 && (
                        <span style={{ color: 'rgba(235,235,245,0.2)', fontSize: 10 }}>→</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add chord input */}
          <div>
            <div className="flex gap-2">
              <input
                value={newChord}
                onChange={(e) => setNewChord(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChord() } }}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Type chord name (e.g. Am, F, C7…)"
              />
              <button
                onClick={addChord}
                disabled={!newChord.trim()}
                className="flex items-center justify-center rounded-xl transition-all active:scale-95"
                style={{
                  backgroundColor: newChord.trim() ? '#bf5af2' : '#1c1c1e',
                  color: newChord.trim() ? '#fff' : 'rgba(235,235,245,0.3)',
                  minWidth: 44, minHeight: 44,
                }}
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
            {/* Quick add chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_CHORDS.map((c) => (
                <button
                  key={c}
                  onClick={() => setChords((prev) => [...prev, c])}
                  className="px-2 py-1 rounded-lg text-xs font-medium transition-all active:scale-95"
                  style={{ backgroundColor: '#1c1c1e', color: 'rgba(235,235,245,0.6)', border: '1px solid #2c2c2e' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-5 py-4 border-t" style={{ borderColor: '#2c2c2e' }}>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ backgroundColor: '#bf5af2', minHeight: 44 }}
          >
            Save Progression
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.5)', minHeight: 44 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
