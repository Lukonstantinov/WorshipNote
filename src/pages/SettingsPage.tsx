import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Plus, Trash2, Guitar, Piano, Music2, Drum, Pencil } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useSongStore } from '../store/songStore'
import type { Language, ChordDisplayPosition, ChordDiagramMode, CustomRole } from '../store/settingsStore'
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

const BUILT_IN_ROLES = ['musician', 'singer', 'congregation'] as const

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const {
    language, fontSize, scrollSpeed, setLanguage, setFontSize, setScrollSpeed,
    instruments, setInstruments,
    chordDisplayPosition, setChordDisplayPosition,
    chordDiagramMode, setChordDiagramMode,
    tagColors, setTagColor,
    roleLabels, setRoleLabel,
    customRoles, addCustomRole, updateCustomRole, deleteCustomRole,
    guitarFlipped, setGuitarFlipped,
    guitarDotColor, setGuitarDotColor,
    pianoHighlightColor, setPianoHighlightColor,
    diagramScale, setDiagramScale,
  } = useSettingsStore()
  const { songs } = useSongStore()

  const [newInstrName, setNewInstrName] = useState('')
  const [newInstrType, setNewInstrType] = useState<Instrument['type']>('guitar')
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [editingRoleLabel, setEditingRoleLabel] = useState('')
  const [newRoleName, setNewRoleName] = useState('')

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

  const handleAddCustomRole = () => {
    if (!newRoleName.trim()) return
    const role: CustomRole = {
      id: generateId(),
      name: newRoleName.trim(),
      showChords: true,
      showCues: true,
      showDiagrams: true,
    }
    addCustomRole(role)
    setNewRoleName('')
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

  const CHORD_MODES: { key: ChordDiagramMode; label: string }[] = [
    { key: 'single', label: t('diagramSingle') },
    { key: 'all',    label: t('diagramAll') },
    { key: 'mini',   label: t('diagramMini') },
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

          {/* Chord diagram mode (only when position is not 'none') */}
          {chordDisplayPosition !== 'none' && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {CHORD_MODES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setChordDiagramMode(key)}
                  className="py-3 rounded-2xl text-sm font-medium transition-all active:scale-95"
                  style={{
                    backgroundColor: chordDiagramMode === key ? '#32d74b' : '#1c1c1e',
                    color: chordDiagramMode === key ? '#000' : 'rgba(235,235,245,0.4)',
                    minHeight: 50,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Diagram colours */}
          {chordDisplayPosition !== 'none' && (
            <div className="rounded-2xl mt-3 overflow-hidden" style={{ backgroundColor: '#1c1c1e' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2c2c2e' }}>
                <span className="text-sm text-white">Guitar dot colour</span>
                <input
                  type="color"
                  value={guitarDotColor}
                  onChange={(e) => setGuitarDotColor(e.target.value)}
                  className="rounded cursor-pointer"
                  style={{ width: 36, height: 28, border: 'none', backgroundColor: 'transparent', padding: 0 }}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2c2c2e' }}>
                <span className="text-sm text-white">Piano key colour</span>
                <input
                  type="color"
                  value={pianoHighlightColor}
                  onChange={(e) => setPianoHighlightColor(e.target.value)}
                  className="rounded cursor-pointer"
                  style={{ width: 36, height: 28, border: 'none', backgroundColor: 'transparent', padding: 0 }}
                />
              </div>
              {/* Flip toggle (guitar/bass) */}
              <button
                onClick={() => setGuitarFlipped(!guitarFlipped)}
                className="w-full flex items-center justify-between px-4 py-3 transition-all"
                style={{ borderBottom: '1px solid #2c2c2e' }}
              >
                <span className="text-sm text-white">Flip guitar frets (mirror)</span>
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: 44, height: 26, backgroundColor: guitarFlipped ? '#32d74b' : '#2c2c2e',
                    display: 'flex', alignItems: 'center', padding: '3px',
                  }}
                >
                  <div
                    className="rounded-full bg-white transition-all"
                    style={{ width: 20, height: 20, transform: guitarFlipped ? 'translateX(18px)' : 'translateX(0)' }}
                  />
                </div>
              </button>
              {/* Diagram size */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">Diagram size</span>
                  <span className="text-sm font-semibold" style={{ color: '#32d74b' }}>
                    {diagramScale === 0.75 ? 'S' : diagramScale === 1 ? 'M' : diagramScale === 1.5 ? 'L' : 'XL'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {([0.75, 1, 1.5, 2] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDiagramScale(s)}
                      className="py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                      style={{
                        backgroundColor: diagramScale === s ? '#0a84ff' : '#2c2c2e',
                        color: diagramScale === s ? '#fff' : 'rgba(235,235,245,0.4)',
                      }}
                    >
                      {s === 0.75 ? 'S' : s === 1 ? 'M' : s === 1.5 ? 'L' : 'XL'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Roles */}
        <section>
          <p style={sectionLabel}>{t('roles')}</p>

          {/* Built-in roles */}
          <div className="rounded-2xl overflow-hidden mb-3" style={{ backgroundColor: '#1c1c1e' }}>
            {BUILT_IN_ROLES.map((roleId, idx) => {
              const displayLabel = roleLabels[roleId] || t(roleId)
              const isEditing = editingRoleId === roleId
              return (
                <div
                  key={roleId}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: idx > 0 ? '1px solid #2c2c2e' : undefined }}
                >
                  {isEditing ? (
                    <input
                      value={editingRoleLabel}
                      onChange={(e) => setEditingRoleLabel(e.target.value)}
                      onBlur={() => {
                        if (editingRoleLabel.trim()) setRoleLabel(roleId, editingRoleLabel.trim())
                        setEditingRoleId(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingRoleLabel.trim()) setRoleLabel(roleId, editingRoleLabel.trim())
                          setEditingRoleId(null)
                        }
                        if (e.key === 'Escape') setEditingRoleId(null)
                      }}
                      className="flex-1 bg-transparent text-sm text-white outline-none px-1 rounded"
                      style={{ backgroundColor: '#2c2c2e' }}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm text-white">{displayLabel}</span>
                  )}
                  <span className="text-xs" style={{ color: 'rgba(235,235,245,0.2)' }}>{t(roleId)}</span>
                  <button
                    onClick={() => {
                      setEditingRoleId(roleId)
                      setEditingRoleLabel(roleLabels[roleId] || t(roleId))
                    }}
                  >
                    <Pencil size={13} strokeWidth={1.5} style={{ color: 'rgba(235,235,245,0.4)' }} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Custom roles */}
          {customRoles.length > 0 && (
            <div className="rounded-2xl overflow-hidden mb-3" style={{ backgroundColor: '#1c1c1e' }}>
              {customRoles.map((cr, idx) => (
                <div
                  key={cr.id}
                  className="px-4 py-3"
                  style={{ borderTop: idx > 0 ? '1px solid #2c2c2e' : undefined }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-white flex-1">{cr.name}</span>
                    <button onClick={() => deleteCustomRole(cr.id)}>
                      <Trash2 size={13} strokeWidth={1.5} style={{ color: '#ff453a' }} />
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {([
                      ['showChords', t('showChords')] as const,
                      ['showCues', t('showCues')] as const,
                      ['showDiagrams', t('showDiagrams')] as const,
                    ]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => updateCustomRole(cr.id, { [key]: !cr[key] })}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: cr[key] ? '#32d74b22' : '#2c2c2e',
                          color: cr[key] ? '#32d74b' : 'rgba(235,235,245,0.3)',
                          border: cr[key] ? '1px solid #32d74b44' : '1px solid transparent',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add custom role */}
          <div className="flex gap-2">
            <input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="flex-1 rounded-xl px-3 text-sm outline-none text-white"
              style={{ backgroundColor: '#1c1c1e', border: '1px solid #2c2c2e', minHeight: 44 }}
              placeholder={t('roleName')}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomRole() }}
            />
            <button
              onClick={handleAddCustomRole}
              disabled={!newRoleName.trim()}
              className="flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                backgroundColor: newRoleName.trim() ? '#bf5af2' : '#1c1c1e',
                color: newRoleName.trim() ? '#fff' : 'rgba(235,235,245,0.3)',
                minWidth: 44, minHeight: 44,
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
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
            <p className="text-xs mt-1" style={{ color: 'rgba(235,235,245,0.3)' }}>v0.3.0 · Psalms & Chords</p>
          </div>
        </section>

      </div>
    </div>
  )
}
