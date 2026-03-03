# CLAUDE.md — WorshipHub Project Instructions

---

## CRITICAL: Version Management (READ FIRST)

**Every code change session MUST bump the version in `package.json`.**

### Version format: `MAJOR.MINOR.PATCH`
- `PATCH` bump → bug fixes, small tweaks (0.4.0 → 0.4.1)
- `MINOR` bump → new features (0.4.0 → 0.5.0)
- `MAJOR` bump → breaking changes or complete redesigns (0.4.0 → 1.0.0)

### How to bump version:
```bash
# Edit package.json — change "version" field
# Example: "0.4.0" → "0.4.1"
```

### APK builds:
- The CI/CD pipeline (`android.yml`) **automatically** reads the version from `package.json`
- It builds a **Release APK** (not debug) — no debug banner, properly optimised
- `versionCode` = GitHub Actions run number (auto-incrementing, prevents "already installed" errors)
- `versionName` = version from `package.json` (shown to users in Android Settings)
- Releases are published automatically on every `master` push
- **Never** manually edit `versionCode` or `versionName` in `build.gradle` — the CI handles it

### Why this matters:
Android will reject installing a new APK if its `versionCode` ≤ the installed one.
The CI's auto-increment guarantees each build is installable over the previous one.

---

## Repository
```
git clone https://github.com/Lukonstantinov/WorshipNote.git
cd WorshipNote
```

## Quick Start
```bash
npm install
npm run dev          # Start dev server
npx vitest run       # Run tests
npx tsc --noEmit     # Type check
```

## What This Project Is
WorshipHub is a church psalm & chord manager PWA for worship teams. It replaces paper sheets with a cloud-synced tool that renders lyrics, chords, and performance cues. Primary audience: Russian-speaking Orthodox Christian worship teams in Lithuania.

## Tech Stack
- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS 4 (via `@tailwindcss/vite` plugin)
- **State:** Zustand
- **Backend:** Supabase (Postgres + Realtime)
- **Music Logic:** `tonal` (chord parsing & transposition)
- **i18n:** i18next + react-i18next
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Testing:** Vitest + @testing-library/react

---

## IMPORTANT: Read Before Coding
The file `WORSHIPHUB_PLAN.txt` in the repo root contains the **full implementation spec**. Always consult it for:
- Exact data models (Section 3)
- Parser rules & edge cases (Section 4)
- Transposer logic (Section 5)
- UI rendering rules (Section 6)
- i18n keys (Section 7)

---

## Architecture & Folder Structure

```
src/
  features/{name}/          — Self-contained feature modules
    components/             — React components
    lib/                    — Pure logic (parsers, utils)
    hooks/                  — React hooks
    types.ts                — Feature-specific types
  shared/                   — Cross-feature code
    components/             — Reusable UI (Layout, Modal, FontSizeSlider, etc.)
    lib/                    — Supabase client, constants
    hooks/                  — Shared hooks (useLocalStorage, useSettings)
  store/                    — Zustand stores (songStore, setlistStore, settingsStore)
  i18n/                     — Translation JSON files (ru.json, lt.json, en.json)
  pages/                    — Route-level page components
```

---

## Build Phases — Work In Order

### Phase 1 ✅ CORE ENGINE (should be done or partially done)
Check the repo state first. These tasks may already be complete:
- [x] Project setup (Vite + React + TS + Tailwind)
- [x] Folder structure
- [x] `parser.ts` with full test coverage
- [x] `transposer.ts` with full test coverage
- [x] `SongViewer.tsx` — 3-layer rendering
- [x] `SongEditor.tsx` — textarea with ChordPro input
- [x] `TransposeControls.tsx` — +/- semitone buttons
- [x] Basic routing: Home → Song view → Song edit
- [x] Zustand store for songs (local state only)
- [x] Seed 3-5 sample Russian psalms for testing

### Phase 2 — SUPABASE + PERSISTENCE
- [ ] Supabase project setup (tables: `songs`, `setlists`, `setlist_songs`)
- [ ] `src/shared/lib/supabase.ts` client singleton
- [ ] `useSong` hook: CRUD operations
- [ ] `useLibrary` hook: fetch all, search, filter
- [ ] `SongLibrary.tsx` with search + tag filter
- [ ] Auto-save on edit with debounce

### Phase 3 — SETLISTS + PERFORMANCE
- [ ] Create setlists + setlist_songs tables
- [ ] SetlistEditor with drag-and-drop (dnd-kit)
- [ ] SetlistView — swipe/navigate between songs
- [ ] Per-song transposition within setlist
- [ ] Role toggles (musician/singer/congregation)

### Phase 4 — UX POLISH
- [ ] Font size slider (persisted per device, 14px–36px)
- [ ] Auto-scroll with speed control (requestAnimationFrame)
- [ ] Dark theme (default)
- [ ] i18n: RU primary, add LT and EN
- [ ] Mobile responsive layout
- [ ] Keyboard shortcuts (arrows = transpose, space = scroll)

### Phase 5 — FUTURE (v0.5.0)
- [ ] Chord library — global library of custom chord diagrams with folders + search
- [ ] Bar progressions — visual per-bar chord grid + saved progressions per psalm
- [ ] Export psalms as JSON (with folders) + as plain TXT (with/without chords)
- [ ] Import psalms from JSON
- [ ] Export/import chord library (JSON)
- [ ] Supabase Auth (email/password)
- [ ] PWA + Offline (vite-plugin-pwa + Workbox)

---

## How To Approach Each Session

1. **First: Check current state.** Run `npm run dev` and `npx vitest run` to see what works.
2. **Identify the next incomplete phase** from the list above.
3. **Read `WORSHIPHUB_PLAN.txt`** for the relevant section's detailed spec.
4. **Implement incrementally.** One feature at a time, test as you go.
5. **Run tests after every change:** `npx vitest run`
6. **Run type check:** `npx tsc --noEmit`

---

## Core Specs (Quick Reference)

### ChordPro Extended Syntax
```
[! CUE TEXT]     → Performance cue (blue, italic, small)
[G]              → Chord (green, bold, transposable)
Plain text       → Lyrics (white, large)
```

### Parser AST Types
```typescript
type SongSegment = { chord?: string; text: string };
type SongLine = {
  type: 'lyric' | 'cue' | 'empty';
  cue?: string;
  segments?: SongSegment[];
};
type ParsedSong = { lines: SongLine[] };
```

### Supabase Schema
```sql
CREATE TABLE songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  original_key TEXT,
  bpm INTEGER,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE setlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  service_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE setlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setlist_id UUID REFERENCES setlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  transpose_steps INTEGER DEFAULT 0,
  capo_fret INTEGER DEFAULT 0
);
```

### Three-Layer Rendering
Each lyric line renders segments as vertical columns:
```
  chord        chord              ← Layer 1: green, bold, monospace
  lyric text   lyric text         ← Layer 2: white, large, variable font
```
Cues render as full-width lines above their section.

### Role Visibility
- **Музыкант (Musician):** cues + chords + lyrics
- **Певец (Singer):** chords + lyrics (no cues)
- **Община (Congregation):** lyrics only, large font

---

## Coding Standards

### TypeScript
- Strict mode. No `any` unless absolutely unavoidable.
- Use `import type { X }` for type-only imports.
- `interface` for props, `type` for unions.
- Parser & transposer functions must be **pure** (no side effects).

### React
- Functional components only, named exports: `export function SongViewer() {}`
- Default exports only for page-level components.
- Components under 150 lines — extract sub-components if exceeded.
- Zustand for global state, React state for local UI.
- No `useEffect` for data fetching — use custom hooks wrapping Supabase.

### Tailwind CSS
- Dark theme is default. Mobile-first responsive (`md:` = tablet, `lg:` = desktop).
- Color palette:
  - Background: `#0f0f0f` | Surface: `#1a1a2e`
  - Chords: `#4ade80` | Cues: `#60a5fa` | Lyrics: `#f5f5f5`
  - Accent: `#a78bfa` | Danger: `#f87171`

### Testing
- Every `lib/` function MUST have tests.
- Test files live next to source: `parser.ts` → `parser.test.ts`
- Parser edge cases: slash chords, empty lines, chords mid-word, Cyrillic.
- Transposer: enharmonic spelling, quality preservation, slash chords.

### Git
- Commit messages: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `style:`
- Atomic commits — one logical change per commit.

---

## Environment Variables
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```
Never commit `.env`.

---

## Critical Reminders
- **Cyrillic is first-class.** All text handling, search, display must work with Cyrillic.
- **This is a stage tool.** Speed, readability, offline reliability > visual complexity.
- **Mobile-first.** All tap targets ≥ 44x44px. No hover-dependent UI.
- **Fonts:** Inter/Noto Sans for lyrics (Cyrillic), JetBrains Mono/Fira Code for chords.
- **PWA rules:** No Web Push API, no `beforeinstallprompt`, use `display: standalone`.
- When in doubt: optimize for a musician holding a tablet at arm's length on a music stand.
