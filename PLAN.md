# WorshipNote — Chord Display Customization & Feature Plan

## Overview

Four major features to implement:
1. **Chord Diagram Display Customization** — Multiple display modes configurable in Settings
2. **Extended Section Names** — More presets + custom text labels for song sections
3. **Custom Roles** — Rename existing roles + add new custom roles
4. **Pitch Tester / Game** — Real-time pitch detection + gamified singing accuracy scorer

---

## Feature 1: Chord Diagram Display Customization

### Current State
- `settingsStore.ts` has `chordDisplayPosition: 'side' | 'top' | 'none'`
- `ChordDiagramPanel.tsx` shows one chord at a time with navigation arrows (side) or chip selector (top)
- `GuitarDiagram.tsx` and `PianoDiagram.tsx` render individual chord SVGs
- Settings page has a 3-button toggle: Side / Top / Off

### Changes Required

#### 1a. Add new display mode type to store
**File:** `src/store/settingsStore.ts`
- Add new setting: `chordDiagramMode: 'single' | 'all' | 'mini'`
  - `single` = current behavior (one at a time with navigation)
  - `all` = all chord diagrams visible simultaneously in a horizontal scrollable row
  - `mini` = compact mini-diagrams (smaller size, name only, very compact)
- Default: `'single'`

#### 1b. Create mini chord diagram components
**File:** `src/features/songs/components/MiniGuitarDiagram.tsx` (new)
- Simplified, much smaller (50-60px) version of GuitarDiagram
- Shows chord name + minimal fret dots, no finger numbers
- Compact for fitting many in a row

**File:** `src/features/songs/components/MiniPianoDiagram.tsx` (new)
- Simplified, smaller (50-60px) version of PianoDiagram
- Shows chord name + highlighted keys only

#### 1c. Update ChordDiagramPanel for new modes
**File:** `src/features/songs/components/ChordDiagramPanel.tsx`
- Add support for `chordDiagramMode` from settings
- `'all'` mode: render all chord diagrams in a horizontal scrollable flex container
- `'mini'` mode: render mini diagrams in a horizontal row (even more compact)
- `'single'` mode: current behavior unchanged
- Both `position='top'` and `position='side'` should respect the new mode

#### 1d. Update Settings page
**File:** `src/pages/SettingsPage.tsx`
- Add "Chord Diagram Mode" setting below "Chord Diagrams" position setting
- 3-button row: Single | All | Mini
- Only visible when chord display position is not 'none'

#### 1e. Add i18n keys
**Files:** `src/i18n/en.json`, `src/i18n/ru.json`, `src/i18n/lt.json`
- Add: `chordDiagramMode`, `diagramSingle`, `diagramAll`, `diagramMini`

---

## Feature 2: Extended Section Names (Presets + Custom)

### Current State
- `SimpleEditor.tsx` has `SECTION_PRESETS`: Verse, Chorus, Bridge, Intro, Outro
- Section labels are stored in ChordPro format: `[! VERSE]`, `[! CHORUS]`, etc.
- `SongStructure.tsx` has color mapping for section types (Russian + English)
- `SongViewer.tsx` renders cue lines

### Changes Required

#### 2a. Expand section presets
**File:** `src/features/songs/components/SimpleEditor.tsx`
- Expand `SECTION_PRESETS` to include:
  - Existing: Verse, Chorus, Bridge, Intro, Outro
  - New: Pre-Chorus, Interlude, Solo, Tag, Ending, Instrumental
- Add a "Custom..." option that shows a text input for typing any label

#### 2b. Custom section label input
**File:** `src/features/songs/components/SimpleEditor.tsx`
- In the `SectionBlock` header, change the `<select>` to support custom text:
  - Keep the dropdown for presets
  - Add a "Custom..." option at the bottom
  - When "Custom..." is selected, show an inline text input for typing any label
  - The typed label gets stored directly (e.g., "Solo: Piano", "Vocals: Tenor")

#### 2c. Add colors for new section types
**File:** `src/features/songs/components/SongStructure.tsx`
- Add color mappings for new section types:
  - PRE-CHORUS / ПРЕДПРИПЕВ → teal (#64d2ff)
  - INTERLUDE / ИНТЕРЛЮДИЯ → pink (#ff6482)
  - SOLO / СОЛО → gold (#ffd60a)
  - TAG / ТЕГ → cyan (#5ac8fa)
  - ENDING / ОКОНЧАНИЕ → red (#ff453a)
  - INSTRUMENTAL / ИНСТРУМЕНТАЛ → yellow (#ff9f0a)

#### 2d. Add i18n keys
**Files:** `src/i18n/en.json`, `src/i18n/ru.json`, `src/i18n/lt.json`
- Add translation keys for new section presets: `addPreChorus`, `addInterlude`, `addSolo`, `addTag`, `addEnding`, `addInstrumental`, `customSection`

---

## Feature 3: Custom Roles

### Current State
- `settingsStore.ts` defines `Role = 'musician' | 'singer' | 'congregation'`
- `SongPage.tsx` iterates over `ROLES: Role[]` to show role toggle buttons
- `SongViewer.tsx` uses `role` to decide what to show (chords, cues, etc.)
- Roles control: chord visibility, cue visibility, chord diagram visibility

### Changes Required

#### 3a. Extend role system in store
**File:** `src/store/settingsStore.ts`
- Add `customRoles: CustomRole[]` to settings
- Add `roleLabels: Record<string, string>` for renaming built-in roles
- Type: `CustomRole = { id: string; name: string; showChords: boolean; showCues: boolean; showDiagrams: boolean }`
- Add actions: `setRoleLabel`, `addCustomRole`, `deleteCustomRole`, `updateCustomRole`

#### 3b. Update SongPage role toggle
**File:** `src/pages/SongPage.tsx`
- Build combined role list: built-in roles (with custom labels) + custom roles
- Show all roles in the toggle bar
- For custom roles, use their `showChords`/`showCues`/`showDiagrams` flags

#### 3c. Update SongViewer to handle custom roles
**File:** `src/features/songs/components/SongViewer.tsx`
- Instead of checking `role === 'congregation'`, check the active role's `showChords` flag
- Instead of checking `role !== 'congregation'`, check the active role's `showCues` flag
- Needs a lookup from the settings store for the current role's capabilities

#### 3d. Add role management UI to Settings
**File:** `src/pages/SettingsPage.tsx`
- New section: "Roles"
- Show built-in roles with editable name labels
- Show custom roles with name, checkboxes for showChords/showCues/showDiagrams
- Add/delete custom roles
- Each custom role: name input, toggle for "Show Chords", "Show Cues", "Show Diagrams"

#### 3e. Add i18n keys
**Files:** `src/i18n/en.json`, `src/i18n/ru.json`, `src/i18n/lt.json`
- Add: `roles`, `addRole`, `roleName`, `showChords`, `showCues`, `showDiagrams`, `renameRole`, `customRoles`, `builtInRoles`

---

## Feature 4: Pitch Tester / Singing Game

### Current State
- No audio input or pitch detection exists
- Metronome exists using Web Audio API (AudioContext) — good pattern to follow
- `parseSong` and `SongViewer` handle chord+lyric rendering

### Architecture Decisions
- Use Web Audio API + `AnalyserNode` for real-time pitch detection via autocorrelation
- No external dependencies needed — pure browser APIs
- New route: `/songs/:id/pitch-game`
- Button on SongPage to enter pitch game mode

### Changes Required

#### 4a. Create pitch detection utility
**File:** `src/features/pitch/lib/pitchDetector.ts` (new)
- Implement autocorrelation-based pitch detection using Web Audio API
- `startListening(onPitch: (freq: number, note: string, cents: number) => void): Promise<StopFn>`
- Use `navigator.mediaDevices.getUserMedia({ audio: true })`
- Create `AnalyserNode` with configurable FFT size
- Implement McLeod Pitch Method or YIN algorithm for accuracy
- Convert frequency → note name + cents deviation
- Support configurable microphone sensitivity (gain node)

#### 4b. Create pitch display component
**File:** `src/features/pitch/components/PitchMeter.tsx` (new)
- Real-time pitch display (upper half of split view)
- Shows: current detected note, frequency in Hz, cents deviation gauge
- Visual gauge: -50 cents (flat) ← | → +50 cents (sharp), with green center zone
- Note name displayed large and prominently
- Sensitivity slider control
- Color coding: green = in tune (±10 cents), yellow = close (±25), red = off

#### 4c. Create game scoring engine
**File:** `src/features/pitch/lib/gameScorer.ts` (new)
- Track target notes from chord progression
- Score calculation:
  - Accuracy points: how close to target note (cents deviation → points)
  - Longevity points: how long you sustain the correct note
  - Combo multiplier: consecutive accurate notes increase multiplier
- Interface: `GameState = { score: number; combo: number; currentTarget: string; accuracy: number }`

#### 4d. Create game lyrics display component
**File:** `src/features/pitch/components/GameLyrics.tsx` (new)
- Lower half of split view
- Shows song text with chords above (similar to SongViewer but with highlighting)
- Current section/line lights up as the song progresses
- Active chord is prominently highlighted
- Auto-scrolls to keep current position visible
- Progress indicator showing position in song

#### 4e. Create pitch game page
**File:** `src/pages/PitchGamePage.tsx` (new)
- Split layout: top half = PitchMeter, bottom half = GameLyrics
- Header with: song title, score display, microphone sensitivity control, back button
- Start/stop/reset controls
- Score summary at the end
- Flow: user taps start → metronome count-in (if BPM set) → sections light up in sequence → user sings → real-time scoring

#### 4f. Add route and navigation
**File:** `src/App.tsx`
- Add route: `/songs/:id/pitch-game`

**File:** `src/pages/SongPage.tsx`
- Add "Pitch Game" button (microphone icon) near the metronome button
- Links to `/songs/${id}/pitch-game`

#### 4g. Add i18n keys
**Files:** `src/i18n/en.json`, `src/i18n/ru.json`, `src/i18n/lt.json`
- Add: `pitchGame`, `pitchTester`, `startGame`, `stopGame`, `score`, `combo`, `accuracy`, `sensitivity`, `flat`, `sharp`, `inTune`, `gameOver`, `finalScore`, `tryAgain`, `micSensitivity`

---

## Implementation Order

1. **Feature 2: Extended Section Names** — Smallest scope, self-contained
2. **Feature 1: Chord Diagram Display Customization** — Medium scope, no new APIs
3. **Feature 3: Custom Roles** — Medium scope, touches multiple files
4. **Feature 4: Pitch Tester / Game** — Largest scope, entirely new feature

---

## Files Summary

### Modified Files
- `src/store/settingsStore.ts` — New settings for chord mode, roles
- `src/features/songs/components/ChordDiagramPanel.tsx` — Support new display modes
- `src/features/songs/components/SimpleEditor.tsx` — Extended presets + custom labels
- `src/features/songs/components/SongStructure.tsx` — New section colors
- `src/features/songs/components/SongViewer.tsx` — Custom role support
- `src/pages/SettingsPage.tsx` — New settings sections
- `src/pages/SongPage.tsx` — Custom roles + pitch game button
- `src/App.tsx` — New route
- `src/i18n/en.json` — New translation keys
- `src/i18n/ru.json` — New translation keys
- `src/i18n/lt.json` — New translation keys

### New Files
- `src/features/songs/components/MiniGuitarDiagram.tsx`
- `src/features/songs/components/MiniPianoDiagram.tsx`
- `src/features/pitch/lib/pitchDetector.ts`
- `src/features/pitch/lib/gameScorer.ts`
- `src/features/pitch/components/PitchMeter.tsx`
- `src/features/pitch/components/GameLyrics.tsx`
- `src/pages/PitchGamePage.tsx`
