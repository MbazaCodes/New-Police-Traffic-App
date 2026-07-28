# Officer PWA

The Officer PWA is the Next.js progressive web app used by traffic,
general, and post officers in the field. It is installable on Android
(Chrome) and iOS (Safari), works offline for cached data, and is the
primary daily-driver interface for officers on patrol.

## 1. Architecture

The Officer PWA is part of the main Next.js app — it lives at
`/officer/*` routes and shares the same codebase as the admin panel.
There is no separate build; the PWA is just a set of routes + a service
worker.

```
src/app/officer/
├── traffic/        # Traffic officer pages
│   ├── home/       # Dashboard
│   ├── citations/  # Issue citation
│   ├── arrests/    # Record arrest
│   ├── fines/      # Issue fine
│   ├── patrols/    # Start/end patrol
│   ├── pf3/        # PF3 accident report
│   ├── search-vehicle/  # Vehicle lookup
│   ├── search-citizen/  # Citizen lookup
│   └── ...
├── post/           # Post officer pages
│   ├── dashboard/  # Post dashboard
│   ├── bail/       # Bail processing
│   ├── cell/       # Cell management
│   └── ...
└── general/        # General officer pages
```

## 2. PWA manifest

The manifest is at `public/police-manifest.json`. Key fields:

- `name` — "Tanzania Police Force"
- `short_name` — "TPF"
- `display` — `standalone` (no browser chrome)
- `theme_color` — `#0F2557` (TPF navy)
- `background_color` — `#0F2557`
- `icons` — 192px, 256px, 384px, 512px PNGs
- `start_url` — `/officer/traffic/home`

## 3. Service worker

The service worker (`public/police-sw.js`) provides:

- **App shell caching** — the HTML, CSS, and JS bundle are cached on
  first load so the app opens instantly on subsequent visits.
- **API response caching** — GET responses for read-only endpoints
  (stations, officer profile) are cached for 5 minutes.
- **Offline fallback** — when the network is unavailable, the app shows
  cached data with an "offline" banner.

Mutating requests (POST/PATCH/DELETE) bypass the cache and require
network. If the network is down, they fail with a clear error message.

## 4. Install prompt

`src/components/police/pwa-manager.tsx` handles:

- `beforeinstallprompt` event (Chrome/Android) — shows a custom install
  banner with a "Sakinisha" button.
- iOS detection — shows a modal with manual "Add to Home Screen"
  instructions (iOS does not support `beforeinstallprompt`).
- Standalone mode detection — suppresses the prompt if already installed.
- Dismissal persistence — once dismissed, the banner doesn't reappear
  for 7 days (stored in `localStorage`).

On fresh login (`?pwa=1` query param), the install modal is shown
immediately regardless of dismissal state.

## 5. Offline data sync

Currently the Officer PWA does not perform background sync. Mutations
made while offline fail. A future iteration will use the Background Sync
API to queue mutations and replay them when connectivity returns.

For now, officers are instructed to check the offline banner before
submitting a citation or arrest.

## 6. Push notifications

Push notifications are configured via the Web Push API. The VAPID keys
are in `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`. The
service worker listens for push events and displays them as system
notifications.

Notification types:

- New alert (stolen vehicle, wanted person)
- New assignment
- Bail approval required
- PF3 form submission required

Tapping a notification opens the relevant page in the PWA.

## 7. Camera & scanner

The PWA uses `getUserMedia()` for camera access in:

- **Vehicle plate scanner** — `src/components/police/camera-scanner-modal.tsx`
  uses Tesseract.js for OCR of license plates.
- **PF3 photo capture** — accident scene photos are captured and
  uploaded as base64-encoded blobs.
- **Document scanner** — citizen ID cards are scanned for OCR of the
  NIDA number.

Camera access requires HTTPS (or localhost) and a user permission
prompt. The PWA gracefully degrades to manual input if the user denies
camera access.

## 8. Testing the PWA locally

To test the PWA locally:

1. Run `npm run dev`.
2. Open Chrome DevTools → Application → Manifest to verify the manifest.
3. Application → Service Workers to verify the SW registers.
4. Click "Add to home screen" in the browser UI to test install.
5. Toggle network offline in DevTools → Network to test offline mode.

To test on a physical device:

1. Use `ngrok http 3000` to expose the dev server.
2. Open the ngrok URL on your phone's browser.
3. The PWA install prompt should appear (Chrome/Android) or you can
   manually "Add to Home Screen" (iOS Safari).
