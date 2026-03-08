# WorshipNote — Project Guide

> **Keep this file updated** whenever features are added or file structure changes.

## Tech Stack

- **Framework:** React 18.3 + TypeScript
- **Build:** Vite 6.3
- **Mobile:** Capacitor 6.2 (Android/iOS)
- **State:** Zustand 5.0 (persisted to localStorage)
- **Styling:** Tailwind CSS 4.1 + CSS custom properties (themes)
- **Music Theory:** Tonal 4.10
- **Icons:** Lucide React 0.576
- **i18n:** i18next 24.2 (ru, lt, en)
- **Drag & Drop:** @dnd-kit

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npx cap sync         # Sync Capacitor native projects
```

### Android Signed APK (local build)

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

- **Keystore:** `android/app/worshiphub-release.jks` (alias: `worshiphub`, password: `worshiphub123`)
- **Signing config:** Embedded in `android/app/build.gradle` → `signingConfigs.release`
- **CI:** GitHub Actions workflow (`.github/workflows/android.yml`) builds and uploads the signed APK automatically. Pushes to `master` also create a GitHub Release.

## Project Structure

```
src/
├── App.tsx                              # Router (BrowserRouter, all routes)
├── main.tsx                             # Entry point
├── index.css                            # Global styles, scrollbar
│
├── features/
│   ├── chordLibrary/
│   │   └── components/
│   │       ├── ProgressionBuilder.tsx   # Modal: create/edit chord progressions
│   │       ├── ChordLibraryFolderManager.tsx  # Modal: manage progression folders
│   │       └── ProgressionPickerModal.tsx     # Modal: pick progression to insert into song
│   │
│   ├── songs/
│   │   ├── components/
│   │   │   ├── SongViewer.tsx           # Read-only song display (lyrics + chords)
│   │   │   ├── SongEditor.tsx           # Song edit form (title, key, bpm, content)
│   │   │   ├── SimpleEditor.tsx         # WYSIWYG chord editor mode
│   │   │   ├── GuitarDiagram.tsx        # SVG guitar chord diagram (full size)
│   │   │   ├── PianoDiagram.tsx         # SVG piano chord diagram (full size)
│   │   │   ├── BassDiagram.tsx          # SVG bass chord diagram (full size)
│   │   │   ├── MiniGuitarDiagram.tsx    # Compact guitar diagram
│   │   │   ├── MiniPianoDiagram.tsx     # Compact piano diagram
│   │   │   ├── MiniBassDiagram.tsx      # Compact bass diagram
│   │   │   ├── ChordDiagramPanel.tsx    # Chord diagram display controller (single/all/mini modes)
│   │   │   ├── ChordDiagramEditor.tsx   # Interactive custom chord diagram editor
│   │   │   ├── ChordRowsPanel.tsx       # Extra chord rows on songs (labels, diagrams, colors)
│   │   │   ├── BarProgressions.tsx      # Bar-by-bar chord progression grid editor
│   │   │   ├── TransposeControls.tsx    # Transpose +/- and capo controls
│   │   │   ├── Metronome.tsx            # BPM metronome
│   │   │   └── SongStructure.tsx        # ABAC structure bar
│   │   ├── lib/
│   │   │   ├── chordData.ts             # Guitar chord voicing database (146+ chords)
│   │   │   ├── parser.ts                # ChordPro format parser
│   │   │   └── transposer.ts            # Chord transposition logic
│   │   └── types.ts                     # Song, ChordRow, Instrument types
│   │
│   └── pitch/                           # Pitch detection module
│       ├── components/
│       │   ├── PitchDisplay.tsx          # Large note + octave display
│       │   ├── CentIndicator.tsx         # Tuning accuracy gauge
│       │   ├── ChordDisplay.tsx          # Detected chord display
│       │   ├── MicControls.tsx           # Mic gain, threshold, device selector
│       │   └── PianoRollTimeline.tsx     # Note history timeline
│       ├── hooks/
│       │   ├── usePitchDetection.ts     # Pitch detection React hook
│       │   └── useChordDetection.ts     # Chord detection React hook
│       └── lib/
│           ├── yin.ts                   # YIN pitch detection algorithm
│           ├── audioCapture.ts          # Web Audio API mic capture
│           ├── pitchUtils.ts            # Note conversion, filters, gating
│           └── chordDetector.ts         # Polyphonic chord detection (chromagram)
│
├── pages/
│   ├── HomePage.tsx                     # Song library main page
│   ├── SongPage.tsx                     # Song view (lyrics, chords, diagrams, controls)
│   ├── SongEditPage.tsx                 # Song edit page wrapper
│   ├── ChordLibraryPage.tsx             # Chord library (progressions + reference)
│   ├── SetlistPage.tsx                  # Setlist view
│   ├── SetlistEditPage.tsx              # Setlist editor
│   ├── SettingsPage.tsx                 # App settings
│   └── PitchPage.tsx                    # Pitch detection / tuner page
│
├── store/
│   ├── settingsStore.ts                 # User prefs (theme, role, instrument, font, custom chords)
│   ├── songStore.ts                     # All songs CRUD
│   ├── chordLibraryStore.ts             # Chord progressions + folders
│   ├── folderStore.ts                   # Song folders
│   ├── setlistStore.ts                  # Setlist collections
│   └── pitchStore.ts                    # Pitch detection settings (mic gain, threshold, device)
│
├── shared/
│   ├── components/
│   │   ├── Layout.tsx                   # Main layout (sidebar + outlet), theme application
│   │   ├── Sidebar.tsx                  # Desktop sidebar + mobile bottom tabs
│   │   ├── AutoScroller.tsx             # Auto-scroll for song reading
│   │   └── FontSizeSlider.tsx           # Font size control
│   ├── lib/
│   │   ├── storage.ts                   # localStorage helpers, ID generation
│   │   ├── constants.ts                 # App constants
│   │   └── seedData.ts                  # Sample songs for first launch
│   └── styles/
│       └── themes.css                   # CSS custom properties for 4 themes
│
└── i18n/
    ├── ru.json                          # Russian translations
    ├── lt.json                          # Lithuanian translations
    └── en.json                          # English translations
```

## Design Patterns

- **Theming:** CSS custom properties in `themes.css`. Components use `var(--color-*)` in inline styles. Themes: `dark`, `midnight`, `light`, `forest`.
- **State:** Zustand stores with `persist` middleware (localStorage). Settings, songs, chord library, folders, setlists.
- **Song Format:** ChordPro — `[C]word` for inline chords, `[! SECTION]` for cues. Parsed by `parser.ts`.
- **Chord Diagrams:** SVG-based (guitar fretboard, piano keyboard, bass). Custom diagrams override defaults via settings store.
- **Roles:** musician (all visible), singer (chords only), congregation (lyrics only), custom roles.
- **i18n:** `useTranslation()` hook, keys in `t('keyName')`.

## Key CSS Variables

```
--color-bg              Main background
--color-bg-secondary    Secondary background (nav, headers)
--color-card            Card/input background
--color-card-raised     Elevated card / dropdown background
--color-border          Border color
--color-border-subtle   Subtle/faint borders
--color-accent          Primary accent (purple/blue/green by theme)
--color-accent-dim      Accent at low opacity
--color-text-primary    Main text
--color-text-secondary  Secondary text (~70% opacity)
--color-text-tertiary   Tertiary text (~40% opacity)
--color-text-muted      Muted text (~20% opacity)
--color-chord           Chord text color (green)
--color-success/warning/error/info  Status colors
--color-nav-bg          Navigation background
--color-nav-active      Active nav item color
--color-shadow          Box shadow color
--color-input-bg        Input field background
--color-nav-blur-bg     Nav bar blur background
```

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/library` | HomePage | Song library (default) |
| `/songs/:id` | SongPage | View song |
| `/songs/:id/edit` | SongEditPage | Edit song |
| `/songs/new` | SongEditPage | Create song |
| `/setlists` | SetlistPage | Setlist list |
| `/setlists/:id` | SetlistPage | View setlist |
| `/setlists/:id/edit` | SetlistEditPage | Edit setlist |
| `/setlists/new` | SetlistEditPage | Create setlist |
| `/chords` | ChordLibraryPage | Chord library |
| `/pitch` | PitchPage | Pitch detection / tuner |
| `/settings` | SettingsPage | App settings |
