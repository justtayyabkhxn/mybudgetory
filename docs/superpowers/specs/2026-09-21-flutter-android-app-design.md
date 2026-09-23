# MyBudgetory — Flutter Android App Design

Date: 2026-09-21
Status: approved by user in the original request ("make flutter android app of this having each and every feature no exceptions … don't stop until you're done")

## 1. Goal

Build a native Android app in Flutter that reproduces **every feature** of the MyBudgetory Next.js web app, living entirely in the `android/` folder of this repository. The app talks to the **existing deployed backend** (`https://mybudgetory.vercel.app/api/*`), so no server changes are needed. It must feel native and polished: elastic (bouncing) scroll everywhere, animated page transitions, press animations on every tappable control, staggered entrance animations, skeleton loaders, toasts, light and dark theme.

## 2. Non-goals

- No changes to the Next.js code or the backend.
- No iOS target (project is created with `--platforms android` only).
- No new backend features. The web "Event Dashboard" is an "Under Development" placeholder on the web; the app reproduces that plus the existing `CreateEvent` wizard since the API for it exists.

## 3. Architecture

```
android/                       # Flutter project root (this IS the Android app)
  pubspec.yaml
  assets/fonts/                # Bricolage Grotesque (bundled)
  assets/images/               # piggy, hero svgs (as PNG/SVG), icon
  lib/
    main.dart                  # bootstrap: storage init, ProviderScope, runApp
    app.dart                   # MaterialApp.router, theme wiring, scroll behavior, toast overlay
    core/
      config.dart              # API base URL (const from --dart-define, default vercel)
      theme/tokens.dart        # AppColors light/dark (every --color-* token), radii, shadows
      theme/app_theme.dart     # ThemeData builders, TextTheme (Bricolage), ThemeMode provider
      theme/category_config.dart # CATEGORIES, colors, icons (Lucide)
      motion/press_scale.dart  # PressScale — scale-down on press w/ spring
      motion/entrance.dart     # FadeSlideIn + Stagger helpers (flutter_animate)
      motion/transitions.dart  # go_router page transitions (fade + slide-up, shared axis)
      motion/scroll.dart       # ElasticScrollBehavior (BouncingScrollPhysics always)
      network/api_client.dart  # Dio wrapper: base URL, bearer token, 30s timeout, 401 → logout
      storage/prefs.dart       # SharedPreferences wrapper (theme, privacy, caches, split data, offline queue)
      storage/token_store.dart # flutter_secure_storage token
      util/format.dart         # ₹ formatting (en-IN grouping), fmtK, formatAmount (K/L/Cr), date helpers
      util/dates.dart          # month names, isSameMonth, toIso (YYYY-MM-DD), parseIso
      toast/toast.dart         # showToast(context/ref, message, type) + ToastHost overlay
    data/
      models/                  # Transaction, RecurringTransaction, DebtLentEntry, BudgetGoal, NetWorth, UserProfile, Event, Participant
      repositories/            # auth_repo, transactions_repo, recurring_repo, debt_lent_repo, budget_goals_repo, networth_repo, ai_repo, events_repo, user_repo
      providers.dart           # Riverpod providers: apiClient, repos, auth state, transactions (AsyncNotifier), profile, theme, privacy, offline queue
    features/
      landing/                 # "/" landing, "/features", "/daily-tracker", "/event-budget", "/event-dashboard"
      auth/                    # login, signup
      dashboard/               # dashboard + insights + month-end review + AI advice + monthly report
      transactions/            # list, detail, filtered (expenses/inflow), add form, edit modal, advanced search
      calendar/
      budget_goals/
      recurring/
      debt_lent/
      net_worth/
      charts/                  # charts page (heatmap + 19 charts) and stats page
      split/                   # split bills + split summary
      profile/
    shared/widgets/            # AppScaffold, AppHeader (wordmark), PageTitleRow, MenuDrawer, BottomNav, FloatingAddButton,
                               # AppCard, SegmentedToggle, InsetField, AmountField, AppDatePicker, CategoryPicker, CategoryChip,
                               # ConfirmDialog, AppBottomSheet, Skeletons, CountUp, MoneyBackdrop, AppFooter, StatTile, Badge,
                               # SpeedometerGauge, HealthGauge, RaceBar, EmptyState, AppButton (primary/secondary/danger/ghost)
    router/app_router.dart     # GoRouter with all routes, auth redirect, deep link for /split/summary/:encoded
  test/                        # unit tests for format/dates/insights math/offline queue; widget smoke tests
```

### 3.1 State management
- `flutter_riverpod` 3.x. Use `Notifier` / `AsyncNotifier` + `NotifierProvider` / `AsyncNotifierProvider` / `Provider` / `FutureProvider`. `StateProvider` is available from `package:flutter_riverpod/legacy.dart` for trivial UI state.
- One `TransactionsNotifier` (AsyncNotifier<List<Transaction>>) is the single source of truth for transactions across screens; it exposes `refresh()`, `add()`, `update()`, `delete()`, `deleteAll()`, `import()`. Screens derive month filters/insights from it.
- Theme (`ThemeMode`), privacy mode (bool), auth token, and offline queue are Notifiers backed by storage.

### 3.2 Networking
- `Dio` with `baseUrl = AppConfig.apiBaseUrl` (default `https://mybudgetory.vercel.app`), 30s connect/receive timeout, `Authorization: Bearer <token>` interceptor, and a 401 interceptor that clears the token and routes to `/login`.
- Endpoints (exact contracts from `src/app/api`):

| Method | Path | Body / Query | Response |
|---|---|---|---|
| POST | /api/login | {email,password} | {token} / 401 {error} |
| POST | /api/signup | {name,email,password} | {msg,user} / 400 {error} |
| POST | /api/logout | – | {msg} |
| GET | /api/user/profile | – | {_id,name,email} |
| POST | /api/user/update-password | {email,oldPassword,newPassword} | {message} (400/404 with message) |
| GET | /api/transactions | – | {transactions:[…]} sorted date desc |
| POST | /api/transactions | {title,amount(string or number),category,type,date(ISO),comment,paymentMode} | 201 {transaction} |
| DELETE | /api/transactions | – | {message} (deletes ALL) |
| GET | /api/transactions/:id | – | {success,transaction} |
| PATCH | /api/transactions/:id | partial {title,amount,category,type,date,comment,paymentMode} | {success,transaction} |
| DELETE | /api/transactions/:id | – | {success} |
| POST | /api/transactions/import | JSON array (max 1000) of {title,amount:number,category,type,date,comment?,paymentMode?} | 201 {message} |
| GET | /api/budget-goals?month=M&year=Y | month 0-11 | {goals:[{_id,category,limitAmount,month,year}]} |
| POST | /api/budget-goals | {category,limitAmount,month,year} | {goal} (upsert) |
| DELETE | /api/budget-goals | {category,month,year} | {success} |
| GET | /api/recurring | – | {recurring:[{_id,title,amount:number,category,type,paymentMode,frequency,nextDate,isActive}]} |
| POST | /api/recurring | {title,amount,category,type,paymentMode,frequency,nextDate} | 201 {recurring} |
| PATCH | /api/recurring | {id, isActive? , nextDate?} | {recurring} |
| DELETE | /api/recurring?id= | – | {success} |
| GET | /api/debt-lent | – | array of entries {_id,type,person,amount,paidAmount,reason?,dateAdded,dueDate?,status} |
| POST | /api/debt-lent | {person,amount,type,dueDate?,reason?} | 201 {entry} |
| DELETE | /api/debt-lent | {id} | deleted entry |
| PATCH | /api/debt-lent/clear | {id} | updated entry |
| PATCH | /api/debt-lent/pay | {id,amount} | updated entry (paidAmount,status) |
| GET | /api/networth | – | {bankBalance, history:[{date,balance,estimated?}]} sorted asc |
| POST | /api/networth/update | {newBalance, paymentMode?} | {bankBalance,message} |
| POST | /api/networth/snapshot | – | {date,balance,filled} |
| POST | /api/ai/advice | weekly or monthly payload (see AIAdviceBanner) | {advice} |
| POST | /api/ai/networth-advice | {bankBalance, monthlyData:[{month,balance,delta}]} | {advice,healthScore,healthReason} |
| POST | /api/create-event | {name,type,date,description} | {event} |
| GET | /api/events | – | {events} |
| POST | /api/participant | {name,eventId,color?} | 201 {participant} |

- Adding a transaction (online) mirrors the web: POST transaction, then GET /api/networth and POST /api/networth/update with `newBalance = bankBalance ± amount`.
- Offline: if no connectivity, the add form enqueues the transaction locally (`pendingTransactions` in prefs) and shows the offline badge; an `OfflineSync` service flushes the queue when connectivity returns (stop on first failure), toasting "N offline transaction(s) synced!".

### 3.3 Auth
- Token stored in secure storage. Router `redirect`: protected routes go to `/login` when no token; `/login` and `/signup` go to `/dashboard` when a token exists. The JWT is decoded locally (base64 payload) to validate shape like `useAuthGuard`.
- Logout: POST /api/logout (ignore failure), clear token, go to `/login`.

## 4. Design language (port of DESIGN.md)

- Colors: every `--color-*` token from `globals.css` for light and dark as `AppColors` (primary #9fe870, primaryActive, primaryPale, onPrimary #163300, ink, inkDeep, body, mute, canvas, canvasSoft, hairline, positive, positiveDeep, warning, warningDeep, warningContent, negative, negativeDeep, negativeDarkest, negativeBg, inkSurface, onInkSurface, negativeOnInk, scrim, onSolid, accentOrange, accentCyan, cat* ×10, backdropInk). Exposed via `Theme.of(context).extension<AppColors>()` and a `context.colors` extension.
- Typography: Bricolage Grotesque bundled (weights 300–800). Display 900/800 tight tracking, section headings 18/900, eyebrows 10–12px bold uppercase wide tracking, body 14, numbers tabular (`FontFeature.tabularFigures()`).
- Radii: cards/sheets/buttons 24, inputs/chips 12, icon tiles 16, pills full.
- Elevation flat; surface contrast is the elevation. Dark mode heavier shadows.
- Lime is only for actions/focus/selection, never data marks. Income = positive green, expense = negative red, UPI = ink/primary tint, Cash = warning tint. Categories use the cat-* scale.
- Money always `₹` with en-IN grouping.

### 4.1 Motion requirements (from the user's request)
- **Elastic scroll**: global `ScrollBehavior` returning `BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics())` for every scrollable, including in Android.
- **Page transitions**: go_router `CustomTransitionPage` — push = fade + slide up 24px + scale 0.98→1 with `Curves.easeOutCubic` 320ms; pop reverses; bottom-nav tab switches use a fade-through (fade + subtle vertical slide) 220ms. Modals/sheets: slide up with spring-like `Curves.easeOutBack`-lite; dialogs scale 0.92→1 + fade 220ms.
- **Button click animations**: `PressScale` wraps every tappable (buttons, cards, list rows, chips, nav items, calendar cells): scales to 0.96 (0.92 for icon buttons, 0.98 for large cards) on pointer down with `Curves.easeOutCubic` 90ms, springs back 200ms; also plays a subtle haptic (`HapticFeedback.lightImpact`) on primary actions.
- **Entrance**: cards fade+slide 16px on mount 300–400ms; lists stagger 25–50ms per item (cap 300ms); expand/collapse uses `AnimatedSize`/`AnimatedSwitcher` 200–250ms; month names cross-fade+slide; toasts slide in from top; bottom-nav active pill animates position with a spring (stiffness ~380, damping ~30 equivalent → `Curves.elasticOut` 450ms or `SpringSimulation`).
- **Count-up**: digit slot-machine roller matching `CountUp.tsx` (3 cycles, expo-out easing, left-to-right stagger).
- Reduced motion: respect `MediaQuery.disableAnimations` by collapsing durations.

## 5. Navigation model

- Mobile-only layout (no DesktopNav). Every authenticated page has: top `AppHeader` (wordmark "MyBudgetory." with lime full stop + tagline row with CreditCard/ScrollText icons), a `PageTitleRow` (colored Lucide icon + title + optional action buttons + `MenuButton`), content, `AppFooter`, and the fixed `BottomNav` (Home, Calendar, Txns, Charts, Profile) with animated lime pill.
- `MenuButton` (lime round button, icon rotates 90° to X) opens a right-side drawer (spring slide) with sections Finance / Analytics / Tools / Account exactly as `Menu.tsx`, section dot colors, stagger animation, Sign Out and theme toggle in the footer.
- `FloatingAddButton` (lime FAB, plus rotates 45° when open) opens the Add Transaction bottom sheet on transactions, expenses, inflow, recurring, net-worth, charts, stats pages.
- Theme toggle: floating top-left on pages without a menu (auth/landing), inline in drawer otherwise.
- Routes (paths mirror the web):
  `/`, `/features`, `/daily-tracker`, `/event-budget`, `/event-dashboard`, `/login`, `/signup`, `/dashboard`, `/transactions`, `/transactions/:id`, `/expenses`, `/inflow`, `/calendar`, `/budget-goals`, `/recurring`, `/debt-lent`, `/net-worth`, `/charts`, `/advanced-charts` (redirect → `/charts`), `/stats`, `/advanced-search`, `/split`, `/split/summary/:encoded`, `/profile`.
- App start: token present → `/dashboard`, else `/login`. (Decision 2026-09-21: the marketing landing page is not shipped in the app; `/features`, `/daily-tracker` and `/event-budget` remain as secondary pages.)
- Deep links: Android intent filter for `https://mybudgetory.vercel.app/split/summary/*` (autoVerify false) and custom scheme `budgetory://`.

## 6. Feature specifications (parity checklist)

Each item below must exist in the app. Feature agents read the referenced web file for exact copy, math, and states.

### 6.1 Landing & marketing (`features/landing`)
- `/` = `src/app/page.tsx`: pill badges (Free Forever pulse dot, Open Source, No Credit Card), hero "Track. Budget. Save.", Features & Dashboard buttons, checklist row, hero illustration (`hero.svg` → bundle as asset), sections: Why (3 cards), How it works (3 steps), Charts & Analytics (illustration + 4 rows + link), All features grid (11 tiles → routes), Choose your mode (2 cards → `/daily-tracker`, `/event-budget`), Our promise (4), Testimonials (3), Open source card (button opens GitHub URL), Final CTA dark ink-surface card (Create Free Account → /signup, Start Daily Tracking, Plan an Event), Footer. Sections reveal on scroll (fade+slide).
- `/features` = `features/page.tsx`: hero, 11 feature cards with bullets and "Open" links, charts deep-dive (screenshot asset `screenshots/charts.png` in a browser-chrome frame + 5 rows), category showcase chips (all CATEGORY_ICONS), Why (4), CTA.
- `/daily-tracker` = `daily-tracker/page.tsx`: hero with `img3.png` piggy, Start Managing (scrolls to CTA), 6 feature cards, `img2.png` preview, How it works (3), testimonials (2), USPs (6), FAQ accordion (3, animated expand), final CTA → /dashboard, footer.
- `/event-budget` = `event-budget/page.tsx`: hero with `event-hero.png`, Start Planning (scroll), Why (6 cards, colored icon circles), How it works (3), CTA → `/event-dashboard`, both footers.
- `/event-dashboard`: "📅 MyBudgetory" title link, "Under Development" heading, Go Home; plus the `CreateEvent` 2-step wizard (event name/type/date/description → POST /api/create-event, then N participant names → POST /api/participant each; success message; reset).

### 6.2 Auth (`features/auth`)
- Login (`login/page.tsx`): header, card with email + password (show/hide), focus glow styling, Forgot password link (no-op route → toast "Coming soon"), error box, submit with spinner "Signing in…", "Create one free →" link. Success stores token and goes to `/dashboard`. Fade-up staggered entrance.
- Signup: name, email, password (min 8 hint), Terms text, "Sign in →". Success → `/login`. Right-panel branding content (perks list + fake bill split preview) shown *below* the form on mobile as a decorative card.

### 6.3 Dashboard (`features/dashboard`) — `dashboard/page.tsx` + components
- Title row: FileDigit icon, "Dashboard", refresh (spins while loading), privacy eye toggle, "Welcome back 🤘, {name}", MenuButton.
- Hero card: "{Month} {Year}", savings badge "{rate}% saved" (green/red); 3 stat tiles Income (→/inflow), Expenses (+ "today ₹x") (→/expenses), Savings; CountUp animations; privacy mask "₹ ******"; "x% of this month's income spent" progress bar (green/warning/red thresholds 0.65/0.9) animated width.
- Add Transaction form (inline card, see 6.4).
- MonthEndReview (days 1–3 of month, needs last-month data): Autopsy card (dismissible) with computed sentences; Review carousel of 5 cards (Biggest Win, Biggest Fail, Surprise, Streak, Next Month Focus) with dot indicators, prev/next, directional slide animation.
- Recent Transactions card: 5 most recent rows (category icon tile, title, date • category • paymentMode, comment, amount ±, edit + delete icon buttons), skeleton rows while loading, "See All Transactions" link.
- SpendingPaceCard: daily rate, projected month-end, remaining at rate, status pill (critical/warning/on-track), RaceBar ×2 (time elapsed vs budget consumed), over-pacing note, HealthGauge (score formula from DashboardInsights.tsx) with savings rate/streak bonus rows, Streak counter with emoji (✨ ≥3, 🔥 ≥7) and dots.
- AIAdviceBanner: Monthly card on days 1–3, Weekly card on Mondays; cached in prefs by key; fetch POST /api/ai/advice with the same payload builders; loading/error/retry; dismiss; footer pulse dot text.
- DashboardInsights: Weekly Digest (total spent, income, best day, worst day, heaviest category) and What-If card (10/20/30/50% cut selector, top 4 categories → annual savings).
- MonthlyReport: report card (income, expenses, net savings, savings rate, txn count, top 3 categories, biggest expense, footer) and "Export as Image" → renders card via RepaintBoundary to PNG and opens share sheet (also saved to app documents).
- Delete confirm dialog and Edit modal shared with transactions.

### 6.4 Transactions (`features/transactions`)
- **AddTransactionForm** (used inline on dashboard and inside the FAB bottom sheet): type segmented toggle (Expense/Income), date picker, payment toggle (UPI/Cash), amount field with ₹ prefix colored by type, title, category dropdown (expense only; 2-column popover menu with check), Note toggle + comment field (animated), submit button states (Adding…/Added!/Add Expense|Income), validation (>0, ≤1 crore), offline badge + queue, success toast, balance update.
- **EditTransactionModal**: dialog (scale-in) with accent strip, type/payment toggles, amount, title, category pills (expense only), date picker, note toggle, Save Changes with spinner; PATCH; toast.
- **Transactions list** (`transactions/page.tsx`): summary bar (Income/Expenses/Net of filtered), search (title/comment, clearable), type pills All/Income/Expense, sort menu (Newest/Oldest/Highest/Lowest), Filter (→ /advanced-search), Export CSV (share sheet + save), date-grouped list with day totals, row with category tile, chips (category, paymentMode), comment, amount, edit/delete, pagination (20/page, numbered with ellipsis, Prev/Next), "Showing a–b of n", empty states (no txns → Go to Dashboard; no matches → Clear Filters), skeletons, FAB, confirm dialog.
- **Transaction detail** (`transactions/[id]`): Back row, hero card (blurred glow, category tile, title, category, big amount, type badge), detail rows (Date long format, Category badge, Payment Mode badge, Note), Edit/Delete buttons, error state "Transaction not found" + Back to Transactions.
- **Expenses / Inflow** (`FilteredTransactionsPage`): current-month filtered view, summary bar "{Month} Total" + count, "This Month" list with edit/delete, empty state with Add Transaction, FAB.
- **Advanced Search** (`advanced-search/page.tsx`): search bar, Filters toggle with active count badge, type pills, sort dropdown, expandable filter panel (Month picker YYYY-MM, From/To date pickers clearable, Category chips incl. All, Clear All, Done), active filter chips (removable), summary stats (Results/Income/Expenses/Net), Export CSV, results list (tap → detail), empty state, scroll-to-top FAB, skeletons.

### 6.5 Calendar (`features/calendar`)
- Month navigator with animated month name, "← Back to today"; month stats (Income/Expenses/Net); 7-col grid with heat tiers (<300 green, <700 yellow, <1500 orange, else red), today pill, selected ring, income dot, amount label (k format), spend bar (animated width relative to max day); legend; day detail panel (weekday eyebrow, date title, expense/income pills, close, transaction list → detail, empty state); Weekly Rhythm card (7 columns: avg by weekday, sparkline polyline of last 8 occurrences via CustomPainter, bar, avg label, count).

### 6.6 Budget Goals (`features/budget_goals`)
- Total overview card (spent, limit, utilization %, SpeedometerGauge, remaining); 9 category cards (ALL_CATEGORIES list from page) with badge (Over Budget!/Warning/On Track), gauge + % + Spent/Limit/Remaining rows, inline Set/Edit Limit input with Save/×, Remove. Skeleton grid.

### 6.7 Recurring (`features/recurring`)
- Summary chips (active count, monthly outflow), Add New toggle (expand form: title, amount, type, payment, frequency, category chips, next date, submit), list cards (accent bar by type, category tile, title, meta, Next date, amount, Log Now, Pause/Resume, Delete), inactive at 55% opacity, empty state, confirm delete, FAB. Log Now posts a transaction with comment "Recurring (freq)" then PATCHes nextDate advanced by frequency.

### 6.8 Debt & Lent (`features/debt_lent`)
- Summary cards (You are owed / You owe = pending remaining), Add Entry toggle form (I Lent Money / I Owe Money, person, amount, due date optional clearable, reason), Pending and Cleared sections, EntryCard (avatar initial, "You lent/owe {person}", Cleared/Overdue badges, date • Due, reason, partial payment progress bar + "% settled", amount + "₹x left", actions: Log payment (inline form with max), WhatsApp reminder (url_launcher `https://wa.me/?text=…` with the exact message), Mark cleared (confirm), Delete (confirm)).

### 6.9 Net Worth (`features/net_worth`)
- Header with refresh; Bank Balance card with inline edit (autofocus, ✓ save / × cancel, Enter/Escape), Assets placeholder "₹0 Coming soon", Total Net Worth with ▲/▼ % this month; quick stats strip (All-time high, Total growth, Best month, Avg/month) using `formatAmount` (K/L/Cr); Health Score card (AI, ring gauge) + Next Milestone card (progress, ETA months); chart toolbar: range pills 3M/6M/YTD/1Y/All, Update chart (POST snapshot; toast with filled days), Projection toggle, table/chart toggle, fullscreen toggle; Balance History card (₹ balance, range change pill, subtitle, fl_chart line with per-segment green/red coloring, gradient fill, last point marker, peak label, dashed projection series, tap tooltip with crosshair, pinch/drag zoom on x with Reset, "~est" rows in table view), projection footer; Monthly Change bar card (last 12 deltas, colored, tooltip) + last 3 months summary; empty state with "Record today's balance"; AI Net Worth Advisor card (generate/refresh/cached weekly key/error).

### 6.10 Charts & Stats (`features/charts`)
- Charts page: title, hero stats (Income, Expenses with CountUp, month selector chip with prev/next (next disabled at current month) + "Back to current", Savings, Saved %), Spending Heatmap (GitHub-style year grid, horizontally scrollable, month labels, weekday labels, 6-step ramp, total/days, legend, tap shows tooltip), then charts in the same order/grouping as `Charts.tsx` using fl_chart: Income vs Expenses donut; Cash vs UPI donut; Daily bar (income/expense); Monthly overview bars; Cumulative tab group (Income vs Expenses cumulative line with savings dashed + zoom/reset, Spending This Month cumulative+daily); Savings tab group (Rate % line with zero-line fill coloring, Net Amount bars); Day-of-week bars; Categories tab group (This Month horizontal bars, Share donut, This Year horizontal bars, Trends multi-line, vs Last Month grouped bars); Income Sources donut (current month by title); Income Sources Over Time stacked; Cash vs UPI monthly stacked; Week-of-Month bars; Rolling 30-day line; Avg Transaction Size lines. Each in a ChartCard with title/subtitle/badge/accent and a fullscreen toggle (full-screen route/dialog, Escape/back closes). Tooltips on touch. Skeleton cards while loading. FAB.
- Stats page (`stats/page.tsx`): hero (Total Income/Expenses/Net Balance), sections Spending Insights (6 stat cards), Category Breakdown (3), Notable Transactions (3 incl. Top 3 days list). Same math as the page (including its current-month quirks).

### 6.11 Split bills (`features/split`)
- Persisted locally (prefs `split-data`): total amount, description, people (name, phone, paid). Step cards 1–3, focus glow inputs, Import Contact (flutter_contacts picker → name + digits phone), Add Person (validation → toast instead of alert), Clear all (confirm dialog), summary (each owes, pending/paid counts), person rows (avatar, strike-through when paid, Mark as paid toggle, WhatsApp button `https://wa.me/{phone}?text=…` with link `https://mybudgetory.vercel.app/split/summary/{encoded}`, remove). Encoding = base64(JSON{total,name,phone,share,description}) URL-encoded, same as web.
- Summary page `/split/summary/:encoded`: decode/validate, "Shared Expense" card (Hi {name} 👋, description, members, total, your share, Pay Now → `upi://pay?pa=tayyabk2002-1@oksbi&pn=Tayyab%20Khan&am={share}&cu=INR` via url_launcher), GetStarted buttons (open web signup / GitHub), error "Invalid or Corrupt Link".

### 6.12 Profile (`features/profile`)
- Sticky header, avatar initials with green dot, name/email, privacy toggle text, stats (Transactions, Total Income, Total Spent with ₹k/L format, masked), Account Info section, Data Management (Export JSON → save to Downloads via share sheet + "Downloaded!" flash; Import: file picker (.json) → validate → POST import → status; Delete All → modal with typed "delete" confirmation → DELETE /api/transactions), Security (change password ×3 fields with show/hide, status message, Update Password), BottomNav.

## 7. Shared widget API (built first; feature agents consume it)

```dart
// theme
context.colors            // AppColors (all tokens) for current brightness
context.text              // TextTheme
AppRadius.card/input/tile // 24 / 12 / 16
// motion
PressScale({child, onTap, scale = 0.96, haptic = false, enabled = true})
FadeSlideIn({child, delay, offsetY = 16, duration})     // entrance
StaggeredColumn / staggerDelay(index)
// layout
AppScaffold({title row, body slivers or child, showBottomNav = true, showFab = false, onFabAdd, showFooter = true, padding})
AppHeader()                // wordmark + tagline
PageTitleRow({icon, iconColor, title, trailing: [widgets], showMenu = true})
MenuButton()               // opens MenuDrawer
BottomNav(currentPath)
FloatingAddButton({onAdded})
AppFooter()
MoneyBackdrop()            // painted behind pages
// primitives
AppCard({child, padding = 24, color, radius = 24, onTap})
AppButton.primary/secondary/tertiary/danger/ghost({label, icon, onPressed, loading, expand})
IconCircleButton({icon, onTap, bg, fg, size})
SegmentedToggle<T>({options: [(value,label,icon,activeBg,activeFg)], value, onChanged})
InsetField({controller, hint, prefixIcon, suffix, keyboardType, obscure, onChanged, autofocus})
AmountField({controller, accent})   // ₹ prefix, big numbers
AppDatePicker({value (YYYY-MM-DD), onChanged, clearable, placeholder, hideIcon, min, max})  // popover calendar matching DatePicker.tsx
MonthPicker({value 'YYYY-MM', onChanged})
CategoryPicker.dropdown / CategoryPicker.pills({value, onChanged})
CategoryChip(name) / CategoryIconTile(name, size)
PaymentModeChip(mode)
Badge({text, icon, bg, fg})
StatTile({label, value, icon, color, bg, sub})
ConfirmDialog.show(context, {title, message, confirmLabel, danger}) -> Future<bool>
AppBottomSheet.show(context, builder)
showToast(context, message, {type: success|error|info})
SkeletonBox({w,h,radius}) / SkeletonTransactionRow() / SkeletonCard()
CountUp({end, prefix, suffix, style})
SpeedometerGauge({pct, color, size}) / HealthGauge({score}) / RaceBar({label, pct, color, bg})
EmptyState({icon, title, subtitle, action})
```

## 8. Data models
`Transaction {id, title, amount(double), category, type(income|expense), date(DateTime), comment, paymentMode(Cash|UPI)}` parsed defensively (amount may arrive as number or numeric string; paymentMode may be missing → "UPI"). Similar for `RecurringTransaction`, `DebtLentEntry`, `BudgetGoal`, `NetWorthSnapshot`, `UserProfile`, `EventModel`, `Participant`. All models have `fromJson`/`toJson` and are immutable with `copyWith`.

## 9. Error handling
- Repos throw `ApiException(message, statusCode)`; screens show toasts with the server `error`/`message` when present, else a friendly fallback identical to the web copy.
- 401 anywhere → token cleared → `/login` (single redirect, no loops).
- Offline: connectivity_plus stream feeds `isOfflineProvider`; add form queues; other screens show cached data if present and a toast on fetch failure.

## 10. Testing
- Unit tests: formatters (₹ grouping, fmtK, formatAmount), date utils, insights math (health score, streak, digest, month-end stats), offline queue enqueue/dequeue, split encoding round-trip, CSV builder.
- Widget smoke tests: app boots to landing without token; login screen renders; PressScale scales on press.
- Manual/automated: `flutter analyze` clean, `flutter test` green, `flutter build apk --debug` succeeds; run on an emulator and screenshot key screens if an AVD is available.

## 11. Build & run
```
cd android
flutter pub get
flutter run                                   # default API https://mybudgetory.vercel.app
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000   # local Next.js dev server from emulator
flutter build apk --release
```
