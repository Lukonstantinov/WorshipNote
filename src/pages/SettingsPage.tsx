import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Check, Plus, Trash2, Guitar, Piano, Music2, Drum, Pencil, Palette, Type, Users, BookOpen, HardDrive, Info, GraduationCap, ChevronRight } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useSongStore } from '../store/songStore'
import type { Language, ChordDisplayPosition, ChordDiagramMode, CustomRole, AppTheme } from '../store/settingsStore'
import type { Instrument } from '../features/songs/types'
import { FONT_SIZE_MIN, FONT_SIZE_MAX } from '../shared/lib/constants'
import { generateId } from '../shared/lib/storage'
import { ExportImportPanel } from '../features/songs/components/ExportImportPanel'
import { APP_VERSION } from '../shared/lib/version'

const LANGUAGES: { code: Language; label: string; sub: string }[] = [
  { code: 'ru', label: 'Русский',  sub: 'Russian' },
  { code: 'lt', label: 'Lietuvių', sub: 'Lithuanian' },
  { code: 'en', label: 'English',  sub: 'English' },
]

const TAG_COLORS = [
  'var(--color-error)', 'var(--color-warning)', '#ffd60a', 'var(--color-chord)',
  'var(--color-info)', 'var(--color-accent)', 'var(--color-info)', '#ebebf5',
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

function CategoryHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, marginTop: 16 }}>
      <span style={{ color: 'var(--color-accent)' }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border-subtle)', marginLeft: 4 }} />
    </div>
  )
}

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
    theme, setTheme,
    defaultSongTemplate, setDefaultSongTemplate,
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
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: 4,
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
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100%' }}>
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings')}</h1>
      </div>

      <div className="p-4 space-y-6 pb-28 max-w-md mx-auto">

        {/* ── APPEARANCE ─────────────────────────────────────── */}
        <CategoryHeader icon={<Palette size={15} />} label="Appearance" />

        {/* Theme */}
        <section>
          <p style={sectionLabel}>Theme</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: 'dark' as AppTheme, label: 'Dark', dot: 'var(--color-bg)', accent: 'var(--color-accent)' },
              { key: 'midnight' as AppTheme, label: 'Midnight', dot: '#080c14', accent: 'var(--color-info)' },
              { key: 'light' as AppTheme, label: 'Light', dot: '#f2f2f7', accent: 'var(--color-accent)' },
              { key: 'forest' as AppTheme, label: 'Forest', dot: '#0a1a0e', accent: 'var(--color-chord)' },
            ]).map(({ key, label, dot, accent }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all active:scale-95"
                style={{
                  backgroundColor: theme === key ? `${accent}22` : 'var(--color-card)',
                  color: theme === key ? accent : 'var(--color-text-tertiary)',
                  border: `1px solid ${theme === key ? accent + '66' : 'var(--color-card-raised)'}`,
                  minHeight: 50,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dot, border: `2px solid ${accent}` }}
                />
                {label}
                {theme === key && <Check size={14} strokeWidth={2.5} className="ml-auto" style={{ color: accent }} />}
              </button>
            ))}
          </div>
        </section>

        {/* Language */}
        <section>
          <p style={sectionLabel}>{t('language')}</p>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
            {LANGUAGES.map(({ code, label, sub }, idx) => (
              <button
                key={code}
                onClick={() => handleLanguage(code)}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover-bg"
                style={{ borderTop: idx > 0 ? '1px solid var(--color-border-subtle)' : undefined, minHeight: 50 }}
              >
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub}</div>
                </div>
                {language === code && <Check size={18} strokeWidth={2.5} style={{ color: 'var(--color-accent)' }} />}
              </button>
            ))}
          </div>
        </section>

        {/* ── DISPLAY ────────────────────────────────────────── */}
        <CategoryHeader icon={<Type size={15} />} label="Display" />

        {/* Font size */}
        <section>
          <p style={sectionLabel}>{t('fontSize')}</p>
          <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-card)' }}>
            <button
              onClick={() => setFontSize(Math.max(FONT_SIZE_MIN, fontSize - 2))}
              className="flex items-center justify-center w-12 h-12 rounded-xl font-semibold transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)', fontSize: 13 }}
            >A−</button>
            <div className="flex-1 text-center">
              <span className="text-3xl font-bold">{fontSize}</span>
              <span className="text-sm ml-1" style={{ color: 'var(--color-text-muted)' }}>px</span>
            </div>
            <button
              onClick={() => setFontSize(Math.min(FONT_SIZE_MAX, fontSize + 2))}
              className="flex items-center justify-center w-12 h-12 rounded-xl font-semibold transition-all active:scale-95"
              style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-secondary)', fontSize: 19 }}
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
                  backgroundColor: scrollSpeed === speed ? 'var(--color-accent)' : 'var(--color-card)',
                  color: scrollSpeed === speed ? '#fff' : 'var(--color-text-tertiary)',
                  minHeight: 50,
                }}
              >
                {speed}×
              </button>
            ))}
          </div>
        </section>

        {/* ── INSTRUMENTS ────────────────────────────────────── */}
        <CategoryHeader icon={<Music2 size={15} />} label="Instruments" />

        {/* Instruments */}
        <section>
          <p style={sectionLabel}>{t('instruments')}</p>
          <div className="rounded-2xl overflow-hidden mb-2" style={{ backgroundColor: 'var(--color-card)' }}>
            {instruments.length === 0 && (
              <p className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t('noInstruments')}
              </p>
            )}
            {instruments.map((instr, idx) => (
              <div
                key={instr.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: idx > 0 ? '1px solid var(--color-border-subtle)' : undefined }}
              >
                <span style={{ color: 'var(--color-text-tertiary)' }}>{INSTRUMENT_ICONS[instr.type]}</span>
                <div className="flex-1">
                  <span className="text-sm">{instr.name}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>{instr.type}</span>
                </div>
                <button onClick={() => deleteInstrument(instr.id)}>
                  <Trash2 size={15} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
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
              style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', minHeight: 44 }}
            >
              {INSTR_TYPES.map((type) => (
                <option key={type} value={type} style={{ backgroundColor: 'var(--color-card)' }}>{type}</option>
              ))}
            </select>
            <input
              value={newInstrName}
              onChange={(e) => setNewInstrName(e.target.value)}
              className="flex-1 rounded-xl px-3 text-sm outline-none"
              style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', minHeight: 44 }}
              placeholder={t('instrumentName')}
              onKeyDown={(e) => { if (e.key === 'Enter') addInstrument() }}
            />
            <button
              onClick={addInstrument}
              disabled={!newInstrName.trim()}
              className="flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                backgroundColor: newInstrName.trim() ? 'var(--color-accent)' : 'var(--color-card)',
                color: newInstrName.trim() ? '#fff' : 'var(--color-text-muted)',
                minWidth: 44, minHeight: 44,
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </section>

        {/* ── CHORD DIAGRAMS ─────────────────────────────────── */}
        <CategoryHeader icon={<Guitar size={15} />} label="Chord Diagrams" />

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
                  backgroundColor: chordDisplayPosition === key ? 'var(--color-info)' : 'var(--color-card)',
                  color: chordDisplayPosition === key ? '#fff' : 'var(--color-text-tertiary)',
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
                    backgroundColor: chordDiagramMode === key ? 'var(--color-chord)' : 'var(--color-card)',
                    color: chordDiagramMode === key ? '#000' : 'var(--color-text-tertiary)',
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
            <div className="rounded-2xl mt-3 overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
              <div className="flex items-center justify-between gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <span className="text-sm flex-1 min-w-0">Guitar dot colour</span>
                <input
                  type="color"
                  value={guitarDotColor}
                  onChange={(e) => setGuitarDotColor(e.target.value)}
                  className="rounded cursor-pointer flex-shrink-0"
                  style={{ width: 36, height: 28, border: 'none', backgroundColor: 'transparent', padding: 0 }}
                />
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <span className="text-sm flex-1 min-w-0">Piano key colour</span>
                <input
                  type="color"
                  value={pianoHighlightColor}
                  onChange={(e) => setPianoHighlightColor(e.target.value)}
                  className="rounded cursor-pointer flex-shrink-0"
                  style={{ width: 36, height: 28, border: 'none', backgroundColor: 'transparent', padding: 0 }}
                />
              </div>
              {/* Flip toggle (guitar/bass) */}
              <button
                onClick={() => setGuitarFlipped(!guitarFlipped)}
                className="w-full flex items-center justify-between px-4 py-3 transition-all"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <span className="text-sm">Flip guitar frets (mirror)</span>
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: 44, height: 26, backgroundColor: guitarFlipped ? 'var(--color-chord)' : 'var(--color-card-raised)',
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
                  <span className="text-sm">Diagram size</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-chord)' }}>
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
                        backgroundColor: diagramScale === s ? 'var(--color-info)' : 'var(--color-card-raised)',
                        color: diagramScale === s ? '#fff' : 'var(--color-text-tertiary)',
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

        {/* ── ROLES ──────────────────────────────────────────── */}
        <CategoryHeader icon={<Users size={15} />} label="Roles" />

        {/* Roles */}
        <section>
          <p style={sectionLabel}>{t('roles')}</p>

          {/* Built-in roles */}
          <div className="rounded-2xl overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-card)' }}>
            {BUILT_IN_ROLES.map((roleId, idx) => {
              const displayLabel = roleLabels[roleId] || t(roleId)
              const isEditing = editingRoleId === roleId
              return (
                <div
                  key={roleId}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: idx > 0 ? '1px solid var(--color-border-subtle)' : undefined }}
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
                      className="flex-1 bg-transparent text-sm outline-none px-1 rounded"
                      style={{ backgroundColor: 'var(--color-card-raised)' }}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm">{displayLabel}</span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t(roleId)}</span>
                  <button
                    onClick={() => {
                      setEditingRoleId(roleId)
                      setEditingRoleLabel(roleLabels[roleId] || t(roleId))
                    }}
                  >
                    <Pencil size={13} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Custom roles */}
          {customRoles.length > 0 && (
            <div className="rounded-2xl overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-card)' }}>
              {customRoles.map((cr, idx) => (
                <div
                  key={cr.id}
                  className="px-4 py-3"
                  style={{ borderTop: idx > 0 ? '1px solid var(--color-border-subtle)' : undefined }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm flex-1">{cr.name}</span>
                    <button onClick={() => deleteCustomRole(cr.id)}>
                      <Trash2 size={13} strokeWidth={1.5} style={{ color: 'var(--color-error)' }} />
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
                          backgroundColor: cr[key] ? '#32d74b22' : 'var(--color-card-raised)',
                          color: cr[key] ? 'var(--color-chord)' : 'var(--color-text-muted)',
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
              className="flex-1 rounded-xl px-3 text-sm outline-none"
              style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', minHeight: 44 }}
              placeholder={t('roleName')}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomRole() }}
            />
            <button
              onClick={handleAddCustomRole}
              disabled={!newRoleName.trim()}
              className="flex items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                backgroundColor: newRoleName.trim() ? 'var(--color-accent)' : 'var(--color-card)',
                color: newRoleName.trim() ? '#fff' : 'var(--color-text-muted)',
                minWidth: 44, minHeight: 44,
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </section>

        {/* ── SONGS ──────────────────────────────────────────── */}
        <CategoryHeader icon={<BookOpen size={15} />} label="Songs" />

        {/* Tag colors */}
        {allTags.length > 0 && (
          <section>
            <p style={sectionLabel}>{t('tagColors')}</p>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
              {allTags.map((tag, idx) => {
                const currentColor = tagColors[tag]
                return (
                  <div
                    key={tag}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderTop: idx > 0 ? '1px solid var(--color-border-subtle)' : undefined }}
                  >
                    <span
                      className="text-sm flex-1"
                      style={{ color: currentColor ?? 'var(--color-text-secondary)' }}
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
                          style={{ width: 20, height: 20, backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-tertiary)' }}
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

        {/* Default Song Template */}
        <section>
          <p style={sectionLabel}>Default Psalm Template</p>
          <p className="text-xs mb-2 px-1" style={{ color: 'var(--color-text-tertiary)' }}>
            New psalms start from this template (ChordPro format). Leave blank for an empty psalm.
          </p>
          <textarea
            value={defaultSongTemplate}
            onChange={(e) => setDefaultSongTemplate(e.target.value)}
            rows={6}
            placeholder={`[! VERSE 1]\n[G]Your words[Em] here\n\n[! CHORUS]\n[C]Chorus line`}
            className="w-full rounded-2xl px-4 py-3 text-sm font-mono resize-none outline-none"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          />
        </section>

        {/* Song Presets */}
        <SongPresetsSection />

        {/* ── DATA ───────────────────────────────────────────── */}
        <CategoryHeader icon={<HardDrive size={15} />} label="Data" />

        {/* Export / Import */}
        <ExportImportPanel />

        {/* ── LEARN ──────────────────────────────────────────── */}
        <CategoryHeader icon={<GraduationCap size={15} />} label="Learn" />

        <section>
          <Link
            to="/piano-learn"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-[0.99]"
            style={{ backgroundColor: 'var(--color-card)', minHeight: 50 }}
          >
            <span style={{ color: 'var(--color-accent)' }}><Piano size={18} strokeWidth={1.5} /></span>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">Piano chord trainer</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Build a progression · see it on a piano roll
              </div>
            </div>
            <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />
          </Link>
        </section>

        {/* ── ABOUT ──────────────────────────────────────────── */}
        <CategoryHeader icon={<Info size={15} />} label="About" />

        {/* App info */}
        <section>
          <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: 'var(--color-card)' }}>
            <p className="font-semibold">WorshipNote</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>v{APP_VERSION} · Psalms & Chords</p>
            <a
              href="https://github.com/Lukonstantinov/WorshipNote/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ backgroundColor: '#0a84ff22', color: 'var(--color-info)' }}
            >
              Check for updates
            </a>
          </div>
        </section>

      </div>
    </div>
  )
}

const PRESET_COLORS = [
  '#ff453a', '#ff9f0a', '#ffd60a', '#32d74b', '#0a84ff', '#bf5af2', '#ff6482', '#64d2ff',
  '#ff2d55', '#ff6b00', '#c4a000', '#00c96e', '#0070f3', '#9b59b6', '#e91e8c', '#00b8d9',
]

const PRESET_GRADIENT: Record<string, string> = {
  '#ff453a': 'linear-gradient(135deg, #ff453a 0%, #ff9f0a 100%)',
  '#ff9f0a': 'linear-gradient(135deg, #ff9f0a 0%, #ffd60a 100%)',
  '#ffd60a': 'linear-gradient(135deg, #ffd60a 0%, #32d74b 100%)',
  '#32d74b': 'linear-gradient(135deg, #32d74b 0%, #0a84ff 100%)',
  '#0a84ff': 'linear-gradient(135deg, #0a84ff 0%, #bf5af2 100%)',
  '#bf5af2': 'linear-gradient(135deg, #bf5af2 0%, #ff6482 100%)',
  '#ff6482': 'linear-gradient(135deg, #ff6482 0%, #ff453a 100%)',
  '#64d2ff': 'linear-gradient(135deg, #64d2ff 0%, #0a84ff 100%)',
  '#ff2d55': 'linear-gradient(135deg, #ff2d55 0%, #ff6b00 100%)',
  '#ff6b00': 'linear-gradient(135deg, #ff6b00 0%, #ffd60a 100%)',
  '#c4a000': 'linear-gradient(135deg, #c4a000 0%, #32d74b 100%)',
  '#00c96e': 'linear-gradient(135deg, #00c96e 0%, #64d2ff 100%)',
  '#0070f3': 'linear-gradient(135deg, #0070f3 0%, #9b59b6 100%)',
  '#9b59b6': 'linear-gradient(135deg, #9b59b6 0%, #e91e8c 100%)',
  '#e91e8c': 'linear-gradient(135deg, #e91e8c 0%, #ff453a 100%)',
  '#00b8d9': 'linear-gradient(135deg, #00b8d9 0%, #32d74b 100%)',
}

function SongPresetsSection() {
  const { t } = useTranslation()
  const { songPresets, addSongPreset, updateSongPreset, deleteSongPreset, setDefaultPreset } = useSettingsStore()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [presetContent, setPresetContent] = useState('')
  const [presetKey, setPresetKey] = useState('')
  const [presetBpm, setPresetBpm] = useState('')
  const [presetTags, setPresetTags] = useState('')

  const startAdd = () => {
    setAdding(true)
    setEditingId(null)
    setName('')
    setColor(PRESET_COLORS[0])
    setPresetContent('')
    setPresetKey('')
    setPresetBpm('')
    setPresetTags('')
  }

  const startEdit = (id: string) => {
    const p = songPresets.find((x) => x.id === id)
    if (!p) return
    setEditingId(id)
    setAdding(false)
    setName(p.name)
    setColor(p.color)
    setPresetContent(p.content)
    setPresetKey(p.key ?? '')
    setPresetBpm(p.bpm ? String(p.bpm) : '')
    setPresetTags(p.tags?.join(', ') ?? '')
  }

  const handleSave = () => {
    if (!name.trim()) return
    const data = {
      name: name.trim(),
      color,
      content: presetContent,
      key: presetKey || undefined,
      bpm: presetBpm ? parseInt(presetBpm) : undefined,
      tags: presetTags ? presetTags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    }
    if (editingId) {
      updateSongPreset(editingId, data)
      setEditingId(null)
    } else {
      addSongPreset({ id: generateId(), ...data })
      setAdding(false)
    }
    setName('')
    setPresetContent('')
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-tertiary)',
    marginBottom: 8,
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <p style={sectionLabel}>{t('presets')}</p>
        <button
          onClick={startAdd}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all active:scale-95"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-border)' }}
        >
          <Plus size={12} strokeWidth={2} /> {t('addPreset')}
        </button>
      </div>

      <p className="text-xs mb-3 px-1" style={{ color: 'var(--color-text-muted)' }}>
        Presets auto-fill content, key, BPM, tags when creating new songs.
      </p>

      {/* Preset list */}
      {songPresets.length > 0 && (
        <div className="space-y-2 mb-3">
          {songPresets.map((preset) => {
            const gradient = PRESET_GRADIENT[preset.color] ?? `linear-gradient(135deg, ${preset.color} 0%, ${preset.color}88 100%)`
            return (
            <div
              key={preset.id}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${preset.color}28 0%, ${preset.color}10 100%)`,
                border: `1px solid ${preset.color}55`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="w-5 h-5 rounded-lg flex-shrink-0"
                style={{
                  background: gradient,
                  boxShadow: `0 2px 6px ${preset.color}55`,
                }}
              />
              <span className="flex-1 text-sm font-semibold" style={{ color: preset.color }}>
                {preset.name}
              </span>
              {preset.isDefault && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${preset.color}22`, color: preset.color }}>
                  {t('defaultPreset')}
                </span>
              )}
              <button
                onClick={() => setDefaultPreset(preset.id)}
                className="text-xs px-2 py-0.5 rounded-lg transition-all"
                style={{
                  backgroundColor: preset.isDefault ? 'var(--color-accent-dim)' : 'transparent',
                  color: preset.isDefault ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}
              >
                {preset.isDefault ? '★' : '☆'}
              </button>
              <button
                onClick={() => startEdit(preset.id)}
                className="p-1 rounded-lg"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Pencil size={12} strokeWidth={2} />
              </button>
              <button
                onClick={() => { if (confirm(t('deletePreset') + '?')) deleteSongPreset(preset.id) }}
                className="p-1 rounded-lg"
                style={{ color: 'var(--color-error)', opacity: 0.5 }}
              >
                <Trash2 size={12} strokeWidth={2} />
              </button>
            </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit form */}
      {(adding || editingId) && (
        <div
          className="p-3 rounded-2xl space-y-2"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('presetName')}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
          />
          {/* Color picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Color:</span>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="rounded-full flex-shrink-0"
                style={{
                  width: 20, height: 20,
                  backgroundColor: c,
                  outline: color === c ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                  outlineOffset: 1,
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={presetKey}
              onChange={(e) => setPresetKey(e.target.value)}
              placeholder="Key (G, Am…)"
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            />
            <input
              value={presetBpm}
              onChange={(e) => setPresetBpm(e.target.value)}
              placeholder="BPM"
              type="number"
              className="w-20 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            />
          </div>
          <input
            value={presetTags}
            onChange={(e) => setPresetTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
          />
          <textarea
            value={presetContent}
            onChange={(e) => setPresetContent(e.target.value)}
            placeholder="Template content (ChordPro format)"
            rows={4}
            className="w-full rounded-xl px-3 py-2 text-sm font-mono resize-none outline-none"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', lineHeight: 1.5 }}
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-30"
              style={{ backgroundColor: color, color: '#fff' }}
            >
              {t('save')}
            </button>
            <button
              onClick={() => { setAdding(false); setEditingId(null) }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: 'var(--color-card-raised)', color: 'var(--color-text-tertiary)' }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
