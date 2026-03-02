import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Plus, Trash2, Guitar, Piano, Music2, Drum } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useSongStore } from '../store/songStore'
import type { Language, ChordDisplayPosition } from '../store/settingsStore'
import type { Instrument } from '../features/songs/types'
import { FONT_SIZE_MIN, FONT_SIZE_MAX } from '../shared/lib/constants'
import { generateId } from '../shared/lib/storage'

const LANGUAGES: { code: Language; label: string; sub: string }[] = [
  { code: 'ru', label: 'Русский',  sub: 'Russian' },
  { code: 'lt', label: 'Lietuvių', sub: 'Lithuanian' },
  { code: 'en', label: 'English',  sub: 'English' },
]

const TAG_COLORS = [
  '#ff453a', '#ff9f0a', '#ffd60a', '#30d158',
  '#0a84ff', '#bf5af2', '#64d2ff', '#ebebf5',
]

const INSTRUMENT_ICONS: Record<Instrument['type'], React.ReactNode> = {
  guitar:   <Guitar size={16} strokeWidth={1.5} />,
  piano:    <Piano size={16} strokeWidth={1.5} />,
  keyboard: <Piano size={16} strokeWidth={1.5} />,
  bass:     <Guitar size={16} strokeWidth={1.5} />,
  ukulele:  <Music2 size={16} strokeWidth={1.5} />,
  drums:    <Drum size={16} strokeWidth={1.5} />,
  other:    <Music2 size={16} strokeWidth={1.5} />,
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const {
    language, fontSize, scrollSpeed, setLanguage, setFontSize, setScrollSpeed,
    instruments, setInstruments,
    chordDisplayPosition, setChordDisplayPosition,
    tagColors, setTagColor,
  } = useSettingsStore()
  const { songs } = useSongStore()

  const [newInstrName, setNewInstrName] = useState('')
  const [newInstrType, setNewInstrType] = useState<Instrument['type']>('guitar')

  const handleLanguage = (lang: Language) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  const addInstrument = () => {
    if (!newInstrName.trim()) return
    const instr: Instrument = { id: generateId(), name: newInstrName.trim(), type: newInstrType }
    setInstruments([...instruments, instr])
    setNewInstrName('')
  }

  const deleteInstrument = (id: string) => {
    setInstruments(instruments.filter((i) => i.id !== id))
  }

  const allTags = [...new Set(songs.flatMap((s) => s.tags))].sort()

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    color: 'rgba(235,235,245,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 8,
    paddingLeft: 4,
  }

  const CHORD_POSITIONS: { key: ChordDisplayPosition; label: string }[] = [
    { key: 'side', label: t('diagramSide') },
    { key: 'top',  label: t('diagramTop') },
    { key: 'none', label: t('diagramOff') },
  ]

  const INSTR_TYPES: Instrument['type'][] = ['guitar', 'piano', 'keyboard', 'bass', 'ukulele', 'drums', 'other']

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100%' }}>
      <div className="px-4 py-4 border-b" style={{ borderColor: '#1c1c1e' }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">{t('settings')}</h1>
      </div>

      <div className="p-4 space-y-8 pb-28 max-w-md mx-auto">

        {/* Language */}
        <section>
          <p style={sectionLabel}>{t('language')}</p>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
            {LANGUAGES.map(({ code, label, sub }, idx) => (
              <button
                key={code}
                onClick={() => handleLanguage(code)}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5"
                style={{ borderTop: idx > 0 ? '1px solid #2c2c2e' : undefined, minHeight: 50 }}
              >
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs" style={{ color: 'rgba(235,235,245,0.3)' }}>{sub}</div>
                </div>
                {language === code && <Check size={18} strokeWidth={2.5} style={{ color: '#bf5af2' }} />}
              </button>
            ))}
          </div>
        </section>

        {/* Font size */}
        <section>
          <p style={sectionLabel}>{t('fontSize')}</p>
          <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#1c1c1e' }}>
            <button
              onClick={() => setFontSize(Math.max(FONT_SIZE_MIN, fontSize - 2))}
              className="flex items-center justify-center w-12 h-12 rounded-xl font-semibold transition-all active:scale-95"
              style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.7)', fontSize: 13 }}
            >A−</button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold text-white">{fontSize}</span>
              <span className="text-sm ml-1" style={{ color: 'rgba(235,235,245,0.3)' }}>px</span>
            </div>
            <button
              onClick={() => setFontSize(Math.min(FONT_SIZE_MAX, fontSize + 2))}
              className="flex items-center justify-center w-12 h-12 rounded-xl font-semibold transition-all active:scale-95"
              style={{ backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.7)', fontSize: 19 }}
            >A+</button>
          </div>
        </section>

        {/* Scroll speed */}
        <section>
          <p style={sectionLabel}>{t('scrollSpeed')}</p>
          <div className="grid grid-cols-4 gap-2">
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setScrollSpeed(speed)}
                className="py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                style={{
                  backgroundColor: scrollSpeed === speed ? '#bf5af2' : '#1c1c1e',
                  color: scrollSpeed === speed ? '#fff' : 'rgba(235,235,245,0.4)',
                  minHeight: 50,
                }}
              >
                {speed}×
              </button>
            ))}
          </div>
        </section>

        {/* Instruments */}
        <section>
          <p style={sectionLabel}>{t('instruments')}</p>
          <div className="rounded-2xl overflow-hidden mb-2" style={{ backgroundColor: '#1c1c1e' }}>
            {instruments.length === 0 && (
              <p className="px-4 py-3 text-sm" style={{ color: 'rgba(235,235,245,0.3)' }}>
                {t('noInstruments')}
              </p>
            )}
            {instruments.map((instr, idx) => (
              <div
                key={instr.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: idx > 0 ? '1px solid #2c2c2e' : undefined }}
              >
                <span style={{ color: 'rgba(235,235,245,0.5)' }}>{INSTRUMENT_ICONS[instr.type]}</span>
                <div className="flex-1">
                  <span className="text-sm text-white">{instr.name}</span>
                  <span className="text-xs ml-2" style={{ color: 'rgba(235,235,245,0.3)' }}>{instr.type}</span>
                </div>
                <button onClick={() => deleteInstrument(instr.id)}>
                  <Trash2 size={15} strokeWidth={1.5} style={{ color: '#ff453a' }} />
                </button>
              </div>
            ))}
          </div>
          {/* Add instrument */}
          <div className="flex gap-2">
            <select
              value={newInstrType}
              onChange={(e) => setNewInstrType(e.target.value as Instrument['type'])}
              className="rounded-xl px-2 text-xs outline-none"
              style={{ backgroundColor: '#1c1c1e', color: 'rgba(235,235,245,0.7)', border: '1px solid #2c2c2e', minHeight: 44 }}
            >
              {INSTR_TYPES.map((type) => (
                <option key={type} value={type} style={{ backgroundColor: '#1c1c1e' }}>{type}</option>
              ))}
            </select>
            <input
              value={newInstrName}
              onChange={(e) => setNewInstrName(e.target.value)}
              className="flex-1 rounded-xl px-3 text-sm outline-none text-white"
              style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', minHeight: 44 }}
              placeholder={t('instrumentName')}
              onKeyDown={(e) => { if (e.key === 'Enter') addInstrument() }}
            />
            <button
              onClick={addInstrument}
              disabled={!newInstrName.trim()}
              className="flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                backgroundColor: newInstrName.trim() ? '#bf5af2' : '#1c1c1e',
                color: newInstrName.trim() ? '#fff' : 'rgba(235,235,245,0.3)',
                minWidth: 44, minHeight: 44,
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </section>

        {/* Chord diagram position */}
        <section>
          <p style={sectionLabel}>{t('chordDiagrams')}</p>
          <div className="grid grid-cols-3 gap-2">
            {CHORD_POSITIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setChordDisplayPosition(key)}
                className="py-3 rounded-2xl text-sm font-medium transition-all active:scale-95"
                style={{
                  backgroundColor: chordDisplayPosition === key ? '#0a84ff' : '#1c1c1e',
                  color: chordDisplayPosition === key ? '#fff' : 'rgba(235,235,245,0.4)',
                  minHeight: 50,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Tag colors */}
        {allTags.length > 0 && (
          <section>
            <p style={sectionLabel}>{t('tagColors')}</p>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
              {allTags.map((tag, idx) => {
                const currentColor = tagColors[tag]
                return (
                  <div
                    key={tag}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderTop: idx > 0 ? '1px solid #2c2c2e' : undefined }}
                  >
                    <span
                      className="text-sm flex-1"
                      style={{ color: currentColor ?? 'rgba(235,235,245,0.7)' }}
                    >
                      {tag}
                    </span>
                    <div className="flex gap-1.5">
                      {TAG_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setTagColor(tag, c)}
                          className="rounded-full transition-all"
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: c,
                            outline: currentColor === c ? '2px solid #fff' : 'none',
                            outlineOffset: 1,
                            opacity: currentColor && currentColor !== c ? 0.5 : 1,
                          }}
                        />
                      ))}
                      {currentColor && (
                        <button
                          onClick={() => setTagColor(tag, '')}
                          className="rounded-full text-xs"
                          style={{ width: 20, height: 20, backgroundColor: '#2c2c2e', color: 'rgba(235,235,245,0.4)' }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* App info */}
        <section>
          <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: '#1c1c1e' }}>
            <p className="font-semibold text-white">WorshipNote</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(235,235,245,0.3)' }}>v0.2.0 · Psalms & Chords</p>
          </div>
        </section>

      </div>
    </div>
  )
}
