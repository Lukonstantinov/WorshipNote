# WorshipNote — Development Guide

## Project Overview

WorshipNote (WorshipHub) is a mobile-first React web app for worship teams.
Tech stack: React 18 + TypeScript + Vite + Tailwind CSS + Capacitor (Android).

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check + production build
- `npm run typecheck` — TypeScript check only (`tsc --noEmit`)
- `npm run test` — Run Vitest tests
- `npm run lint` — ESLint

## Architecture

- **Pages:** `src/pages/` — Route-level components
- **Features:** `src/features/` — Feature modules (songs, chordLibrary, folders)
- **Stores:** `src/store/` — Zustand stores (songStore, setlistStore, folderStore, settingsStore, chordLibraryStore)
- **Shared:** `src/shared/` — Reusable components and utilities
- **i18n:** `src/i18n/` — Translations (ru, en, lt). All user-facing strings must be translated in all 3 languages.

## Key Conventions

- Dark theme: bg `#000000`, cards `#1c1c1e`, borders `#2c2c2e`, accent `#bf5af2`
- All data persisted in localStorage via Zustand `persist` middleware
- Song format: ChordPro (`[Am]text`, `[! VERSE]` for cues)
- Touch targets: minimum 44px height
- No emojis in code or UI unless explicitly requested

## PR / Build Checklist

After every PR merge or significant change:

1. Run `npm run typecheck` — must pass with zero errors
2. Run `npm run test` — all tests must pass
3. Run `npm run build` — production build must succeed
4. The GitHub Actions workflow (`.github/workflows/android.yml`) automatically builds a **signed release APK** on every push and PR
5. APK is signed with debug keystore for sideloading — the output is `app-release.apk` (NOT unsigned)

## APK Build

The CI workflow runs `./gradlew clean assembleRelease` which produces a signed APK.
Signing uses the debug keystore (`~/.android/debug.keystore`) so the APK is always installable on Android devices without any extra steps.

**Important:** Every PR triggers a clean APK build. The artifact is uploaded as `WorshipNote-v{version}-b{buildNumber}.apk`.
