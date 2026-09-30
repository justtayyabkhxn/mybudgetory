# Assets, Privacy Policy & Delete Account — Design

Date: 2026-09-23 · Clients: Next.js web + Flutter Android (privacy page web-only)

## Goals

1. Track investment **assets** (Indian stocks, crypto, precious metals) next to cash.
2. Net worth = **cash + assets**; the balance chart shows three lines: Cash, Assets, Total.
3. A web **Privacy Policy** page with a Data Privacy section.
4. **Delete account**, password-confirmed, removing the user and all their data.

## 1. Data model

New collection `Asset` (`src/models/Asset.ts`):

| field | type | notes |
|---|---|---|
| `userId` | ObjectId → User | indexed |
| `market` | `"indian_stock" \| "crypto" \| "precious_metal"` | required |
| `name` | string | e.g. "TCS", "BTC", "Gold 24K"; required, trimmed, ≤ 60 chars |
| `quantity` | number | > 0 |
| `buyPrice` | number | per unit, ≥ 0 |
| `buyDate` | Date | required |
| `valuations` | `[{ _id, at: Date, value: number }]` | manual **total** current value with date & time |
| timestamps | | |

Derived (never stored):
- `cost = quantity × buyPrice`
- `currentValue` = value of the valuation with the latest `at`; if none, `cost`
- `gain = currentValue − cost`, `gainPct = cost > 0 ? gain / cost × 100 : 0`
- `lastValuedAt` = latest valuation `at` or null

## 2. API

All routes require `Authorization: Bearer <jwt>` and scope by `userId`.

- `GET /api/assets` → `{ assets: AssetDTO[], totals: { cost, value, gain } }`. Valuations sorted by `at` asc.
- `POST /api/assets` body `{ market, name, quantity, buyPrice, buyDate }` → 201 `AssetDTO`. 400 on invalid input.
- `PATCH /api/assets/[id]` any of the same fields → `AssetDTO`. 404 if not the user's.
- `DELETE /api/assets/[id]` → `{ ok: true }`.
- `POST /api/assets/[id]/valuations` body `{ value, at }` (`at` ISO datetime; defaults to now; must not be in the future by more than 1 day) → `AssetDTO`.
- `DELETE /api/assets/[id]/valuations/[valuationId]` → `AssetDTO`.
- `GET /api/networth` additionally returns:
  - `assetsTotal: number` (sum of current values)
  - each `history[i].assets: number` — asset value on that day (see §3)
  - Existing fields unchanged, so older clients keep working.
- `DELETE /api/user` body `{ password }` → verifies with bcrypt; 401 `{ error: "Incorrect password" }` on mismatch; on success deletes (see §6) and returns `{ ok: true }`.

`AssetDTO`: `{ _id, market, name, quantity, buyPrice, buyDate, valuations: [{_id, at, value}], cost, currentValue, gain, gainPct, lastValuedAt }`.

## 3. Asset series (server, `src/lib/assetSeries.ts`)

Pure function `assetValueOn(asset, dayEndMs)`:
- `buyDate` after the day → 0
- else latest valuation with `at ≤ dayEnd` → its value
- else → `cost`

`assetsOnDay(assets, day) = Σ assetValueOn`. Evaluated at the end of each UTC day of the history (step function — a manual reading holds until the next one; no interpolation, the readings are what the user asserted). Today's history point uses the current values.

Total line = `balance + assets` per point (computed client-side from the two fields).

## 4. Net Worth page (web + Android)

- Hero shows **Total net worth** (cash + assets); beneath it two small stats: Cash, Assets (tapping Assets → assets page).
- Balance chart draws 3 lines on the same axes:
  - **Cash** — existing styling (per-segment rising/falling colours, wash) kept;
  - **Assets** — a distinct accent colour, 2px, no wash;
  - **Total** — the text/foreground colour, 2.5px, the most prominent.
  - Legend row (Cash / Assets / Total) with tap-to-toggle visibility; tooltip lists all three for the day.
  - When the user has no assets the Assets and Total lines are hidden and the chart looks like today.
- Projection, monthly-change chart, AI advice stay cash-based.
- An "Assets" card/button linking to the assets page.

## 5. Assets page (web `/assets`, Android route `/assets`)

- Header summary: total value, total cost, total gain (₹ and %), coloured by sign.
- Add form (sheet on Android, card/modal on web), fields in this order:
  1. **Market** — segmented: Indian Stocks / Crypto / Precious Metals
  2. **Name**
  3. **Quantity**
  4. **Buy price** (per unit)
  5. **Buy date**
  — shows computed "Invested ₹x" live.
- List grouped by market: name, qty, current value, gain, "valued <date>" or "not valued yet".
- Holding detail: stats, valuation history (newest first, deletable), **Update value** (total value + date & time picker, default now), Edit, Delete (confirm).
- Menu/nav: web Menu + DesktopNav get "Assets"; Android menu drawer gets "Assets".

## 6. Delete account

Server deletes, in order: `Transaction` (userId), `Asset`, `NetWorth`, `BudgetGoal`, `DebtLent`, `RecurringTransaction`, `Expense`; events with `createdBy = userId` together with their participants and event transactions (`transactions` collection rows with those `eventId`s, deleted via the raw collection since two models share the name); finally the `User`.

UI (web profile + Android profile): a "Danger zone" with **Delete account** → dialog explaining permanence and listing what is deleted, password field, destructive confirm. On success: clear the session (token, cached data, offline queue), go to `/login`, toast "Account deleted". Wrong password → inline error.

## 7. Privacy (web only)

`/privacy` page (public, no auth guard): Privacy Policy (what we collect: name, email, hashed password, financial entries; how used; no selling/sharing; third parties: hosting/DB, AI advice sends aggregated figures only when requested; retention; contact) and a **Data Privacy** section (amount encryption at rest, bcrypt passwords, JWT sessions, device-local caches, how to delete your account and what it removes). Linked from Footer, Menu and signup page. Android profile has a "Privacy policy" row opening `<apiBaseUrl>/privacy` in the external browser.

## 8. Testing

- Dart unit tests for the asset DTO parsing, totals and the 3-series chart data building.
- Web: `npx tsc --noEmit` / `next build`; the series function is pure and covered by a small node check.
- Flutter: `flutter analyze`, `flutter test`, screenshot harness gets the assets screen (fake backend serves assets), then build & install on device.
