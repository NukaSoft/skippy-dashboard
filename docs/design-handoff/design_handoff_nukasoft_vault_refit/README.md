# Handoff: NukaSoft Vault Refit — Skippy Dashboard

## Overview

A full visual redesign of the **skippy-dashboard** web client (Claude Code agent monitor, "Vault 69 — NukaSoft Command Center") from the current Pip-Boy phosphor-green CRT theme to the canonical **NukaSoft.AI Vault look**: Cola Brown shell, cream type, Nuka Red command surfaces, rad-yellow section labels.  Flatter and more readable than the current theme, with two target form factors: a 54" 4K wall display and an iPad.

Scope: all 9 existing routes restyled, plus four new features (landing hero graphic, Periscope video feed, Library page, footer links) and a theme consolidation (17 themes → 2 sanctioned + CRT toggle).

## About the Design Files

The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, **not production code to copy directly**.  The task is to recreate this design inside the existing codebase at `skippy-dashboard/client` (React 18 + Vite + Tailwind 3 + React Router 6 + Lucide icons), using its established patterns: CSS-variable theming, Tailwind utility classes mapped to vars in `tailwind.config.js`, page components in `src/pages/`, shared components in `src/components/`.

Open `Skippy Command Center.html` in a browser to interact with the prototype.  `Redesign Brief.html` is the design memo explaining the reasoning.

## Fidelity

**High-fidelity.**  Colors, typography, spacing, radii, and copy are final.  Recreate pixel-perfectly, but express it through the codebase's existing idioms (Tailwind utilities + CSS vars), and keep using real Lucide React icons (the prototype inlines equivalent SVGs at `stroke-width: 1.75`).

## Mapping to the existing codebase

This is the critical section — the repo already has a theming architecture; the refit slots into it.

### 1. Token migration (`src/themes/`)

Replace the theme files with two sanctioned themes.  Keep the `--pip-*` variable NAMES if it minimizes churn (Tailwind config references them), but retarget every value.  Mapping from current `base.css` to the new **Vault** theme:

| Existing var | Current (pip-boy) | New Vault value | Notes |
| --- | --- | --- | --- |
| `--pip-bg` | `#0b1a0b` | `#241007` | page background (deepest ink) |
| `--pip-surface-1` | `#0d1f0d` | `#2A1308` | nav rails |
| `--pip-surface-2` | `#112811` | `#341A0C` | cards |
| `--pip-surface-3` | `#1a3a1a` | `#3D1C0B` | nested surfaces / hover |
| `--pip-primary` | `#18FF62` | `#F5E6C8` (cream) | primary fg is CREAM now, not an accent green |
| `--pip-dim` | `#0bae0f` | `rgba(245,230,200,0.72)` | secondary fg |
| `--pip-dark` | `#0d2a0d` | `rgba(245,230,200,0.45)` | tertiary fg |
| `--pip-border` | `#1a3a1a` | `rgba(245,230,200,0.14)` | hairline |
| `--pip-border-light` | `#255a25` | `rgba(245,230,200,0.28)` | strong hairline |
| `--pip-amber` | `#FFB642` | `#F1C40F` (rad yellow) | section labels, working status |
| `--pip-crit` | `#ff3333` | `#E43A41` | error |
| `--pip-glow` | green glow | **delete** — no glows in Vault | flatness rule |
| (new) accent red | — | `#C41E24`, hover `#E43A41`, pressed `#8A1319` | command color: topbar, active nav, primary buttons |
| (new) sky | — | `#87CEEB` | "connected" status |
| (new) green | — | `#54C47A` | "completed"/healthy status |
| `--pip-font-heading` | Monofonto | `'Abril Fatface', Georgia, serif` (display, page titles only) + `'Josefin Sans'` 700 for ALL-CAPS labels | see Typography |
| `--pip-font-data` | Roboto Mono | `'IBM Plex Mono', monospace` | all data/numbers/IDs |

Second sanctioned theme **Terminal** (the CRT-green nod): bg `#081408`, rail `#0A1A0A`, surface `#0E220E`/`#122B12`, fg `#BFF5C6` at 1/0.7/0.42 alpha, hairlines cream-green at 0.16/0.30, sky → `#7FD8C9`.  Red stays `#C41E24` for the brand topbar; active nav underline/border becomes green in Terminal.  Exact values in `app/styles.css` under `.sk-app[data-theme="terminal"]`.

Delete the other 15 theme css files (or move to a `community/` folder excluded from the picker).  `ThemePicker.tsx` becomes a two-option control plus a **CRT toggle**.

### 2. CRT effects become a toggle (default OFF)

`base.css` currently applies scanlines + vignette via `body::before/::after` unconditionally.  Gate them behind a class/attr (e.g. `html[data-crt="on"]`), persisted in localStorage, surfaced in Settings → Appearance and the ThemePicker.  Prototype reference: `.sk-app[data-crt="on"] .sk-crt-scan` in `app/styles.css` (scanlines 2px/4px at rgba(0,0,0,0.14), radial vignette to rgba(0,0,0,0.5), plus a faint cream text-shadow).

### 3. Fonts

Add Google Fonts: Josefin Sans (300–700) and IBM Plex Mono (300–600).  Abril Fatface ships as a local TTF in `ns/fonts/` (or load from Google Fonts).  Remove Monofonto.
- `font-heading` (Tailwind) → Josefin Sans 700, uppercase, letter-spacing 0.16–0.18em for labels.
- Page titles use Abril Fatface 400 — **not** Tailwind's heading font; add a `font-display` family.
- `font-mono` → IBM Plex Mono.

### 4. Per-file touch list

| Repo file | Change |
| --- | --- |
| `src/themes/*` | Replace with `vault.css` (default) + `terminal.css`; shared layout rules stay in `base.css` minus glow/scanline defaults |
| `tailwind.config.js` | Add `accent` red scale, `sky`, `green`, `yellow` semantic colors; add `font-display`; remove glow animations (`text-glow`, `pip-pulse` keep only for status dots) |
| `src/components/Sidebar.tsx` | Restyle per "Shell" spec below; collapse behavior already exists — keep it |
| `src/components/StatCard.tsx`, `StatusBadge.tsx`, `AgentCard.tsx`, `EmptyState.tsx` | Restyle per Components spec; EmptyState copy becomes Skippy voice |
| `src/pages/*` | Re-skin; Dashboard gains Hero + Periscope; new `Library.tsx` page + route + nav item |
| `src/components/Layout.tsx` | Add topbar (red command bar) above the existing sidebar+content; add FootLinks footer |

## Design Tokens (canonical)

### Colors
- Page bg `#241007` · rail `#2A1308` · card `#341A0C` · nested `#3D1C0B` · terminal-well `#1A0805`
- Text: cream `#F5E6C8`; secondary `rgba(245,230,200,0.72)`; tertiary `rgba(245,230,200,0.45)`
- Hairline `rgba(245,230,200,0.14)`; strong `rgba(245,230,200,0.28)`
- Command red `#C41E24` / hover `#E43A41` / pressed `#8A1319`; ink (borders on red) `#1A0805`
- Rad yellow `#F1C40F` (labels, working); sky `#87CEEB` (connected); green `#54C47A` (completed/ok); error `#E43A41`
- Status vocabulary (everywhere identical): working=yellow+pulsing dot, connected=sky, idle=tertiary cream, completed=green, error=red, abandoned=tertiary

### Typography (rem-based; root font-size is the display-profile scale)
- Page title: Abril Fatface 400, 1.875rem, line-height 1.05, color cream
- Eyebrow above title + card section labels: Josefin Sans 700, 0.625–0.6875rem, uppercase, tracking 0.16–0.18em, color rad yellow
- Body/UI: Josefin Sans 400/600, 0.875rem
- Data (numbers, IDs, paths, stardates, table cells): IBM Plex Mono, 0.6875–0.8125rem, `tabular-nums`, never below 14px equivalent
- Stat card value: IBM Plex Mono 600, 1.75rem

### Spacing, radii, borders, shadows
- 4px grid.  Card padding 16–18px; page padding 22–24px.
- Radii: cards/wells 8px; inner cards 6px; inputs 6px; pills/buttons 999px; **no other radii**.
- Borders: 1px hairline on all cards/tables; 2px strong under column/table headers; dashed 1px hairline for row dividers (`.sk-kv`, log items, table rows) — this dashed-divider idiom is the signature data texture.
- Shadows: **none on cards** (flat).  Letterpress `2px 2px 0 #1A0805` ONLY on: primary red buttons, the hero panel (`3px 3px 0`), and the hero ribbon.  Hover = background/border change, never lift (except primary button: translateY(-1px) + brighter red; press: deeper red, shadow removed).
- Motion: ease-out `cubic-bezier(0.22,0.61,0.36,1)`; 120ms hover / 220ms panels / 380ms page.  No bounce, no springs.

## Shells (layout)

The prototype ships three shells, switchable live via its Tweaks panel.  All share the same red **top command bar**: height 54px, bg red, border-bottom 3px `#1A0805`, NukaSoft stacked logo (36px, **click → navigates home to STAT**) + "Skippy Command Center / VAULT 69 · NUKASOFT.AI", right side mono status "● hot-rod online · Stardate NNNNN.NN".

- **A · Crew Rail (default, desktop):** left sidebar 216px, bg `#2A1308`, grouped nav ("STATIONS" / "QUARTERS" yellow eyebrows).  Items: icon 16px + uppercase Josefin 600 label, 3px transparent left border; active = red left border + `rgba(196,30,36,0.22)` bg; hover = `rgba(245,230,200,0.06)`.  **Collapsible** to 66px icons-only (persisted, button at bottom: "COLLAPSE").
- **B · The Bridge (wall display):** no sidebar; tab rail under the topbar (bg rail, items with 3px bottom border, active red), content full-width.
- **C · Quarterdeck (iPad):** bottom dock, fixed, 44px+ touch targets, icon over 10px uppercase label, active = red tint pill; content gets bottom padding.

Display profiles: scale the root font-size — desktop 16px, tablet 15px, TV ~21px (everything is rem-based so this is one knob).

## Screens

Nav labels keep the terse station names; page headers carry the crew-voice full names.  Every page: eyebrow "STATION NN — LABEL" (yellow) → Abril title → mono sub-line → right-aligned actions.  Every page ends with the FootLinks footer.

1. **STAT · "The Bridge"** (Dashboard.tsx)
   - **Hero panel (new):** full-width red `#C41E24` card, 2px `#1A0805` border, radius 8px, letterpress `3px 3px 0`, min-height 184px.  Left: yellow eyebrow "VAULT 69 · MASTER CONTROL REPORTING", Abril headline "All quiet on the bridge." (1.75rem cream), Skippy status paragraph, then ribbon: cream bg, cola-brown Abril text "OWN YOUR AI BEFORE IT OWNS YOU", 2px ink top/bottom borders + letterpress.  Right: `Rita_1.png` anchored bottom-right, height = panel minus 10px, `clip-path: inset(0 7.5% 0 0)` (crops an artifact on the image's right edge), drop-shadow `3px 3px 0 rgba(26,8,5,0.45)`.  3 four-point cream stars (clip-path polygon) scattered top-right.  Rita + stars hidden ≤640px.
   - 6 stat cards (Voyages, Crew active, Deckhands, Events today, Events total, Spend) — label + mono value + mono caption.
   - Split: left = Active crew list (avatar circle: red bg, 1.5px cream border, Abril initial; name, mono slug·id·model, cost, status badge; expandable deckhand rows indented with dashed left border).  Right column (320px): **Periscope** card then Captain's log (8 latest, status dot + message + ago).
   - **Periscope (new):** 16:9 well bg `#1A0805`, radius 6px.  Empty: animated CSS static + "AWAITING SIGNAL" mono.  Overlay top: pulsing REC dot + "CAM 01 · VAULT DOOR" + right "LIVE/NO SIGNAL" (mono 10px, ink text-shadow).  Source row: segmented IP CAM / YOUTUBE + URL input + "Patch in" ghost button.  IP cam URL → `<img>` (MJPEG); YouTube URL → parse video id, `youtube-nocookie.com/embed/<id>?autoplay=1&mute=1` iframe.  Persist `{kind, src}` to localStorage `sk-cam`.
2. **GTD · "The Planner"** — capture input + 4 columns (Inbox/Next actions/Waiting for/Someday) using the column header treatment: status-colored dot label + count pill, 2px strong border under header.  Cards: nested-surface bg, hairline, title + check button (appears on hover ok), chips (`@context` green outline, `→ person` sky outline), move buttons.  Complete/move/add all work in the prototype — match that behavior with the existing API.
3. **BOARD · "Crew Board"** — same column anatomy, 5 status columns; cards show name, optional note, mono ran/ago/id; empty column shows Skippy line "Nothing here.  The crew is either working or pretending to."
4. **DATA · "Voyage Ledger"** (Sessions) — search (mono input, yellow focus border) + segmented filter (All/Working/Completed/Error/Abandoned, active = cream bg + ink text).  Table: yellow uppercase headers, 2px strong underline, dashed row dividers, row hover `rgba(245,230,200,0.045)`, click expands an inline mono detail strip (stardate, model, events, "Open voyage" button).  Numerals right-aligned, mono, tabular.
5. **FEED · "Captain's Log"** — grid rows: stardate (mono, dim) | message (agent name in yellow bold, tools in mono) | status + ago.  Filter segmented control in header.
6. **ANALYTICS · "Reactor Room"** — 5 stat cards; 52-week heatmap (CSS grid, 7 rows, 2px gap, cell scale: base `rgba(245,230,200,0.07)` → `#8A1319` → `#C41E24` → `#E43A41` → `#F1C40F`); 30-day bar chart (flex bars, red, peak yellow); token distribution meters; cost-by-model donut (conic-gradient, hole = card bg) + legend; "reactor notes" kv list + Skippy aside.
7. **WORKFLOWS · "Orchestration"** — 6 stat cards; two meter-list cards (deckhand muster frequency = red meters; tool chains "Read → Read" = yellow meters) + kv summary.  (The D3 Sankey can stay if preferred — restyle node/link colors to red/yellow/cream on `#341A0C`.)
8. **LIBRARY · "Report Binders" (new page + route + nav item)** — filter segments + responsive card grid (min 208px).  Binder card: 8px colored spine bar (rotate red/yellow/sky/green), kind chip, 15px 700 title, footer mono date + "NN pp · PDF".  Click → opens the PDF (wire to a reports directory / static serve; prototype uses placeholders).
9. **BISHOP · "Ship Systems"** — kv-list cards (subsystems, uplink with meters, clients) + devices table with 10-segment CPU/MEM bars (green fill, yellow >80%, red crit), mono temp/uptime.
10. **CONFIG · "Quartermaster"** (Settings) — spend stat card, relay/notification toggles as kv rows, Appearance card (theme picker: vault/terminal + CRT toggle + layout choice), pricing table (mono patterns, right-aligned rates).

## Voice & copy (binding)

- Sessions = **voyages**, agents = **Crew / Artificial Persons** (never "bots"), subagents = **deckhands**, activity feed = **Captain's Log**, timestamps get **stardates** (mono).  
- Skippy (Master Control) narrates empty states and asides: dry, self-important, never mean.  Examples in `app/data.js` → `SKIPPY`.
- Sentence case body; ALL-CAPS only for eyebrows/labels/nav.  **No emoji anywhere.**  No em dashes in Pierre-voice copy; double space after periods.

## Interactions & state summary

- Nav: active station persisted (localStorage `sk-view` in prototype; keep React Router in the real app).  Logo click → home.  Rail collapse persisted (`sk-rail-collapsed`; repo already has `sidebar-collapsed` — keep that key).
- Periscope config persisted (`sk-cam`).  GTD capture (Enter or button), complete, move-between-columns.  DATA search/filter/row-expand.  Theme/CRT/layout persisted.
- All transitions 120–220ms ease-out; status "working" dots pulse 1.6s; no other ambient animation (CRT static in Periscope empty state is the one exception).

## Assets

- `ns/assets/NukaSoft_Log.png` — stacked logo (topbar, 36px). From the NukaSoft.AI design system; canonical, do not redraw.
- `ns/assets/Rita_1.png` — Rita + rocket bottle hero illustration (644×1008, transparent). Canonical; never redraw or regenerate; crop right edge 7.5% when used.
- `ns/fonts/AbrilFatface-Regular.ttf` — display font.
- Icons: Lucide (already in repo), `strokeWidth={1.75}`.

## Files in this bundle

- `Skippy Command Center.html` — the interactive prototype (open in a browser; Tweaks panel switches shell/theme/CRT/profile)
- `app/styles.css` — **the authoritative stylesheet**: every component style, both themes, CRT overlay, profiles
- `app/data.js` — mock data shapes + all Skippy copy
- `app/components.jsx` — shells (TopBar/RailNav/TabNav/DockNav), Status, Stat, Donut, FootLinks (GitHub `github.com/NukaSoft/skippy-dashboard`, LinkedIn `linkedin.com/in/nukasoft`, YouTube `youtube.com/@NukaSoft`, `nukasoft.ai`)
- `app/pages-core.jsx` — STAT (hero + Periscope), GTD, BOARD, DATA, FEED
- `app/pages-ops.jsx` — ANALYTICS, WORKFLOWS, LIBRARY, BISHOP, CONFIG
- `app/main.jsx` — shell switching + display profiles
- `Redesign Brief.html` — design memo / rationale
- `ns/` — tokens, font, brand assets

## Suggested implementation order

1. Token migration + fonts (themes/vault.css, tailwind.config.js) — the app should look 80% right with zero component changes.
2. Topbar + sidebar restyle + footer links + logo-home.
3. Status vocabulary + StatCard/badges/tables (DATA, CONFIG, BISHOP).
4. STAT hero + Periscope.
5. Boards (GTD, BOARD), FEED, ANALYTICS, WORKFLOWS.
6. New LIBRARY route.
7. Theme consolidation: ThemePicker → 2 themes + CRT toggle; retire fan themes.
8. Display profiles / iPad + TV passes.
