# Plan: PWA + GitHub Pages Deployment for iOS

## Goal
Make WorshipNote installable as a PWA on iPhone via GitHub Pages — 100% free.

**Result:** `https://lukonstantinov.github.io/WorshipNote/` — open in Safari, "Add to Home Screen", done.

---

## Steps

### 1. Install `vite-plugin-pwa`
- `npm install -D vite-plugin-pwa`
- This auto-generates service worker + web manifest

### 2. Create PWA app icons
- Generate a set of PNG icons (192x192, 512x512) in `public/`
- Create apple-touch-icon (180x180)
- Use a simple SVG-based icon (music note) that we can inline

### 3. Update `vite.config.ts`
- Add `VitePWA` plugin with:
  - `registerType: 'autoUpdate'` (auto-updates when you push new code)
  - `base: '/WorshipNote/'` (GitHub Pages subpath)
  - Manifest config (name, icons, theme color, background color)
  - Workbox runtime caching for Google Fonts

### 4. Update `index.html`
- Add `<link rel="apple-touch-icon">` for iOS icon
- Add `<link rel="manifest">` (auto-injected by plugin, but verify)

### 5. Update `App.tsx` router
- Change `BrowserRouter` to use `basename="/WorshipNote"` for GitHub Pages subpath routing
- OR switch to `HashRouter` (simpler, avoids 404 issues on GitHub Pages)

### 6. Create GitHub Actions workflow `.github/workflows/deploy-pages.yml`
- Trigger on push to `master`
- Build the app (`npm ci && npm run build`)
- Deploy `dist/` to GitHub Pages using `actions/deploy-pages@v4`

### 7. Enable GitHub Pages in repo settings
- Source: GitHub Actions (no need to configure `gh-pages` branch)

---

## Key Decisions

### Router: HashRouter vs BrowserRouter with basename
- **HashRouter** is simpler for GitHub Pages (URLs like `/#/library`)
- **BrowserRouter + basename** requires a 404.html redirect hack
- **Recommendation:** HashRouter — it just works, no hacks needed

### Offline support
- Service worker caches all app assets (JS, CSS, fonts, icons)
- Data is already in localStorage — works offline automatically
- Google Fonts cached via workbox runtime caching

---

## Files to create/modify

| File | Action |
|------|--------|
| `package.json` | Add `vite-plugin-pwa` dev dependency |
| `vite.config.ts` | Add VitePWA plugin + base path |
| `index.html` | Add apple-touch-icon link |
| `src/App.tsx` | Switch to HashRouter |
| `public/pwa-192x192.png` | App icon 192x192 |
| `public/pwa-512x512.png` | App icon 512x512 |
| `public/apple-touch-icon.png` | iOS icon 180x180 |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deploy workflow |

---

## After deployment

1. Go to repo Settings → Pages → Source: "GitHub Actions"
2. Push to master
3. Visit `https://lukonstantinov.github.io/WorshipNote/`
4. On iPhone Safari: Share → Add to Home Screen
5. App installs with icon, full screen, works offline
6. Every push to master auto-deploys — just refresh the app
