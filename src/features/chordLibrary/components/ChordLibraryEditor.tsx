import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { useChordLibraryStore } from '../../../store/chordLibraryStore'
import type { ChordLibraryEntry } from '../../../store/chordLibraryStore'
import { GuitarDiagram } from '../../songs/components/GuitarDiagram'
import { PianoDiagram } from '../../songs/components/PianoDiagram'
import { useSettingsStore } from '../../../store/settingsStore'

interface Props {
  entry?: ChordLibraryEntry
  onClose: () => void
}

export function ChordLibraryEditor({ entry, onClose }: Props) {
  const { t } = useTranslation()
  const { addEntry, updateEntry, folders } = useChordLibraryStore()
  const { guitarDotColor, guitarFlipped, pianoHighlightColor } = useSettingsStore()

  const [chordName, setChordName] = useState(entry?.chordName ?? '')
  const [instrument, setInstrument] = useState<'guitar' | 'piano'>(entry?.instrument ?? 'guitar')
  const [folderId, setFolderId] = useState(entry?.folderId ?? '')
  const [comment, setComment] = useState(entry?.comment ?? '')

  // Guitar fields
  const [frets, setFrets] = useState<string>(
    entry?.frets ? entry.frets.join(',') : '0,0,0,0,0,0'
  )
  const [fingers, setFingers] = useState<string>(
    entry?.fingers ? entry.fingers.join(',') : '0,0,0,0,0,0'
  )
  const [baseFret, setBaseFret] = useState(entry?.baseFret ?? 1)

  // Piano fields
  const [notes, setNotes] = useState<string>(
    entry?.notes ? entry.notes.join(',') : ''
  )

  const parseFrets = (): number[] => frets.split(',').map((s) => parseInt(s.trim()) || 0)
  const parseFingers = (): number[] => fingers.split(',').map((s) => parseInt(s.trim()) || 0)
  const parseNotes = (): string[] => notes.split(',').map((s) => s.trim()).filter(Boolean)

  const handleSave = () => {
    if (!chordName.trim()) return

    const data = {
      chordName: chordName.trim(),
      instrument,
      folderId: folderId || undefined,
      comment: comment.trim() || undefined,
      ...(instrument === 'guitar'
        ? { frets: parseFrets(), fingers: parseFingers(), baseFret, notes: undefined }
        : { notes: parseNotes(), frets: undefined, fingers: undefined, baseFret: undefined }),
    }

    if (entry) {
      updateEntry(entry.id, data)
    } else {
      addEntry(data)
    }
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#2c2c2e',
    minHeight: 44,
    border: 'none',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#1c1c1e' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0" style={{ borderColor: '#2c2c2e', backgroundColor: '#1c1c1e' }}>
          <h3 className="text-base font-semibold text-white">
            {entry ? t('editChordDiagram') : t('addChord')}
          </h3>
          <button onClick={onClose} className="p-1">
            <X size={18} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.5)' }} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Chord name */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'rgba(235,235,245,0.4)' }}>
              {t('chordName')}
            </label>
            <input
              value={chordName}
              onChange={(e) => setChordName(e.target.value)}
              className="w-full rounded-xl px-3 text-sm outline-none text-white"
              style={inputStyle}
              placeholder="Am, C, G7..."
            />
          </div>

          {/* Instrument toggle */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'rgba(235,235,245,0.4)' }}>
              {t('instrument')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['guitar', 'piano'] as const).map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstrument(inst)}
                  className="py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: instrument === inst ? '#bf5af2' : '#2c2c2e',
                    color: instrument === inst ? '#fff' : 'rgba(235,235,245,0.4)',
                  }}
                >
                  {t(inst === 'guitar' ? 'guitar' : 'piano')}
                </button>
              ))}
            </div>
          </div>

          {/* Folder */}
          {folders.length > 0 && (
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'rgba(235,235,245,0.4)' }}>
                {t('folder')}
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full rounded-xl px-3 text-sm outline-none text-white"
                style={{ ...inputStyle, backgroundColor: '#2c2c2e' }}
              >
                <option value="" style={{ backgroundColor: '#2c2c2e' }}>{t('noFolder')}</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id} style={{ backgroundColor: '#2c2c2e' }}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Guitar-specific fields */}
          {instrument === 'guitar' && (
            <>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(235,235,245,0.4)' }}>
                  {t('fretsLabel')}
                </label>
                <input
                  value={frets}
                  onChange={(e) => setFrets(e.target.value)}
                  className="w-full rounded-xl px-3 text-sm outline-none text-white"
                  style={inputStyle}
                  placeholder="-1,0,2,2,1,0"
                />
                <p className="text-xs mt-1" style={{ color: 'rgba(235,235,245,0.25)' }}>
                  {t('fretsHint')}
                </p>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(235,235,245,0.4)' }}>
                  {t('fingersLabel')}
                </label>
                <input
                  value={fingers}
                  onChange={(e) => setFingers(e.target.value)}
                  className="w-full rounded-xl px-3 text-sm outline-none text-white"
                  style={inputStyle}
                  placeholder="0,0,2,3,1,0"
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(235,235,245,0.4)' }}>
                  {t('baseFretLabel')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={baseFret}
                  onChange={(e) => setBaseFret(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl px-3 text-sm outline-none text-white"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {/* Piano-specific fields */}
          {instrument === 'piano' && (
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'rgba(235,235,245,0.4)' }}>
                {t('notesLabel')}
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl px-3 text-sm outline-none text-white"
                style={inputStyle}
                placeholder="C,E,G"
              />
              <p className="text-xs mt-1" style={{ color: 'rgba(235,235,245,0.25)' }}>
                {t('notesHint')}
              </p>
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'rgba(235,235,245,0.4)' }}>
              {t('comment')}
            </label>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl px-3 text-sm outline-none text-white"
              style={inputStyle}
              placeholder={t('comment')}
            />
          </div>

          {/* Live preview */}
          <div className="flex justify-center py-2">
            {chordName.trim() && (
              instrument === 'guitar' ? (
                <GuitarDiagram
                  chord={chordName.trim()}
                  customDiagram={{ frets: parseFrets(), fingers: parseFingers(), baseFret, comment: comment || undefined }}
                  size={140}
                  dotColor={guitarDotColor}
                  flipped={guitarFlipped}
                />
              ) : (
                <PianoDiagram
                  chord={chordName.trim()}
                  customDiagram={{ notes: parseNotes(), comment: comment || undefined }}
                  size={140}
                  highlightColor={pianoHighlightColor}
                />
              )
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!chordName.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{
              backgroundColor: chordName.trim() ? '#bf5af2' : '#2c2c2e',
              color: chordName.trim() ? '#fff' : 'rgba(235,235,245,0.3)',
              minHeight: 50,
            }}
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
