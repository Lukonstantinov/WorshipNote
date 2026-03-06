import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Upload, FileText, FileJson, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useSongStore } from '../../../store/songStore'
import { useFolderStore } from '../../../store/folderStore'
import { useSettingsStore } from '../../../store/settingsStore'
import {
  exportSongsAsJSON,
  exportAllSongsAsTXT,
  exportChordLibrary,
  parseSongImportJSON,
  parseChordLibraryJSON,
  downloadFile,
  readFileAsText,
} from '../lib/exportImport'
import { generateId } from '../../../shared/lib/storage'

const SONG_JSON_EXAMPLE = `{
  "version": "1.0",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "songs": [
    {
      "id": "unique-id",
      "title": "Amazing Grace",
      "original_key": "G",
      "bpm": 72,
      "content": "[G]Amazing [C]grace...",
      "tags": ["worship"],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "folders": [
    { "id": "folder-id", "name": "Sunday", "color": "#bf5af2" }
  ]
}`

const CHORD_JSON_EXAMPLE = `{
  "version": "1.0",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "customChords": {
    "G": {
      "frets": [3, 2, 0, 0, 0, 3],
      "fingers": [2, 1, 0, 0, 0, 3],
      "baseFret": 1
    }
  },
  "customPianoChords": {
    "C": { "notes": ["C", "E", "G"] }
  }
}`

function FormatGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-4 py-3 transition-all hover:bg-white/5"
      >
        <Info size={15} strokeWidth={1.5} style={{ color: '#0a84ff' }} />
        <span className="flex-1 text-left text-sm" style={{ color: 'rgba(235,235,245,0.7)' }}>
          File format guide
        </span>
        {open
          ? <ChevronUp size={14} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.3)' }} />
          : <ChevronDown size={14} strokeWidth={2} style={{ color: 'rgba(235,235,245,0.3)' }} />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid #2c2c2e' }}>
          <div className="pt-3">
            <p className="text-xs font-semibold mb-2" style={{ color: '#0a84ff' }}>Songs JSON file</p>
            <p className="text-xs mb-2" style={{ color: 'rgba(235,235,245,0.45)' }}>
              Use <strong style={{ color: 'rgba(235,235,245,0.7)' }}>Export Songs (JSON)</strong> to create a file this app can re-import.
              Required fields per song: <code style={{ color: '#32d74b' }}>id</code>, <code style={{ color: '#32d74b' }}>title</code>, <code style={{ color: '#32d74b' }}>content</code>.
            </p>
            <pre
              className="text-xs rounded-xl p-3 overflow-x-auto"
              style={{
                backgroundColor: '#000',
                color: '#32d74b',
                border: '1px solid #2c2c2e',
                fontFamily: 'monospace',
                fontSize: 10,
                lineHeight: 1.5,
              }}
            >
              {SONG_JSON_EXAMPLE}
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#bf5af2' }}>Chord Library JSON file</p>
            <p className="text-xs mb-2" style={{ color: 'rgba(235,235,245,0.45)' }}>
              Use <strong style={{ color: 'rgba(235,235,245,0.7)' }}>Export Chord Library</strong> to create a compatible file.
              Guitar frets: 6 numbers (-1 = muted, 0 = open, 1–24 = fret). Piano notes: pitch class names like "C", "E#", "Ab".
            </p>
            <pre
              className="text-xs rounded-xl p-3 overflow-x-auto"
              style={{
                backgroundColor: '#000',
                color: '#bf5af2',
                border: '1px solid #2c2c2e',
                fontFamily: 'monospace',
                fontSize: 10,
                lineHeight: 1.5,
              }}
            >
              {CHORD_JSON_EXAMPLE}
            </pre>
          </div>
          <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#ff9f0a18', border: '1px solid #ff9f0a33' }}>
            <p className="text-xs" style={{ color: '#ff9f0a' }}>
              <strong>Note:</strong> The app only imports .json files exported by WorshipNote. TXT exports are for sharing/printing only and cannot be re-imported.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function ExportImportPanel() {
  const { t } = useTranslation()
  const { songs, addSong } = useSongStore()
  const { folders, addFolder: _addFolder } = useFolderStore()
  const { customChords, customPianoChords, setCustomChord, setCustomPianoChord } = useSettingsStore()

  const songFileRef = useRef<HTMLInputElement>(null)
  const chordFileRef = useRef<HTMLInputElement>(null)
  const [importResult, setImportResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const clearResult = () => setTimeout(() => setImportResult(null), 4000)

  // ── Export handlers ──

  const handleExportJSON = () => {
    const json = exportSongsAsJSON(songs, folders)
    const date = new Date().toISOString().slice(0, 10)
    downloadFile(json, `worshiphub-songs-${date}.json`, 'application/json')
  }

  const handleExportTXT = (includeChords: boolean) => {
    const txt = exportAllSongsAsTXT(songs, includeChords)
    const date = new Date().toISOString().slice(0, 10)
    const suffix = includeChords ? 'with-chords' : 'lyrics-only'
    downloadFile(txt, `worshiphub-songs-${suffix}-${date}.txt`, 'text/plain')
  }

  const handleExportChords = () => {
    const json = exportChordLibrary(customChords, customPianoChords)
    const date = new Date().toISOString().slice(0, 10)
    downloadFile(json, `worshiphub-chords-${date}.json`, 'application/json')
  }

  // ── Import handlers ──

  const handleImportSongs = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await readFileAsText(file)
      const { songs: imported, folders: importedFolders } = parseSongImportJSON(text)

      // Build a map of old folder IDs to new folder IDs
      const existingFolderNames = new Set(folders.map((f) => f.name.toLowerCase()))
      const folderIdMap: Record<string, string> = {}

      for (const f of importedFolders) {
        if (!existingFolderNames.has(f.name.toLowerCase())) {
          const newFolder = _addFolder(f.name, f.color)
          folderIdMap[f.id] = newFolder.id
        } else {
          // Map to existing folder
          const existing = folders.find((ef) => ef.name.toLowerCase() === f.name.toLowerCase())
          if (existing) folderIdMap[f.id] = existing.id
        }
      }

      // Existing song titles for dedup
      const existingTitles = new Set(songs.map((s) => s.title.toLowerCase()))
      let addedCount = 0

      for (const song of imported) {
        if (existingTitles.has(song.title.toLowerCase())) continue
        const newSong = {
          ...song,
          id: generateId(),
          folderId: song.folderId ? folderIdMap[song.folderId] ?? song.folderId : undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        addSong(newSong)
        addedCount++
      }

      setImportResult({
        type: 'success',
        message: t('importSuccess', { count: addedCount, total: imported.length }),
      })
      clearResult()
    } catch (err) {
      setImportResult({
        type: 'error',
        message: err instanceof Error
          ? `Import failed: ${err.message}. Make sure you are using a .json file exported from WorshipNote.`
          : t('importError'),
      })
      clearResult()
    }
    // Reset input
    e.target.value = ''
  }

  const handleImportChords = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await readFileAsText(file)
      const { customChords: imported, customPianoChords: importedPiano } = parseChordLibraryJSON(text)

      let count = 0
      for (const [chord, diagram] of Object.entries(imported)) {
        setCustomChord(chord, diagram)
        count++
      }
      for (const [chord, diagram] of Object.entries(importedPiano)) {
        setCustomPianoChord(chord, diagram)
        count++
      }

      setImportResult({
        type: 'success',
        message: t('importChordsSuccess', { count }),
      })
      clearResult()
    } catch (err) {
      setImportResult({
        type: 'error',
        message: err instanceof Error
          ? `Import failed: ${err.message}. Make sure you are using a chord library .json file exported from WorshipNote.`
          : t('importError'),
      })
      clearResult()
    }
    e.target.value = ''
  }

  const chordCount = Object.keys(customChords).length + Object.keys(customPianoChords).length

  return (
    <section>
      <p style={{
        fontSize: 11,
        color: 'rgba(235,235,245,0.4)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 8,
        paddingLeft: 4,
      }}>
        {t('exportImport')}
      </p>

      {/* Export buttons */}
      <div className="rounded-2xl overflow-hidden mb-3" style={{ backgroundColor: '#1c1c1e' }}>
        <button
          onClick={handleExportJSON}
          disabled={songs.length === 0}
          className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5 disabled:opacity-30"
          style={{ minHeight: 50 }}
        >
          <FileJson size={18} strokeWidth={1.5} style={{ color: '#0a84ff' }} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">{t('exportJSON')}</div>
            <div className="text-xs" style={{ color: 'rgba(235,235,245,0.3)' }}>
              {songs.length} songs · reimportable JSON
            </div>
          </div>
          <Download size={16} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.3)' }} />
        </button>

        <button
          onClick={() => handleExportTXT(true)}
          disabled={songs.length === 0}
          className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5 disabled:opacity-30"
          style={{ borderTop: '1px solid #2c2c2e', minHeight: 50 }}
        >
          <FileText size={18} strokeWidth={1.5} style={{ color: '#32d74b' }} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">{t('exportTXTChords')}</div>
            <div className="text-xs" style={{ color: 'rgba(235,235,245,0.3)' }}>
              Plain text with chords · for printing/sharing
            </div>
          </div>
          <Download size={16} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.3)' }} />
        </button>

        <button
          onClick={() => handleExportTXT(false)}
          disabled={songs.length === 0}
          className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5 disabled:opacity-30"
          style={{ borderTop: '1px solid #2c2c2e', minHeight: 50 }}
        >
          <FileText size={18} strokeWidth={1.5} style={{ color: '#ff9f0a' }} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">{t('exportTXTLyrics')}</div>
            <div className="text-xs" style={{ color: 'rgba(235,235,245,0.3)' }}>
              Lyrics only · no chords
            </div>
          </div>
          <Download size={16} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.3)' }} />
        </button>

        <button
          onClick={handleExportChords}
          disabled={chordCount === 0}
          className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5 disabled:opacity-30"
          style={{ borderTop: '1px solid #2c2c2e', minHeight: 50 }}
        >
          <FileJson size={18} strokeWidth={1.5} style={{ color: '#bf5af2' }} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">{t('exportChordLibrary')}</div>
            <div className="text-xs" style={{ color: 'rgba(235,235,245,0.3)' }}>
              {chordCount} custom chords · reimportable JSON
            </div>
          </div>
          <Download size={16} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.3)' }} />
        </button>
      </div>

      {/* Import buttons */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
        <button
          onClick={() => songFileRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5"
          style={{ minHeight: 50 }}
        >
          <Upload size={18} strokeWidth={1.5} style={{ color: '#0a84ff' }} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">{t('importSongs')}</div>
            <div className="text-xs" style={{ color: 'rgba(235,235,245,0.3)' }}>
              Accepts .json exported by this app
            </div>
          </div>
        </button>

        <button
          onClick={() => chordFileRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5"
          style={{ borderTop: '1px solid #2c2c2e', minHeight: 50 }}
        >
          <Upload size={18} strokeWidth={1.5} style={{ color: '#bf5af2' }} />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">{t('importChordLibrary')}</div>
            <div className="text-xs" style={{ color: 'rgba(235,235,245,0.3)' }}>
              Accepts .json exported by this app
            </div>
          </div>
        </button>
      </div>

      {/* Format Guide */}
      <FormatGuide />

      {/* Hidden file inputs */}
      <input ref={songFileRef} type="file" accept=".json" onChange={handleImportSongs} className="hidden" />
      <input ref={chordFileRef} type="file" accept=".json" onChange={handleImportChords} className="hidden" />

      {/* Import result toast */}
      {importResult && (
        <div
          className="flex items-start gap-2 mt-3 px-4 py-3 rounded-2xl text-sm"
          style={{
            backgroundColor: importResult.type === 'success' ? '#32d74b22' : '#ff453a22',
            color: importResult.type === 'success' ? '#32d74b' : '#ff453a',
          }}
        >
          {importResult.type === 'error' && <AlertCircle size={16} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />}
          {importResult.message}
        </div>
      )}
    </section>
  )
}
