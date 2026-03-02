# WorshipNote — Comprehensive Implementation Plan

> **Status:** Planning only — no source code exists yet
> **Branch:** `claude/worshipnote-analysis-plan-1DWXR`
> **Last updated:** 2026-03-02

---

## 0. Executive Summary

WorshipNote is a Church Psalm & Chord Manager PWA for Russian-speaking Orthodox Christian worship teams in Lithuania. It replaces paper chord sheets with a cloud-synced, mobile-first tool that renders lyrics, chords, and performance cues with transposition support.

**Key decisions (confirmed with stakeholder):**
- Scope is **planning only** — no implementation in this session
- **Single team** now; schema must be extensible to multi-team later (add `user_id` nullable now)
- **Supabase project does not exist yet** — will be created in Phase 2
- Primary language: Russian (`ru`); secondary: Lithuanian (`lt`), English (`en`)

---

## 1. Issues Found in Existing Spec

The following problems were identified in `WORSHIPHUB_PLAN.txt` and `CLAUDE-2.md`. Each is addressed with a concrete fix in sections below.

| # | Problem | Fix |
|---|---------|-----|
| 1 | No TypeScript path aliases (`@/`) | Add `resolve.alias` in `vite.config.ts` + `tsconfig.json` `paths` |
| 2 | No ESLint / Prettier configuration | Add `eslint.config.js` + `.prettierrc` as root-level config files |
| 3 | No error boundaries in component hierarchy | Add `ErrorBoundary.tsx` in `shared/components/`; wrap each page |
| 4 | No loading/skeleton state strategy | Define `AsyncState<T>` type + `LoadingSpinner`/`SkeletonCard` components |
| 5 | No barrel exports (`index.ts`) for clean imports | Every `components/`, `hooks/`, `lib/` directory gets an `index.ts` |
| 6 | No global types directory | Add `src/types/` for `database.types.ts`, `global.d.ts`, `api.types.ts` |
| 7 | No app configuration file | Add `src/config/routes.ts` + `src/config/constants.ts` |
| 8 | No toast/notification system | Add `Toast.tsx` + `useToast.ts` in `shared/` |
| 9 | No explicit Zustand persist plan | `settingsStore` uses `persist` middleware; `songStore` does not |
| 10 | No Supabase RLS policies mentioned | Add RLS spec in Phase 2 section below |
| 11 | Phase 1 marked ✅ but no code exists | Confirmed: Phase 1 is **not started** |
| 12 | Missing `vitest.setup.ts` | Add `src/test/setup.ts` and reference in `vite.config.ts` |
| 13 | Missing `.env.example` | Add `.env.example` to root |
| 14 | Missing `NotFoundPage.tsx` (404) | Add to `pages/` |
| 15 | No swipe gesture plan for mobile | Use `@use-gesture/react` in Phase 3 (setlist navigation) |
| 16 | Auto-save debounce spec is vague | Specify: 800ms debounce via `useDebouncedCallback` from `use-debounce` |
| 17 | Tailwind CSS 4 uses new import syntax | Use `@import "tailwindcss"` not `@tailwind base/components/utilities` |
| 18 | Capo formula note | `actual_key - capo_fret = displayed_shapes` is **correct** (verified: Bb − 3 = G ✓) |

---

## 2. Enhanced Folder Structure

This is the **authoritative** folder structure. Any deviation requires explicit justification.

```
worshiphub/
│
├── public/
│   ├── icons/                        # PWA icons (placeholder, Phase 5)
│   └── favicon.svg
│
├── src/
│   │
│   ├── main.tsx                      # App entry point
│   ├── App.tsx                       # Router setup (React Router v6)
│   ├── index.css                     # Tailwind CSS 4 imports + CSS custom properties
│   │
│   ├── config/                       # App-wide static configuration
│   │   ├── routes.ts                 # Route path constants (ROUTES.HOME, ROUTES.SONG, etc.)
│   │   └── constants.ts              # Non-theme constants (FONT_SIZE_RANGE, SCROLL_SPEEDS)
│   │
│   ├── types/                        # Global TypeScript types (cross-feature)
│   │   ├── database.types.ts         # Supabase table row types (auto-generate later)
│   │   ├── api.types.ts              # AsyncState<T>, ApiError, PaginatedResult<T>
│   │   └── global.d.ts               # Ambient type declarations (env vars, etc.)
│   │
│   ├── features/
│   │   │
│   │   ├── songs/
│   │   │   ├── components/
│   │   │   │   ├── SongViewer.tsx        # 3-layer rendering engine (READ mode)
│   │   │   │   ├── SongEditor.tsx        # ChordPro text input (EDIT mode)
│   │   │   │   ├── LyricLine.tsx         # One rendered line (cue + chords + lyrics)
│   │   │   │   ├── ChordBadge.tsx        # Single chord display; tap = chord info modal
│   │   │   │   ├── CueBadge.tsx          # Single performance cue display
│   │   │   │   ├── TransposeControls.tsx # +/- buttons, capo toggle, key display
│   │   │   │   ├── SongMeta.tsx          # Title, original key, BPM, tags
│   │   │   │   └── index.ts              # Barrel export
│   │   │   ├── lib/
│   │   │   │   ├── parser.ts             # ChordPro Extended → AST (pure function)
│   │   │   │   ├── parser.test.ts        # Unit tests (must cover all edge cases)
│   │   │   │   ├── transposer.ts         # Chord transposition (pure function)
│   │   │   │   ├── transposer.test.ts    # Unit tests
│   │   │   │   └── index.ts              # Barrel export
│   │   │   ├── hooks/
│   │   │   │   ├── useSong.ts            # Fetch/mutate single song (Phase 2+)
│   │   │   │   ├── useTranspose.ts       # Local transpose state + helpers
│   │   │   │   └── index.ts              # Barrel export
│   │   │   └── types.ts                  # Song-specific types (AST types live here)
│   │   │
│   │   ├── setlists/
│   │   │   ├── components/
│   │   │   │   ├── SetlistView.tsx       # Ordered song list for performance
│   │   │   │   ├── SetlistEditor.tsx     # Add/remove/reorder songs (dnd-kit)
│   │   │   │   ├── SetlistCard.tsx       # Preview card in library
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useSetlist.ts         # Fetch/mutate setlist (Phase 3+)
│   │   │   │   └── index.ts
│   │   │   └── types.ts
│   │   │
│   │   └── library/
│   │       ├── components/
│   │       │   ├── SongLibrary.tsx       # Grid/list of all songs
│   │       │   ├── SongCard.tsx          # Preview card per song
│   │       │   ├── SearchBar.tsx         # Search + filter by key/tag
│   │       │   ├── TagFilter.tsx         # Filter chips
│   │       │   └── index.ts
│   │       ├── hooks/
│   │       │   ├── useLibrary.ts         # Fetch all songs, search, filter (Phase 2+)
│   │       │   └── index.ts
│   │       └── types.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Layout.tsx               # Shell: sidebar + content area
│   │   │   ├── Sidebar.tsx              # Navigation (collapses to tab bar on mobile)
│   │   │   ├── TopBar.tsx               # Context header + quick actions
│   │   │   ├── ErrorBoundary.tsx        # React error boundary wrapper
│   │   │   ├── LoadingSpinner.tsx       # Inline loading indicator
│   │   │   ├── SkeletonCard.tsx         # Content placeholder during load
│   │   │   ├── Modal.tsx                # Accessible modal dialog
│   │   │   ├── Toast.tsx                # Toast notification display
│   │   │   ├── Toggle.tsx               # Reusable toggle/switch button
│   │   │   ├── FontSizeSlider.tsx       # Adjustable text size (14px–36px)
│   │   │   ├── AutoScroller.tsx         # RAF-based auto-scroll controller
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useLocalStorage.ts       # Type-safe localStorage wrapper
│   │   │   ├── useSettings.ts           # Font size, scroll speed, role (reads settingsStore)
│   │   │   ├── useToast.ts              # Toast trigger hook
│   │   │   ├── useDebounce.ts           # Generic debounce hook (800ms default)
│   │   │   └── index.ts
│   │   └── lib/
│   │       ├── supabase.ts             # Supabase client singleton (Phase 2)
│   │       ├── storage.ts              # LocalStorage key helpers
│   │       └── index.ts
│   │
│   ├── store/
│   │   ├── songStore.ts                # Zustand: songs (no persist — synced to Supabase)
│   │   ├── setlistStore.ts             # Zustand: setlists
│   │   └── settingsStore.ts            # Zustand: UI prefs (WITH persist middleware)
│   │
│   ├── i18n/
│   │   ├── index.ts                    # i18next config + init
│   │   ├── ru.json                     # Russian (primary — complete first)
│   │   ├── lt.json                     # Lithuanian
│   │   └── en.json                     # English
│   │
│   ├── pages/
│   │   ├── HomePage.tsx                # Default export — Song library view
│   │   ├── SongPage.tsx                # Default export — Performance view
│   │   ├── SongEditPage.tsx            # Default export — Editor view
│   │   ├── SetlistPage.tsx             # Default export — Setlist performance
│   │   ├── SetlistEditPage.tsx         # Default export — Setlist builder
│   │   ├── SettingsPage.tsx            # Default export — App settings
│   │   └── NotFoundPage.tsx            # Default export — 404 fallback
│   │
│   └── test/
│       └── setup.ts                    # Vitest global setup (testing-library/jest-dom)
│
├── .env                                # NEVER commit — local only
├── .env.example                        # Committed — template with placeholder values
├── .gitignore
├── eslint.config.js                    # ESLint flat config
├── .prettierrc                         # Prettier config
├── vite.config.ts                      # Vite + React + Tailwind + path aliases
├── tsconfig.json                       # TypeScript strict config with paths
├── tsconfig.node.json                  # Vite config TS settings
├── tailwind.config.ts                  # (If needed for Tailwind v4 customization)
├── package.json
├── CLAUDE-2.md                         # Project instructions for AI agents
├── WORSHIPHUB_PLAN.txt                 # Original spec (reference only)
└── IMPLEMENTATION_PLAN.md             # THIS FILE — authoritative architecture
```

---

## 3. Data Models

### 3a. Parser AST Types (in `src/features/songs/types.ts`)

```typescript
// A single chord+text unit within a lyric line
export interface SongSegment {
  chord?: string;   // e.g. "Am7", "G/B" — undefined if pure lyric
  text: string;     // lyric fragment under or after this chord
}

// A fully parsed line of a song
export interface SongLine {
  type: 'lyric' | 'cue' | 'empty';
  cue?: string;           // populated only when type === 'cue'
  segments?: SongSegment[]; // populated only when type === 'lyric'
}

export interface ParsedSong {
  lines: SongLine[];
}

// Role affects which layers are rendered
export type UserRole = 'musician' | 'singer' | 'congregation';
```

### 3b. Supabase Schema (in `src/types/database.types.ts`)

**Design note:** `user_id` and `team_id` are added **nullable** now so the schema is extensible to multi-team without a migration that drops data. RLS is enabled but permissive until auth is added in Phase 5.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── SONGS ───────────────────────────────────────────────────────────────────
CREATE TABLE songs (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT        NOT NULL,
  original_key TEXT,                          -- e.g. "G", "Am"
  bpm          INTEGER     CHECK (bpm > 0 AND bpm < 300),
  content      TEXT        NOT NULL,          -- raw ChordPro Extended text
  tags         TEXT[]      DEFAULT '{}',      -- e.g. {"великий пост", "хвала"}
  user_id      UUID,                          -- NULL until Phase 5 auth
  team_id      UUID,                          -- NULL until multi-team Phase 5+
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Search index for Cyrillic-aware full-text search
CREATE INDEX songs_title_trgm ON songs USING gin (title gin_trgm_ops);
-- Requires: CREATE EXTENSION pg_trgm;

-- ─── SETLISTS ─────────────────────────────────────────────────────────────────
CREATE TABLE setlists (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT        NOT NULL,
  service_date DATE,
  notes        TEXT,
  user_id      UUID,                          -- NULL until Phase 5
  team_id      UUID,                          -- NULL until Phase 5+
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── SETLIST_SONGS ────────────────────────────────────────────────────────────
CREATE TABLE setlist_songs (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  setlist_id      UUID    REFERENCES setlists(id) ON DELETE CASCADE,
  song_id         UUID    REFERENCES songs(id) ON DELETE CASCADE,
  sort_order      INTEGER NOT NULL,
  transpose_steps INTEGER DEFAULT 0,          -- semitones from original key
  capo_fret       INTEGER DEFAULT 0 CHECK (capo_fret >= 0 AND capo_fret <= 12),
  UNIQUE (setlist_id, sort_order)             -- prevent sort order collisions
);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER songs_updated_at    BEFORE UPDATE ON songs    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER setlists_updated_at BEFORE UPDATE ON setlists FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY (Phase 2 — permissive; tightened in Phase 5) ─────────
ALTER TABLE songs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists      ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;

-- Phase 2: Allow all operations (no auth yet)
CREATE POLICY "public_access" ON songs         FOR ALL USING (true);
CREATE POLICY "public_access" ON setlists      FOR ALL USING (true);
CREATE POLICY "public_access" ON setlist_songs FOR ALL USING (true);

-- Phase 5 (auth): Replace above policies with:
-- CREATE POLICY "user_owns_song" ON songs
--   FOR ALL USING (auth.uid() = user_id);
```

### 3c. TypeScript Row Types (in `src/types/database.types.ts`)

```typescript
export interface Song {
  id: string;
  title: string;
  original_key: string | null;
  bpm: number | null;
  content: string;
  tags: string[];
  user_id: string | null;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setlist {
  id: string;
  title: string;
  service_date: string | null;
  notes: string | null;
  user_id: string | null;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SetlistSong {
  id: string;
  setlist_id: string;
  song_id: string;
  sort_order: number;
  transpose_steps: number;
  capo_fret: number;
}
```

---

## 4. Architecture Patterns

### 4a. Data Flow

```
Supabase (cloud DB)
    ↕  (via custom hooks in features/*/hooks/)
Zustand Stores (in-memory state)
    ↕  (via store selectors in components)
React Components (UI rendering)
```

- **Custom hooks** own all Supabase interaction. Components never import `supabase` directly.
- **Zustand stores** hold derived/cached state. They are hydrated by hooks on mount.
- **Page components** import hooks and pass data as props to feature components.

### 4b. Async State Pattern

Define in `src/types/api.types.ts`:

```typescript
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

Use this union in all hooks that fetch data:

```typescript
// Example: useSong.ts
export function useSong(id: string) {
  const [state, setState] = useState<AsyncState<Song>>({ status: 'idle' });

  useEffect(() => {
    setState({ status: 'loading' });
    supabase.from('songs').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) setState({ status: 'error', error: error.message });
        else setState({ status: 'success', data: data as Song });
      });
  }, [id]);

  return state;
}
```

Components switch on `status` to render loading/error/success states.

### 4c. Error Boundary Placement

Every **page-level component** is wrapped in `ErrorBoundary`:

```tsx
// App.tsx
<Route path={ROUTES.SONG} element={
  <ErrorBoundary fallback={<ErrorPage />}>
    <SongPage />
  </ErrorBoundary>
} />
```

`ErrorBoundary` lives in `src/shared/components/ErrorBoundary.tsx`.

### 4d. Toast / Notification Pattern

```typescript
// useToast.ts — in shared/hooks/
const { toast } = useToast();
toast.success('Песня сохранена'); // i18n key in production
toast.error('Ошибка сохранения');
```

`Toast.tsx` renders a stack of toasts in a fixed position overlay. Zustand is NOT used for toasts — use a simple context or event emitter to avoid over-engineering.

---

## 5. Coding Conventions

### 5a. File and Component Rules

| Rule | Detail |
|------|--------|
| Named exports for all components | `export function SongViewer() {}` |
| Default exports for pages only | `export default function SongPage() {}` |
| Max component file size | 150 lines — extract subcomponents if exceeded |
| Props interfaces | Named `ComponentNameProps`, defined in same file |
| `interface` for props and objects | `type` for unions, primitives, utility types |
| No `any` | Use `unknown` + type narrowing |
| No `useEffect` for data fetching | Use custom hooks only |
| Tailwind only for styling | No inline `style` except CSS variables |
| `import type` for type imports | `import type { Song } from '@/types/database.types'` |

### 5b. Import Order (enforced by ESLint)

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useTranslation } from 'react-i18next';

// 3. Absolute imports via @ alias (features, shared, store, types)
import { useSong } from '@/features/songs/hooks';
import type { Song } from '@/types/database.types';
import { ROUTES } from '@/config/routes';

// 4. Relative imports (sibling files only)
import { SongMeta } from './SongMeta';
```

### 5c. Zustand Store Template

```typescript
// src/store/settingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  fontSize: number;
  scrollSpeed: number;
  role: UserRole;
  // Actions (collocated with state)
  setFontSize: (size: number) => void;
  setRole: (role: UserRole) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 20,
      scrollSpeed: 1,
      role: 'musician',
      setFontSize: (fontSize) => set({ fontSize }),
      setRole: (role) => set({ role }),
    }),
    { name: 'worshipnote-settings' }  // localStorage key
  )
);
```

**Note:** `songStore` and `setlistStore` do NOT use `persist` — their source of truth is Supabase.

### 5d. Custom Hook Template

```typescript
// src/features/songs/hooks/useSong.ts
import { useState, useEffect } from 'react';
import type { AsyncState } from '@/types/api.types';
import type { Song } from '@/types/database.types';
// supabase import added in Phase 2

export function useSong(id: string): AsyncState<Song> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<Song>>({ status: 'idle' });

  const fetch = () => {
    // Phase 2: replace with Supabase call
    setState({ status: 'loading' });
  };

  useEffect(() => { fetch(); }, [id]);

  return { ...state, refetch: fetch };
}
```

### 5e. Test File Template

```typescript
// src/features/songs/lib/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseSong } from './parser';

describe('parseSong', () => {
  it('parses a block-level cue', () => {
    const input = '[! ИНТРО: ГИТАРА]';
    const result = parseSong(input);
    expect(result.lines[0]).toEqual({ type: 'cue', cue: 'ИНТРО: ГИТАРА' });
  });

  it('parses a chord-lyric line', () => {
    const input = '[G] Слава Те[Em]бе';
    const result = parseSong(input);
    expect(result.lines[0].type).toBe('lyric');
    expect(result.lines[0].segments).toHaveLength(2);
    expect(result.lines[0].segments?.[0]).toEqual({ chord: 'G', text: ' Слава Те' });
  });

  // ... edge cases: slash chords, empty lines, Cyrillic, chords without text
});
```

---

## 6. Configuration Files

### 6a. `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

### 6b. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 6c. `src/index.css` (Tailwind CSS 4 syntax)

```css
@import "tailwindcss";

/* Design tokens as CSS custom properties */
:root {
  --color-bg:      #0f0f0f;
  --color-surface: #1a1a2e;
  --color-chord:   #4ade80;   /* green-400 */
  --color-cue:     #60a5fa;   /* blue-400 */
  --color-lyric:   #f5f5f5;
  --color-accent:  #a78bfa;   /* purple-400 */
  --color-danger:  #f87171;   /* red-400 */

  --font-lyric: 'Inter', 'Noto Sans', sans-serif;
  --font-chord: 'JetBrains Mono', 'Fira Code', monospace;

  --font-size-song: 20px;     /* controlled by settingsStore */
}

body {
  background-color: var(--color-bg);
  color: var(--color-lyric);
  font-family: var(--font-lyric);
}
```

### 6d. `.env.example`

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6e. `src/types/global.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 6f. `src/config/routes.ts`

```typescript
export const ROUTES = {
  HOME: '/',
  SONG: '/songs/:id',
  SONG_EDIT: '/songs/:id/edit',
  SONG_NEW: '/songs/new',
  SETLIST: '/setlists/:id',
  SETLIST_EDIT: '/setlists/:id/edit',
  SETTINGS: '/settings',
} as const;

// Helper to generate concrete paths
export const toSongPath = (id: string) => `/songs/${id}`;
export const toSongEditPath = (id: string) => `/songs/${id}/edit`;
export const toSetlistPath = (id: string) => `/setlists/${id}`;
```

### 6g. `eslint.config.js`

```javascript
import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': ts, 'react-hooks': reactHooks, import: importPlugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'sibling'],
        pathGroups: [{ pattern: '@/**', group: 'internal' }],
        'newlines-between': 'always',
      }],
      'no-console': 'warn',
    },
  },
];
```

---

## 7. Phase-by-Phase Roadmap

### Phase 0 — Project Bootstrap *(not in original plan; required first)*

**Goal:** Runnable dev server with correct structure and config.

Files to create **in order:**

1. `npm create vite@latest . -- --template react-ts`
2. Install all dependencies (see Section 9 in WORSHIPHUB_PLAN.txt)
3. `.env.example`
4. `vite.config.ts` (with alias + vitest config)
5. `tsconfig.json` (strict + paths)
6. `src/index.css` (Tailwind CSS 4 import + design tokens)
7. `src/types/global.d.ts`
8. `src/types/api.types.ts`
9. `src/config/routes.ts`
10. `src/config/constants.ts`
11. `src/test/setup.ts`
12. Create all empty directories (touch `index.ts` in each)
13. `src/i18n/index.ts` + `ru.json` skeleton (Russian keys only at this stage)
14. Verify: `npm run dev` shows Vite default page; `npx vitest run` runs 0 tests without error

---

### Phase 1 — Core Engine *(the musical heart)*

**Goal:** Songs can be parsed, viewed, and transposed in a browser. No database.

**Critical path (in order):**

1. `src/features/songs/types.ts` — all AST types
2. `src/types/database.types.ts` — `Song`, `Setlist`, `SetlistSong` interfaces
3. `src/features/songs/lib/parser.ts` + `parser.test.ts`
   - Implement `parseSong(content: string): ParsedSong`
   - Tests: block cue, inline chord, empty line, slash chord, Cyrillic, trailing newline
4. `src/features/songs/lib/transposer.ts` + `transposer.test.ts`
   - Implement `transposeChord(chord: string, steps: number): string`
   - Implement `transposeSong(content: string, steps: number): string`
   - Tests: sharp/flat key selection, enharmonic equivalents, quality preservation, slash chords, capo display
5. `src/store/settingsStore.ts` (with `persist`)
6. `src/store/songStore.ts` (no persist — seed data only in Phase 1)
7. `src/features/songs/hooks/useTranspose.ts`
8. `src/shared/components/ErrorBoundary.tsx`
9. `src/shared/components/LoadingSpinner.tsx`
10. `src/features/songs/components/LyricLine.tsx`
11. `src/features/songs/components/ChordBadge.tsx`
12. `src/features/songs/components/CueBadge.tsx`
13. `src/features/songs/components/SongViewer.tsx`
14. `src/features/songs/components/SongEditor.tsx`
15. `src/features/songs/components/TransposeControls.tsx`
16. `src/features/songs/components/SongMeta.tsx`
17. `src/shared/components/Layout.tsx` + `Sidebar.tsx` + `TopBar.tsx`
18. `src/pages/HomePage.tsx` (stub — shows "3 sample songs" list from store)
19. `src/pages/SongPage.tsx` (viewer + transpose controls)
20. `src/pages/SongEditPage.tsx` (editor + save to local store)
21. `src/pages/NotFoundPage.tsx`
22. `src/App.tsx` (React Router routes)
23. Seed `songStore` with 3–5 Russian psalms in ChordPro Extended format
24. Verify: `npx vitest run` all tests pass; `npx tsc --noEmit` no errors

**Acceptance criteria for Phase 1:**
- [x] Parser passes all edge-case tests
- [x] Transposer correctly handles all 12 semitones, sharps/flats, slash chords
- [x] SongViewer renders 3 layers correctly (cue / chord / lyric)
- [x] Role toggle works: musician/singer/congregation views differ
- [x] Font size change reflects immediately in viewer
- [x] +/- transpose buttons update all chord displays
- [x] Capo toggle shows correct shape display string
- [x] Editor saves content to local Zustand store (no Supabase yet)
- [x] All pages route correctly; 404 page shows on unknown routes

---

### Phase 2 — Supabase + Persistence

**Goal:** Songs saved to cloud; searchable library.

**Tasks (in order):**

1. Create Supabase project → copy credentials to `.env`
2. Run SQL schema from Section 3b above (songs, setlists, setlist_songs + RLS)
3. Enable `pg_trgm` extension in Supabase dashboard (for Cyrillic search)
4. `src/shared/lib/supabase.ts` — client singleton
5. `src/features/songs/hooks/useSong.ts` — CRUD for single song
6. `src/features/library/hooks/useLibrary.ts` — fetch all, search (ilike + tags filter)
7. `src/features/library/components/SearchBar.tsx`
8. `src/features/library/components/TagFilter.tsx`
9. `src/features/library/components/SongCard.tsx`
10. `src/features/library/components/SongLibrary.tsx`
11. Update `HomePage.tsx` to use real library data
12. Auto-save in `SongEditPage.tsx`: debounce 800ms → `supabase.from('songs').upsert()`
13. Loading/error states in all data-fetching hooks (use `AsyncState<T>`)
14. `src/shared/components/Toast.tsx` + `useToast.ts` (show save confirmation/errors)
15. Verify: songs survive browser refresh; search works with Cyrillic text

**Acceptance criteria:**
- [x] New songs created from editor persist in Supabase
- [x] Search filters songs by Cyrillic title (case-insensitive)
- [x] Tag filter works with multi-select
- [x] Auto-save debounces correctly (no request spam)
- [x] Error states shown when Supabase is unreachable

---

### Phase 3 — Setlists + Performance Mode

**Goal:** Group songs into a service; navigate between them on stage.

**Tasks:**

1. `src/store/setlistStore.ts`
2. `src/features/setlists/hooks/useSetlist.ts`
3. `src/features/setlists/components/SetlistCard.tsx`
4. `src/features/setlists/components/SetlistEditor.tsx` (dnd-kit drag-and-drop)
5. `src/features/setlists/components/SetlistView.tsx` (swipe navigation between songs)
6. Install `@use-gesture/react` for swipe detection in `SetlistView`
7. Per-song transpose within setlist (stored in `setlist_songs.transpose_steps`)
8. Role toggles UI (musician / singer / congregation) in `TopBar.tsx`
9. `src/pages/SetlistPage.tsx` + `SetlistEditPage.tsx`
10. Add setlist navigation to `Sidebar.tsx`

**Acceptance criteria:**
- [x] Setlists are created, edited, reordered via drag-and-drop
- [x] Each song in a setlist can have independent transpose offset
- [x] Swipe left/right navigates between songs in `SetlistView`
- [x] Role toggle persists in `settingsStore` across sessions

---

### Phase 4 — UX Polish

**Goal:** Comfortable to use on stage on a tablet or phone.

**Tasks:**

1. `src/shared/components/FontSizeSlider.tsx` — range input, 14px–36px, persisted
2. `src/shared/components/AutoScroller.tsx` — RAF-based, play/pause, speeds 0.5×/1×/1.5×/2×
3. Complete all i18n keys in `ru.json`, `lt.json`, `en.json`; language picker in `SettingsPage`
4. Responsive layout audit: sidebar → bottom tab bar on mobile (`md:` breakpoint)
5. Touch target audit: all interactive elements ≥ 44×44px
6. Keyboard shortcuts:
   - `←` / `→` arrows → transpose down/up
   - `Space` → toggle auto-scroll
   - `Escape` → close modals
7. `src/pages/SettingsPage.tsx` — font size, scroll speed, language, role, theme

**Acceptance criteria:**
- [x] Font size change reflects immediately with no page reload
- [x] Auto-scroll is smooth and pauseable
- [x] All UI strings available in Russian (minimal Lithuanian/English)
- [x] App is fully usable on a 375px-wide phone with one hand

---

### Phase 5 — Future (Post-launch)

*Plan, don't implement yet. Schema already prepared.*

- **Supabase Auth** (email/password) — add `auth.uid()` check to RLS policies; associate songs with `user_id`
- **Multi-team** — add `teams` table; associate songs/setlists with `team_id`; invite system
- **PWA + Offline** — `vite-plugin-pwa` + Workbox; cache songs for offline performance mode
- **Song Import/Export** — `.cho` ChordPro file import; PDF export via print stylesheet
- **Nashville Number System** — toggle to replace chord letters with numerals relative to key
- **Song duplicate/fork** — copy song with new title
- **BPM click track** — Web Audio API beep at set BPM

---

## 8. Parser Spec (Refined)

See `WORSHIPHUB_PLAN.txt` Section 4 for the primary spec. Additions and clarifications:

### Block Cue vs Inline Cue

A **block cue** is a line that contains ONLY a `[! ...]` token (after trimming whitespace):
```
[! ИНТРО: ГИТАРА]     → type: 'cue', cue: 'ИНТРО: ГИТАРА'
```

A **chord-only line** is a line that contains only chord tokens and whitespace:
```
[G]  [Am]  [F]        → type: 'lyric', segments with empty text
```

**Never** confuse `[! ...]` with a chord. The regex for chords must explicitly exclude `!`:
```typescript
const CHORD_REGEX = /\[(?!!)[^\]]+\]/g;   // matches [G], [Am7], [G/B] but NOT [! ...]
const CUE_REGEX   = /^\s*\[!(.*?)\]\s*$/; // matches block-level cue lines only
```

### Edge Cases

| Input | Expected Output |
|-------|----------------|
| `[G/B]` | `chord: 'G/B'` (slash chord) |
| `[G][Am]` (no text) | Two segments with `text: ''` |
| `[G]` then newline then `text` | Two separate lines |
| Cyrillic in lyrics | Preserved as-is |
| `[! CUE] some text` | Treat as lyric line with inline cue label (future) |
| Empty line | `{ type: 'empty' }` |
| Multiple spaces between chords | Preserved in text segment |

---

## 9. Transposer Spec (Refined)

See `WORSHIPHUB_PLAN.txt` Section 5 for primary spec. Additions:

### Sharp/Flat Key Selection Algorithm

```
SHARP_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#']
FLAT_KEYS  = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']

After transposing root to new index:
  result_note = SHARPS[index]   // always sharps first
  if SHARPS[index] in ENHARMONIC_MAP and target_key in FLAT_KEYS:
    result_note = FLATS[index]  // switch to flats if appropriate
```

If no target key context is available (user just pressed +1 without specifying key), use the **current key** (stored in `songStore`) to determine spelling preference.

### Capo Display (confirmed correct)

```
displayed_shape_key = actual_key − capo_fret
```

Example: song key Bb, capo fret 3 → Bb (semitone 10) − 3 = 7 = G
Display: `"Каподастр: 3 | Играть как G"`

This is correct: placing capo on fret 3 raises the pitch by 3 semitones, so guitar shapes that sound like Bb are played as G shapes (3 semitones lower).

---

## 10. i18n Keys (Complete Russian Set)

File: `src/i18n/ru.json`

```json
{
  "app": { "name": "WorshipNote" },
  "nav": {
    "library": "Библиотека",
    "setlists": "Списки служения",
    "settings": "Настройки"
  },
  "song": {
    "new": "Новая песня",
    "edit": "Редактировать",
    "save": "Сохранить",
    "delete": "Удалить",
    "unsaved": "Несохранённые изменения",
    "saved": "Сохранено",
    "key": "Тональность",
    "bpm": "Темп (BPM)",
    "tags": "Теги"
  },
  "transpose": {
    "label": "Транспозиция",
    "capo": "Каподастр",
    "playAs": "Играть как",
    "semitone": "Полутон"
  },
  "role": {
    "label": "Роль",
    "musician": "Музыкант",
    "singer": "Певец",
    "congregation": "Община"
  },
  "display": {
    "fontSize": "Размер шрифта",
    "autoScroll": "Автопрокрутка",
    "speed": "Скорость",
    "language": "Язык"
  },
  "search": {
    "placeholder": "Поиск песен...",
    "noResults": "Ничего не найдено"
  },
  "setlist": {
    "new": "Новый список",
    "add": "Добавить в список",
    "remove": "Удалить из списка",
    "reorder": "Перетащите для изменения порядка"
  },
  "common": {
    "cancel": "Отмена",
    "confirm": "Подтвердить",
    "loading": "Загрузка...",
    "error": "Произошла ошибка",
    "retry": "Попробовать снова"
  }
}
```

---

## 11. Dependency Versions

Use these when creating `package.json` (latest stable as of plan date):

| Package | Version | Note |
|---------|---------|------|
| `react` | `^19.0.0` | |
| `react-dom` | `^19.0.0` | |
| `react-router-dom` | `^7.1.0` | |
| `zustand` | `^5.0.0` | Includes persist middleware |
| `@supabase/supabase-js` | `^2.48.0` | |
| `tonal` | `^6.4.0` | |
| `i18next` | `^24.0.0` | |
| `react-i18next` | `^15.0.0` | |
| `@dnd-kit/core` | `^6.3.0` | |
| `@dnd-kit/sortable` | `^8.0.0` | |
| `@use-gesture/react` | `^10.3.0` | Phase 3 — swipe |
| `use-debounce` | `^10.0.4` | Auto-save debounce |
| **Dev** | | |
| `vite` | `^6.0.0` | |
| `@vitejs/plugin-react` | `^4.3.0` | |
| `@tailwindcss/vite` | `^4.0.0` | Tailwind CSS 4 |
| `tailwindcss` | `^4.0.0` | |
| `typescript` | `^5.7.0` | |
| `vitest` | `^2.1.0` | |
| `@testing-library/react` | `^16.0.0` | |
| `@testing-library/jest-dom` | `^6.6.0` | |
| `jsdom` | `^25.0.0` | Vitest environment |
| `@eslint/js` | `^9.0.0` | |
| `@typescript-eslint/parser` | `^8.0.0` | |
| `@typescript-eslint/eslint-plugin` | `^8.0.0` | |
| `eslint-plugin-react-hooks` | `^5.0.0` | |
| `eslint-plugin-import` | `^2.31.0` | |

---

## 12. Improvements Summary

The following improvements over the original spec are incorporated into this plan:

1. **`src/types/` directory** — Central place for database row types and shared utility types
2. **`src/config/` directory** — Route constants prevent string duplication bugs
3. **`AsyncState<T>` union type** — Forces explicit loading/error/success handling
4. **ErrorBoundary on every page** — Prevents one broken page from crashing the whole app
5. **Barrel exports everywhere** — `import { useSong } from '@/features/songs/hooks'`
6. **`user_id` and `team_id` (nullable)** — Schema ready for Phase 5 multi-team without migration
7. **`pg_trgm` index on `songs.title`** — Enables fast Cyrillic fuzzy search in Supabase
8. **`UNIQUE(setlist_id, sort_order)`** — Prevents silent sort order conflicts in setlists
9. **`updated_at` trigger** — Auto-managed; no need to send from client
10. **Permissive RLS in Phase 2, tightened in Phase 5** — Explicit policy lifecycle
11. **`@use-gesture/react` for swipe** — Specified library (not vague "swipe gestures")
12. **`use-debounce` for auto-save** — Specified library (not vague "debounce")
13. **Phase 0** — Bootstrap phase added; original plan started at Phase 1
14. **`NotFoundPage.tsx`** — 404 handled gracefully
15. **Tailwind CSS 4 `@import` syntax** — Corrected from v3 `@tailwind` directives
16. **ESLint + Prettier config** — Code style enforced from day one
17. **`vitest.setup.ts` + `jsdom`** — Test environment properly configured
18. **`.env.example`** — Template committed to repo so onboarding is documented
19. **`src/types/global.d.ts`** — Typed `import.meta.env` prevents runtime surprises
20. **Toast system** — Missing from original spec; needed for save/error feedback

---

*End of plan. Start implementation with Phase 0.*
