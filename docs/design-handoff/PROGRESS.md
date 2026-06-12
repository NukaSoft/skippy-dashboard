# Vault Refit — Implementation Progress

Branch: `feature/vault-refit` · Started 2026-06-12 · Tracks the README's suggested order.

| Phase | Scope | Status |
|---|---|---|
| 1 | Token migration + fonts (vault default, terminal second, CRT toggle, fan themes retired) | ✅ done |
| 2 | Red command topbar, crew rail (STATIONS/QUARTERS), FootLinks, logo-home, stardate | ✅ done |
| 3 | Status vocabulary (working=yellow etc.), StatCard/EmptyState/AgentCard, global table idiom | ✅ done |
| 4 | STAT hero (Rita, ribbon, stars, Skippy narration) + Periscope (IP cam/YouTube, sk-cam) | ✅ done |
| 5 | Chart palette sweep (9 files), reactor heatmap ramp, donut status colors | ✅ done |
| 6 | LIBRARY station: route + nav + binder grid (placeholder shelf) | ✅ done (PDF wiring pending a reports endpoint) |
| 7 | Theme consolidation (2 + CRT) | ✅ done (folded into phase 1) |
| 8 | Display profiles (iPad 15px / TV 21px root scale), Quarterdeck dock, Bridge tab shell | ⬜ not started |

## Remaining polish (page-level)
- GTD / BOARD: column header treatment (status dot + count pill, 2px strong underline), card chips
- FEED: stardate | message | status grid rows, agent name in yellow
- DATA: row click → inline mono detail strip ("Open voyage")
- WORKFLOWS: verify D3 components on-palette after sweep; restyle Sankey nodes if needed
- CONFIG: Appearance card (theme/CRT/layout) inside Settings page (picker lives in sidebar today)
- Voice pass: remaining empty states + page subs in Skippy voice (copy in `design_handoff_nukasoft_vault_refit/app/data.js` → SKIPPY)
- Library: wire binder cards to a real reports directory/static serve

## Gotcha learned
PowerShell 5.1 `Get-Content`/`Set-Content` without UTF-8 encoding mangles em dashes in source
files (mojibake).  Use `[System.IO.File]::ReadAllText/WriteAllText` with `UTF8Encoding($false)`.
