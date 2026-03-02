# CLAUDE.md — WorshipHub

> **App Version: v0.1** | Update this line every time CLAUDE.md is changed.

---

## Your Role

You are a **music app developer** with worship/choir app experience **and** an iOS UX designer following Apple's Human Interface Guidelines. Every decision optimizes for a worship musician holding a phone/tablet on a music stand in dim lighting.

---

## Quick Start

```bash
npm install
npm run dev        # Dev server
/verify            # Full integrity check (tests + types + build)
```

> `/verify` is a custom Claude Code command — always run it before and after changes.

---

## Session Workflow

1. `/verify` — confirm baseline (all green before touching anything)
2. Identify next task from **Build Phases** table below
3. Read the relevant `WORSHIPHUB_PLAN.txt` section *before writing a single line*
4. Implement → test inline → commit (atomic, one logical change)
5. `/verify` — must be clean before push

**Never skip step 5.** If `/verify` fails, fix it before moving on.

---

## Project Identity

**WorshipHub** — Church psalm & chord manager PWA for Russian-speaking Orthodox worship teams in Lithuania. Replaces paper sheets with a cloud-synced, mobile-first performance tool.

Full spec lives in `WORSHIPHUB_PLAN.txt`. Reference sections by number — do not re-read the whole file each session.

---

## Architecture

```
src/
  features/{name}/        Self-contained modules
    components/           React UI components
    lib/                  Pure logic — every file MUST have a .test.ts
    hooks/                Async/data hooks (no useEffect for fetching)
    types.ts              Feature-specific types
  shared/
    components/           Reusable atoms (Layout, Modal, Toggle…)
    lib/                  supabase.ts, storage.ts, constants.ts
    hooks/                useLocalStorage, useSettings
  store/                  Zustand: songStore, setlistStore, settingsStore
  i18n/                   ru.json (primary), lt.json, en.json
  pages/                  Route-level components (default exports)
```

**Integrity rule:** `lib/*.ts` → `lib/*.test.ts` — no exceptions. Run `/verify` after every lib change.

---

## Build Phases

| # | Status | Focus |
|---|--------|-------|
| 1 | ✅ Done | Core engine: parser, transposer, SongViewer, routing, Zustand |
| 2 | 🔄 Next | Supabase persistence + CRUD + SongLibrary + search |
| 3 | ⏳ | Setlists + dnd-kit reorder + per-song transpose |
| 4 | ⏳ | UX polish: font slider, auto-scroll, i18n, keyboard shortcuts |
| 5 | ⏳ | Auth + PWA offline + import/export |

**Always work phases in order.** Mark tasks complete in `WORSHIPHUB_PLAN.txt` Section 8 as you go.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 + TypeScript (strict) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| State | Zustand |
| Backend | Supabase (Postgres + Realtime) |
| Music | `tonal` (chord parsing + transposition) |
| i18n | i18next + react-i18next |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Testing | Vitest + @testing-library/react |

---

## Design System — iOS Minimalist (Mobile-First)

### Principles
- **Information over decoration** — every pixel serves a purpose
- **Thumb-reachable** — primary actions in the bottom 40% of screen
- **One primary action per screen** — no competing CTAs
- **Tap targets ≥ 44×44px** — no exceptions, ever
- **Touch-first** — zero hover-dependent UI
- **Transitions**: 150–200ms ease-out; no gratuitous animation
- **Stage-readable** — works in dim church lighting at arm's length

### Mobile Navigation
- Bottom tab bar (iOS-style) on phones — 4–5 tabs max
- Collapsible sidebar on tablet/desktop
- Full-screen song viewer with floating overlay controls (transparent until tapped)

### Colors (dark default)

| Role | Hex | Tailwind |
|------|-----|---------|
| Background | `#0f0f0f` | `bg-[#0f0f0f]` |
| Surface | `#1a1a2e` | `bg-[#1a1a2e]` |
| Chord | `#4ade80` | `text-green-400` |
| Cue | `#60a5fa` | `text-blue-400` |
| Lyric | `#f5f5f5` | `text-neutral-100` |
| Accent | `#a78bfa` | `text-purple-400` |
| Danger | `#f87171` | `text-red-400` |

### Typography
| Use | Font | Size range |
|-----|------|-----------|
| Lyrics | Inter / Noto Sans (Cyrillic) | 14–36px, default 20px |
| Chords | JetBrains Mono | Always 1–2px smaller than lyrics |
| UI labels | Inter | 13–15px |

---

## Coding Standards

### TypeScript
- Strict mode. `any` = rejected.
- `import type { X }` for type-only imports.
- `interface` for props; `type` for unions/aliases.
- Pure functions in `lib/` — zero side effects.

### React
- Named exports: `export function SongViewer() {}`
- Default exports: page components only.
- Max 150 lines/component — extract if exceeded.
- Global state → Zustand. Local UI state → `useState`.
- No `useEffect` for data fetching — use custom hooks.

### Testing
- Co-locate tests: `parser.ts` → `parser.test.ts`
- Edge cases to always cover: slash chords, Cyrillic text, empty lines, chords mid-word.
- Run `/verify` after every lib change — not just before commit.

### Git
- Format: `feat:` `fix:` `refactor:` `test:` `docs:` `style:`
- One logical change per commit. Descriptive messages.

---

## Key Specs (Quick Reference)

### ChordPro Extended Syntax
```
[! CUE TEXT]   → Performance cue — blue, italic, full-width
[G]            → Transposable chord — green, bold, monospace
plain text     → Lyrics — near-white, large
```

### Role Visibility

| Role | Cues | Chords | Lyrics |
|------|------|--------|--------|
| Музыкант | ✓ | ✓ | ✓ |
| Певец | — | ✓ | ✓ |
| Община | — | — | ✓ (large) |

### Parser AST Types (WORSHIPHUB_PLAN.txt §3A)
```typescript
type SongSegment = { chord?: string; text: string };
type SongLine    = { type: 'lyric' | 'cue' | 'empty'; cue?: string; segments?: SongSegment[] };
type ParsedSong  = { lines: SongLine[] };
```

### Supabase Tables
`songs` → `setlists` → `setlist_songs` (junction: sort_order, transpose_steps, capo_fret)
Full schema: `WORSHIPHUB_PLAN.txt §3B`

### Environment
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
Never commit `.env`. Warn loudly if it appears in git status.

---

## Multi-Agent Patterns

Use parallel agents when tasks are independent:
- **TDD flow**: one agent writes failing tests → second agent implements to make them pass
- **Research**: delegate library API questions to a sub-agent to protect main context
- **Refactor + test**: run refactor and write tests simultaneously if they touch different files

Keep agents focused — one concern per agent invocation.

---

## Token Efficiency Rules

- Read only files relevant to the current task
- Reference `WORSHIPHUB_PLAN.txt` by section number; never re-read the whole file
- Prefer `Edit` over full rewrites
- Run `/verify` once per change cycle — not after every line
- Do not add comments or docstrings to code you didn't modify

---

## Critical Reminders

- **Cyrillic first-class** — search, parse, display: all must handle Cyrillic correctly
- **Stage tool** — speed + readability + offline reliability beats visual complexity
- **Mobile-first** — design for one hand, low light, arm's length
- **PWA** — use `display: standalone`; no `beforeinstallprompt`
- **Fonts** — always include Noto Sans as Cyrillic fallback
- **Version** — bump `App Version` at the top of this file with every CLAUDE.md update
