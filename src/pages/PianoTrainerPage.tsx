import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Pause, Sparkles, BookmarkPlus, Minus, Plus, X, Piano } from 'lucide-react'
import { usePianoTrainerStore } from '../store/pianoTrainerStore'
import { useChordLibraryStore } from '../store/chordLibraryStore'
import { diatonicChords, suggestProgression } from '../features/pianoTrainer/lib/keyChords'
import { InfoBlock } from '../features/pianoTrainer/components/InfoBlock'
import { KeyPicker } from '../features/pianoTrainer/components/KeyPicker'
import { ChordChips, MAJOR_ROMANS, MINOR_ROMANS } from '../features/pianoTrainer/components/ChordChips'
import { ProgressionStrip } from '../features/pianoTrainer/components/ProgressionStrip'
import { LevelPicker } from '../features/pianoTrainer/components/LevelPicker'
import { BassPatternPicker } from '../features/pianoTrainer/components/BassPatternPicker'
import { PianoChordStrip } from '../features/pianoTrainer/components/PianoChordStrip'
import { useMetronome } from '../features/pianoTrainer/lib/useMetronome'

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

  /** Roman numeral for each progression chord based on its position in the current key. */
  const progressionRomans = useMemo(
    () => progression.map((c) => {
      const idx = chordsInKey.indexOf(c)
      return idx >= 0 ? romans[idx] : ''
    }),
    [progression, chordsInKey, romans]
  )

  // Audio context is created on the first Play click (user gesture, required by mobile Safari).
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null)

  // Audible metronome (Web Audio click on every beat, accent on beat 1).
  useMetronome({ audioCtx, playing, bpm: tempo })

  // Visual playhead — incremental so BPM changes mid-flight don't jump the head.
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)
  const beatsAccumRef = useRef<number>(0)
  const tempoRef = useRef(tempo)
  useEffect(() => { tempoRef.current = tempo }, [tempo])

  useEffect(() => {
    if (!playing || progression.length === 0) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      return
    }
    lastTickRef.current = performance.now()
    beatsAccumRef.current = 0
    const totalBeats = progression.length * 4
    const tick = (t: number) => {
      const dt = (t - lastTickRef.current) / 1000
      lastTickRef.current = t
      beatsAccumRef.current += dt * (tempoRef.current / 60)
      setPlayheadBeat(beatsAccumRef.current % totalBeats)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, progression.length])

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
    // Create/resume AudioContext synchronously on the click — mobile Safari
    // refuses to start audio outside a user gesture.
    if (!audioCtxRef.current) {
      try {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new Ctor()
        setAudioCtx(audioCtxRef.current)
      } catch {
        // Audio not available — visual playback still works.
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    setPlaying((p) => !p)
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100%' }}>
      {/* Hero header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent-dim) 0%, transparent 70%)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            to="/settings"
            className="rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--color-card-raised)',
              border: '1px solid var(--color-border)',
              minHeight: 40, minWidth: 40,
            }}
            aria-label="Back to settings"
          >
            <ArrowLeft size={18} strokeWidth={2} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>

          <div
            className="rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, rgba(191,90,242,0.7) 100%)',
              width: 44, height: 44,
              boxShadow: '0 4px 12px var(--color-accent-dim)',
            }}
          >
            <Piano size={22} strokeWidth={1.8} style={{ color: '#fff' }} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight leading-tight">Piano Trainer</h1>
            <p className="text-xs leading-tight" style={{ color: 'var(--color-text-tertiary)' }}>
              Build a progression · see it on a piano roll
            </p>
          </div>

          <button
            onClick={() => setSaveOpen(true)}
            disabled={progression.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, rgba(191,90,242,0.85) 100%)',
              color: '#fff',
              boxShadow: '0 2px 8px var(--color-accent-dim)',
              minHeight: 40,
            }}
          >
            <BookmarkPlus size={14} strokeWidth={2} />
            Save
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 pb-28 max-w-2xl mx-auto">

        {/* KEY */}
        <section className="space-y-3">
          <InfoBlock title="Key">
            The home note and scale of the song. Choosing a key tells the app which 7 notes (and which 7 chords) naturally fit together.
          </InfoBlock>
          <KeyPicker value={key} onChange={(k) => { setKey(k); setManualFocus(0) }} />
        </section>

        {/* CHORDS IN KEY */}
        <section className="space-y-3">
          <InfoBlock title={`Chords in ${key.root} ${key.mode}`}>
            The seven chords built from the notes of this key. Tap any chord to add it to your progression. The small roman numeral shows its role ({key.mode === 'major' ? 'I–vii°' : 'i–VII'}).
          </InfoBlock>
          <div className="flex items-center justify-end">
            <button
              onClick={handleSuggest}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, rgba(191,90,242,0.7) 100%)',
                color: '#fff',
                boxShadow: '0 2px 8px var(--color-accent-dim)',
                minHeight: 36,
              }}
            >
              <Sparkles size={12} strokeWidth={2.5} />
              Suggest progression
            </button>
          </div>
          <ChordChips chords={chordsInKey} romanNumerals={romans} onPick={addChord} />
        </section>

        {/* PROGRESSION */}
        <section className="space-y-3">
          <InfoBlock title="Progression">
            A sequence of chords played one after another — the backbone of almost every song. Reorder with the arrows, remove with ×, tap a chord to highlight it on the piano roll below.
          </InfoBlock>
          <ProgressionStrip
            chords={progression}
            focusedIndex={focusIndex}
            onFocus={(i) => { setManualFocus(i); setPlaying(false) }}
            onRemove={(i) => { removeChordAt(i); setPlaying(false) }}
            onMove={moveChord}
            onClear={() => { clearProgression(); setPlaying(false); setManualFocus(0) }}
          />

          {/* Tempo + play */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center rounded-2xl overflow-hidden flex-1"
              style={{
                background: 'linear-gradient(135deg, var(--color-card) 0%, var(--color-card-raised) 100%)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 2px var(--color-shadow)',
              }}
            >
              <button
                onClick={() => setTempo(tempo - 5)}
                className="px-3 py-2 transition-all active:scale-95"
                style={{ color: 'var(--color-text-secondary)', minHeight: 48 }}
                aria-label="Slower"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <div className="flex-1 text-center">
                <div className="font-extrabold leading-none tabular-nums" style={{ fontSize: 22 }}>
                  {tempo}
                </div>
                <div
                  className="uppercase tracking-widest"
                  style={{ fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.12em', marginTop: 2 }}
                >
                  BPM
                </div>
              </div>
              <button
                onClick={() => setTempo(tempo + 5)}
                className="px-3 py-2 transition-all active:scale-95"
                style={{ color: 'var(--color-text-secondary)', minHeight: 48 }}
                aria-label="Faster"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
            <button
              onClick={handleTogglePlay}
              disabled={progression.length === 0}
              className="flex items-center justify-center gap-1.5 rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: playing
                  ? 'linear-gradient(135deg, var(--color-error) 0%, rgba(255,69,58,0.7) 100%)'
                  : 'linear-gradient(135deg, var(--color-chord) 0%, rgba(50,215,75,0.75) 100%)',
                color: playing ? '#fff' : '#000',
                boxShadow: playing
                  ? '0 4px 12px rgba(255,69,58,0.3)'
                  : '0 4px 12px rgba(50,215,75,0.3)',
                minHeight: 48,
                minWidth: 98,
              }}
            >
              {playing ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} />}
              {playing ? 'Stop' : 'Play'}
            </button>
          </div>
        </section>

        {/* LEVEL */}
        <section className="space-y-3">
          <InfoBlock title="Level">
            How rich the piano part gets.{' '}
            <strong>L1</strong> plays the chord in root position.{' '}
            <strong>L2</strong> uses smooth inversions so your right hand barely moves.{' '}
            <strong>L3</strong> adds a single left-hand bass root.{' '}
            <strong>L4</strong> adds a rhythmic left-hand pattern on top.
          </InfoBlock>
          <LevelPicker value={level} onChange={setLevel} />
        </section>

        {/* LH PATTERN (only L4) */}
        {level === 4 && (
          <section className="space-y-3">
            <InfoBlock title="Left-hand pattern">
              What the left hand plays under each chord. "Root only" is easiest; Alberti and Walking sound livelier.
            </InfoBlock>
            <BassPatternPicker value={bassPatternId} onChange={setBassPattern} />
          </section>
        )}

        {/* PIANO CHORDS */}
        <section className="space-y-3">
          <InfoBlock title="Piano chords">
            Each chord in your progression shown as a little piano icon with the keys highlighted. Tap one to focus it — it glows when the metronome is on that chord.
          </InfoBlock>
          <PianoChordStrip
            chords={progression}
            romanNumerals={progressionRomans}
            focusedIndex={focusIndex}
            onFocus={(i) => { setManualFocus(i); setPlaying(false) }}
            level={level}
            bassPatternId={bassPatternId}
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
            className="w-full rounded-xl text-sm outline-none"
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
