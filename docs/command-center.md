# Command Center

The Command Center is the dashboard for regional and district
commanders. It provides a real-time operational overview of all
stations and officers under their command, with alerts, live patrol
tracking, and quick-action buttons for common workflows.

## 1. Access

The Command Center is at `/command/*` routes. Access requires one of:

- `REGIONAL_COMMANDER`
- `DISTRICT_COMMANDER`
- `NATIONAL_COMMANDER`
- `SUPER_ADMIN` (read-only for oversight)

Lower roles are redirected to their own shell.

## 2. Layout

The command shell (`src/components/role/commander-shell.tsx`) provides:

- **Full-screen map** — live patrol locations, incident pins, alert
  polygons. Uses Leaflet with OpenStreetMap tiles.
- **Side panel** — list of active incidents, sorted by severity.
- **Top bar** — region/district selector, alert feed, user menu.
- **Bottom bar** — quick actions: "Dispatch Unit", "Issue Alert",
  "Broadcast Message".

The map auto-refreshes every 15 seconds via WebSocket push (when
available) or polling fallback.

## 3. Real-time data

The Command Center uses WebSockets for live updates. The connection
is at `/api/realtime` (a Next.js route handler upgraded to a WebSocket).

Channels:

- `patrols:<region>` — patrol location updates (every 30s per officer)
- `incidents:<region>` — new incidents, status changes
- `alerts:<region>` — broadcast alerts (stolen vehicle, wanted person)
- `presence:<station>` — officer on-duty/off-duty status

If the WebSocket drops, the shell falls back to polling every 15s and
shows a "Reconnecting..." indicator in the top bar.

## 4. Map layers

The map has toggleable layers:

- **Patrols** — blue dots for active patrols, gray for off-duty
- **Incidents** — red pins for active incidents, yellow for resolved
- **Alerts** — orange polygons for alert zones (e.g. stolen vehicle
  last seen area)
- **Stations** — navy markers for police stations
- **Heatmap** — citation density over the past 24 hours

Layers can be toggled independently via the layer control in the
top-right of the map.

## 5. Quick actions

### Dispatch Unit

Opens a modal to dispatch the nearest available officer to an incident.
Shows officer name, badge number, distance, ETA. Clicking "Dispatch"
creates an assignment and sends a push notification to the officer's
PWA.

### Issue Alert

Broadcasts an alert to all officers in the region. Alert types:

- Stolen vehicle (with plate number)
- Wanted person (with photo and description)
- Public safety (road closure, weather event)
- BOLO (be on the lookout)

Alerts are pushed to all officers' PWAs immediately and persist until
cancelled.

### Broadcast Message

Sends a text message to all officers in the region. Less urgent than
an alert. Appears in the officers' notification feed but does not
trigger a push notification.

## 6. Filters

The Command Center supports filters:

- **Time range** — last 1h, 4h, 12h, 24h, 7d, custom
- **Station** — filter to a single station (commanders only)
- **Officer** — filter to a single officer
- **Severity** — critical, high, medium, low

Filters apply to the map pins and the side-panel list simultaneously.

## 7. Reports

Commanders can generate reports directly from the Command Center:

- **Shift report** — summary of activity during a shift (4h or 8h
  window)
- **Station report** — per-station performance metrics
- **Officer report** — per-officer activity log

Reports are generated server-side as PDFs and downloaded to the
browser. The generation is async — the commander clicks "Generate" and
is notified when the PDF is ready.

## 8. Mobile support

The Command Center is designed for large screens (1280px+). On
tablets (768-1279px), the map shrinks and the side panel becomes a
bottom sheet. On phones (<768px), a simplified "Commander Mobile"
view is shown with the alert feed and quick actions only — the map
is hidden because it's unusable at that size.

Commanders are advised to use a desktop or tablet for full
functionality. The phone view is for emergency monitoring only.

## 9. Audit

All Command Center actions are audited:

- Alert issuance (with target region, alert type, content)
- Unit dispatch (with officer ID, incident ID, ETA)
- Broadcast messages (with content, recipient count)
- Report generation (with report type, time range)

Audit logs are viewable at `/admin/audit-logs` (admin access required).

## 10. Performance

The map renders up to 500 markers smoothly using Leaflet's
`MarkerCluster` plugin. Beyond 500, markers are aggregated into
cluster bubbles.

The WebSocket connection is single per commander session. The server
multiplexes channel subscriptions over that one connection. If the
commander has the Command Center open in multiple tabs, each tab
opens its own WebSocket — the server deduplicates updates.
