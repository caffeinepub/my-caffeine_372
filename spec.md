# রক্তদাতা গ্রুপ

## Current State
- PWA app with static manifest.json icons pointing to generated image files
- Organization logo is stored in localStorage via settingsStore as base64 data URL
- Service worker (sw.js) only does basic asset caching
- No PWA install prompt UI in the app
- No connection between uploaded logo and PWA home screen icon

## Requested Changes (Diff)

### Add
- Service worker message listener for `UPDATE_LOGO` that caches the logo blob at `/dynamic-pwa-icon.png`
- Service worker fetch interceptor for `/dynamic-pwa-icon.png` to serve cached logo
- `usePWAInstall` hook: captures `beforeinstallprompt`, tracks install state, sends logo to SW on mount
- PWA install button in the app header (visible only when installable, not yet installed)
- Send logo to service worker on app startup and after settings save

### Modify
- `sw.js`: add message handler + fetch interceptor for dynamic icon
- `manifest.json`: change icon src to `/dynamic-pwa-icon.png` for all sizes
- `index.html`: change apple-touch-icon href to `/dynamic-pwa-icon.png`
- `App.tsx`: integrate usePWAInstall hook, show install button in header
- `SettingsPage.tsx`: after saving logo, post UPDATE_LOGO message to service worker

### Remove
- Nothing

## Implementation Plan
1. Update `src/frontend/public/sw.js` — add message listener (UPDATE_LOGO) and fetch handler for `/dynamic-pwa-icon.png`
2. Update `src/frontend/public/manifest.json` — all icon srcs → `/dynamic-pwa-icon.png`
3. Update `src/frontend/index.html` — apple-touch-icon → `/dynamic-pwa-icon.png`
4. Create `src/frontend/src/hooks/usePWAInstall.ts` — beforeinstallprompt capture, isInstallable, promptInstall(), sendLogoToSW()
5. Update `src/frontend/src/App.tsx` — use hook, on mount call sendLogoToSW with current logo, show install button in header when installable
6. Update `src/frontend/src/pages/SettingsPage.tsx` — after handleSave, post UPDATE_LOGO to navigator.serviceWorker.controller
