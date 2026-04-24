import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Pause, Sparkles, BookmarkPlus, Minus, Plus, X } from 'lucide-react'
import { usePianoTrainerStore } from '../store/pianoTrainerStore'
import { useChordLibraryStore } from '../store/chordLibraryStore'
import { diatonicChords, suggestProgression } from '../features/pianoTrainer/lib/keyChords'
import { InfoBlock } from '../features/pianoTrainer/components/InfoBlock'
import { KeyPicker } from '../features/pianoTrainer/components/KeyPicker'
import { ChordChips, MAJOR_ROMANS, MINOR_ROMANS } from '../features/pianoTrainer/components/ChordChips'
import { ProgressionStrip } from '../features/pianoTrainer/components/ProgressionStrip'
import { LevelPicker } from '../features/pianoTrainer/components/LevelPicker'
import { BassPatternPicker } from '../features/pianoTrainer/components/BassPatternPicker'
import { PianoRoll } from '../features/pianoTrainer/components/PianoRoll'

export default function PianoTrainerPage() {
  const {
    key,
    progression,
    level,
    bassPatternId,
    tempo,
    suggestSeed,
    setKey,
    addChord,
    removeChordAt,
    moveChord,
    setProgression,
    clearProgression,
    setLevel,
    setBassPattern,
    setTempo,
    bumpSuggestSeed,
  } = usePianoTrainerStore()

  const { addProgression } = useChordLibraryStore()

  const [playing, setPlaying] = useState(false)
  const [playheadBeat, setPlayheadBeat] = useState(-1)
  const [manualFocus, setManualFocus] = useState(0)
  const [saveOpen, setSaveOpen] = useState(false)

  const chordsInKey = useMemo(() => diatonicChords(key), [key])
  const romans = key.mode === 'major' ? MAJOR_ROMANS : MINOR_ROMANS

  // Playhead animation
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  useEffect(() => {
    if (!playing || progression.length === 0) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      return
    }
    startRef.current = performance.now()
    const totalBeats = progression.length * 4
    const tick = (t: number) => {
      const elapsedSec = (t - startRef.current) / 1000
      const beats = (elapsedSec * tempo) / 60
      setPlayheadBeat(beats % totalBeats)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, tempo, progression.length])

  useEffect(() => {
    if (!playing) setPlayheadBeat(-1)
  }, [playing])

  const focusIndex = playing && playheadBeat >= 0
    ? Math.min(progression.length - 1, Math.floor(playheadBeat / 4))
    : manualFocus

  const handleSuggest = () => {
    const suggestion = suggestProgression(key, suggestSeed)
    setProgression(suggestion)
    bumpSuggestSeed()
    setManualFocus(0)
  }

  const handleTogglePlay = () => {
    if (progression.length === 0) return
    setPlaying((p) => !p)
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
    paddingLeft: 4,
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100%' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <Link
          to="/settings"
          className="p-2 rounded-xl"
          style={{ backgroundColor: 'var(--color-card-raised)', minHeight: 40, minWidth: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} strokeWidth={2} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <h1 className="flex-1 text-xl font-bold tracking-tight">Piano Trainer</h1>
        <button
          onClick={() => setSaveOpen(true)}
          disabled={progression.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-40"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#fff',
            minHeight: 40,
          }}
        >
          <BookmarkPlus size={14} strokeWidth={2} />
          Save
        </button>
      </div>

      <div className="p-4 space-y-5 pb-28 max-w-2xl mx-auto">

        {/* KEY */}
        <section className="space-y-2">
          <InfoBlock title="Key">
            The home note and scale of the song. Choosing a key tells the app which 7 notes (and which 7 chords) naturally fit together.
          </InfoBlock>
          <p style={sectionLabel}>Key</p>
          <KeyPicker value={key} onChange={(k) => { setKey(k); setManualFocus(0) }} />
        </section>

        {/* CHORDS IN KEY */}
        <section className="space-y-2">
          <InfoBlock title={`Chords in ${key.root} ${key.mode}`}>
            The seven chords built from the notes of this key. Tap any chord to add it to your progression. The small roman numeral shows its role ({key.mode === 'major' ? 'I–vii°' : 'i–VII'}).
          </InfoBlock>
          <div className="flex items-center justify-between">
            <p style={{ ...sectionLabel, marginBottom: 0 }}>Diatonic chords</p>
            <button
              onClick={handleSuggest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
              style={{
                backgroundColor: 'var(--color-accent-dim)',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-accent)',
              }}
            >
              <Sparkles size={12} strokeWidth={2} />
              Suggest progression
            </button>
          </div>
          <ChordChips chords={chordsInKey} romanNumerals={romans} onPick={addChord} />
        </section>

        {/* PROGRESSION */}
        <section className="space-y-2">
          <InfoBlock title="Progression">
            A sequence of chords played one after another — the backbone of almost every song. Reorder with the arrows, remove with ×.
          </InfoBlock>
          <p style={sectionLabel}>Progression</p>
          <ProgressionStrip
            chords={progression}
            focusedIndex={focusIndex}
            onFocus={(i) => { setManualFocus(i); setPlaying(false) }}
            onRemove={(i) => { removeChordAt(i); setPlaying(false) }}
            onMove={moveChord}
            onClear={() => { clearProgression(); setPlaying(false); setManualFocus(0) }}
          />

          {/* Tempo + play */}
          <div className="flex items-center gap-2 mt-3">
            <div
              className="flex items-center rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
            >
              <button
                onClick={() => setTempo(tempo - 5)}
                className="px-3 py-2"
                style={{ color: 'var(--color-text-secondary)', minHeight: 44 }}
                aria-label="Slower"
              >
                <Minus size={14} strokeWidth={2} />
              </button>
              <div className="px-3 text-center" style={{ minWidth: 74 }}>
                <div className="text-lg font-bold leading-tight">{tempo}</div>
                <div className="text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>BPM</div>
              </div>
              <button
                onClick={() => setTempo(tempo + 5)}
                className="px-3 py-2"
                style={{ color: 'var(--color-text-secondary)', minHeight: 44 }}
                aria-label="Faster"
              >
                <Plus size={14} strokeWidth={2} />
              </button>
            </div>
            <button
              onClick={handleTogglePlay}
              disabled={progression.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
              style={{
                backgroundColor: playing ? 'var(--color-error)' : 'var(--color-chord)',
                color: playing ? '#fff' : '#000',
                minHeight: 44,
              }}
            >
              {playing ? <Pause size={14} strokeWidth={2.5} /> : <Play size={14} strokeWidth={2.5} />}
              {playing ? 'Stop' : 'Play'}
            </button>
          </div>
        </section>

        {/* LEVEL */}
        <section className="space-y-2">
          <InfoBlock title="Level">
            How rich the piano part gets.{' '}
            <strong>L1</strong> plays the chord in root position.{' '}
            <strong>L2</strong> uses smooth inversions so your right hand barely moves.{' '}
            <strong>L3</strong> adds a single left-hand bass root.{' '}
            <strong>L4</strong> adds a rhythmic left-hand pattern on top.
          </InfoBlock>
          <p style={sectionLabel}>Level</p>
          <LevelPicker value={level} onChange={setLevel} />
        </section>

        {/* LH PATTERN (only L4) */}
        {level === 4 && (
          <section className="space-y-2">
            <InfoBlock title="Left-hand pattern">
              What the left hand plays under each chord. "Root only" is easiest; Alberti and Walking sound livelier.
            </InfoBlock>
            <p style={sectionLabel}>Left-hand pattern</p>
            <BassPatternPicker value={bassPatternId} onChange={setBassPattern} />
          </section>
        )}

        {/* PIANO ROLL */}
        <section className="space-y-2">
          <InfoBlock title="Piano roll">
            Every chord in your progression unfolded over time. Green blocks = right hand notes, blue blocks = left hand notes. The number inside each block is the finger you use (1 = thumb, 5 = pinky). Row labels on the left show which note each row is.
          </InfoBlock>
          <p style={sectionLabel}>Piano roll</p>
          <PianoRoll
            progression={progression}
            level={level}
            bassPatternId={bassPatternId}
            playheadBeat={playheadBeat}
            focusIndex={focusIndex}
          />
        </section>
      </div>

      {saveOpen && (
        <SaveToLibraryModal
          chords={progression}
          keyName={`${key.root} ${key.mode}`}
          onClose={() => setSaveOpen(false)}
          onSave={(name) => {
            addProgression({
              name,
              key: key.mode === 'minor' ? key.root + 'm' : key.root,
              chords: progression,
              instrumentType: 'piano',
            })
            setSaveOpen(false)
          }}
        />
      )}
    </div>
  )
}

function SaveToLibraryModal({
  chords,
  keyName,
  onClose,
  onSave,
}: {
  chords: string[]
  keyName: string
  onClose: () => void
  onSave: (name: string) => void
}) {
  const [name, setName] = useState('')
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-t-3xl md:rounded-3xl p-5 space-y-4"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="flex items-center">
          <h2 className="flex-1 text-lg font-bold">Save to Chord Library</h2>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-card-raised)' }}>
            <X size={16} strokeWidth={2} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Key: {keyName} · {chords.join(' → ')}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My piano progression"
            className="w-full rounded-xl px-3 text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              minHeight: 44,
              padding: '8px 12px',
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => name.trim() && onSave(name.trim())}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff', minHeight: 44 }}
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold transition-all"
            style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-tertiary)', minHeight: 44 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
