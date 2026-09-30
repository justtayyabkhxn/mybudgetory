# MyBudgetory Flutter Android App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Flutter Android app in `android/` that reproduces every feature of the MyBudgetory web app against the existing backend, with elastic scrolling, animated transitions and press animations everywhere.

**Architecture:** Feature-first Flutter app (Riverpod 3 state, go_router navigation, Dio HTTP) whose foundation (theme tokens, motion primitives, shared widgets, models, repositories, providers) is built first (Tasks 1–3), after which independent feature modules (Tasks 4–15) are built in parallel by separate agents that only create files inside their own `lib/features/<name>/` folder, and finally the router, deep links, icon, build and tests are integrated (Tasks 16–18).

**Tech Stack:** Flutter 3.47.1 / Dart 3.13, flutter_riverpod 3.4, go_router 18, dio 5, fl_chart 1.2, lucide_icons_flutter 3.1, flutter_animate 4.5, shimmer, shared_preferences, flutter_secure_storage, connectivity_plus, url_launcher, share_plus, path_provider, file_picker, flutter_contacts, app_links, intl, uuid. Android SDK 37, JDK 21 (Android Studio JBR at `C:\Program Files\Android\Android Studio\jbr`), Flutter at `C:\fl\flutter`.

**Spec:** `docs/superpowers/specs/2026-09-21-flutter-android-app-design.md`

## Global Constraints

- Project root is `android/` (Flutter project name `budgetory`, applicationId `app.vercel.mybudgetory.budgetory`). Platform code is `android/android/`.
- Environment for every command: `ANDROID_HOME=C:/android`, `JAVA_HOME=C:/Program Files/Android/Android Studio/jbr`, Flutter on PATH from `C:/fl/flutter/bin`.
- Riverpod 3 API only (`Notifier`, `AsyncNotifier`, `NotifierProvider`, `AsyncNotifierProvider`, `Provider`, `FutureProvider`, `StreamProvider`); `StateProvider` only via `package:flutter_riverpod/legacy.dart`.
- Icons: `package:lucide_icons_flutter/lucide_icons.dart` → `LucideIcons.<camelCase>`. No Material icons in UI chrome except where Lucide lacks one (`github` → `LucideIcons.code2`).
- Font family name: `BricolageGrotesque` (assets/fonts, weights 300–800). Numbers use `FontFeature.tabularFigures()`.
- All colours come from `context.colors` (AppColors extension). No hard-coded hex outside `core/theme/tokens.dart` and chart palettes that read tokens.
- Every tappable widget is wrapped in `PressScale`. Every scrollable inherits `ElasticScrollBehavior` (BouncingScrollPhysics).
- API base URL: `AppConfig.apiBaseUrl` = `String.fromEnvironment('API_BASE_URL', defaultValue: 'https://mybudgetory.vercel.app')`.
- Money: `formatInr(double)` → `₹1,23,456` (en-IN grouping) used everywhere the web uses `toLocaleString()`.
- Copy (labels, toasts, empty-state text) must match the web source verbatim.
- Feature agents must not edit files outside their `lib/features/<name>/` folder and `test/features/<name>/`. Missing shared behaviour is implemented locally in the feature folder and reported back.
- `flutter analyze` must report no errors in files you touched; `flutter test` must pass.

---

### Task 1: Core foundation — config, theme tokens, typography, motion, scroll, formatters, storage, toast

**Files:**

- Modify: `android/pubspec.yaml` (assets + fonts sections)
- Create: `android/lib/core/config.dart`
- Create: `android/lib/core/theme/tokens.dart`
- Create: `android/lib/core/theme/app_theme.dart`
- Create: `android/lib/core/theme/category_config.dart`
- Create: `android/lib/core/motion/press_scale.dart`
- Create: `android/lib/core/motion/entrance.dart`
- Create: `android/lib/core/motion/transitions.dart`
- Create: `android/lib/core/motion/scroll.dart`
- Create: `android/lib/core/util/format.dart`
- Create: `android/lib/core/util/dates.dart`
- Create: `android/lib/core/storage/prefs.dart`
- Create: `android/lib/core/storage/token_store.dart`
- Create: `android/lib/core/toast/toast.dart`
- Test: `android/test/core/format_test.dart`, `android/test/core/dates_test.dart`

**Interfaces (Produces):**

```dart
class AppConfig { static const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'https://mybudgetory.vercel.app'); static const webOrigin = 'https://mybudgetory.vercel.app'; }
class AppColors extends ThemeExtension<AppColors> { final Color primary, primaryActive, primaryNeutral, primaryPale, onPrimary, onSolid, inkSurface, onInkSurface, negativeOnInk, scrim, ink, inkDeep, body, mute, canvas, canvasSoft, hairline, positive, positiveDeep, warning, warningDeep, warningContent, negative, negativeDeep, negativeDarkest, negativeBg, accentOrange, accentCyan, catFood, catOuting, catClothes, catMedical, catBills, catEntertainment, catTravel, catSmm, catVacation, catOther, backdropInk; static const light, dark; Color category(String name); }
extension ThemeX on BuildContext { AppColors get colors; TextTheme get text; bool get isDark; }
class AppRadius { static const card = 24.0, input = 12.0, tile = 16.0, chip = 8.0; }
class AppTheme { static ThemeData light(); static ThemeData dark(); }
class Categories { static const names = ['Food','Outing','Clothes','Travel','Vacation','Medical','Entertainment','Bills','SMM','Others']; static IconData icon(String name); static Color color(BuildContext, String name); }
class PressScale extends StatefulWidget { PressScale({required child, VoidCallback? onTap, VoidCallback? onLongPress, double scale = 0.96, bool haptic = false, bool enabled = true, HitTestBehavior behavior}); }
class FadeSlideIn extends StatelessWidget { FadeSlideIn({required child, Duration delay = Duration.zero, double offsetY = 16, Duration duration = 350ms}); }
Duration staggerDelay(int index, {int stepMs = 40, int capMs = 300});
Page<T> buildPageTransition<T>({required Widget child, required GoRouterState state, PageTransition kind = PageTransition.slideUp});
enum PageTransition { slideUp, fadeThrough, none }
class ElasticScrollBehavior extends MaterialScrollBehavior { physics => BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()) }
String formatInr(num v, {int decimals = 0});            // 1234567 → "12,34,567"
String fmtK(num v);                                        // ≥1000 → "₹1.2k" else "₹n"
String formatAmount(num v);                                // K / L / Cr like net-worth page
String toIsoDate(DateTime d);                              // YYYY-MM-DD
DateTime? parseIsoDate(String s);
String monthName(int m /*0-11*/, {bool short = false});
bool isSameMonth(DateTime a, DateTime b);
String formatDisplayDate(String iso);                      // "Mon, 5 Jan 2026" (en-IN weekday short)
String formatLongDate(DateTime d);                         // "Monday, 5 January 2026"
class Prefs { static Future<Prefs> init(); String? getString(k); Future<void> setString(k,v); Future<void> remove(k); bool? getBool(k); Future<void> setBool(k,v); }
class TokenStore { Future<String?> read(); Future<void> write(String); Future<void> clear(); }
enum ToastType { success, error, info }
void showToast(BuildContext context, String message, {ToastType type = ToastType.info});
class ToastHost extends StatefulWidget { ToastHost({required child}); }   // wrap MaterialApp builder
```

- [ ] **Step 1: Declare assets and fonts in `pubspec.yaml`** — add under `flutter:` : `assets: [assets/fonts/, assets/images/]` and a `fonts:` entry for family `BricolageGrotesque` with the six TTFs (weights 300,400,500,600,700,800). Copy `public/piggy.png`, `public/img2.png`, `public/img3.png`, `public/event-hero.png`, `public/hero.svg`, `public/hero2.svg`, `public/hero3.svg`, `public/screenshots/charts.png`, `assets/icon.png` into `android/assets/images/`.
- [ ] **Step 2: Write failing tests** for `formatInr`, `fmtK`, `formatAmount`, `toIsoDate`, `parseIsoDate`, `formatDisplayDate`:

```dart
test('formatInr groups en-IN', () { expect(formatInr(1234567), '12,34,567'); expect(formatInr(999), '999'); });
test('fmtK', () { expect(fmtK(1500), '₹1.5k'); expect(fmtK(999), '₹999'); });
test('formatAmount', () { expect(formatAmount(150000), '₹1.5L'); expect(formatAmount(25000), '₹25K'); expect(formatAmount(20000000), '₹2Cr'); expect(formatAmount(-500), '-₹500'); });
test('iso round trip', () { expect(toIsoDate(DateTime(2026,1,5)), '2026-01-05'); expect(parseIsoDate('2026-01-05'), DateTime(2026,1,5)); expect(parseIsoDate('x'), isNull); });
```

- [ ] **Step 3: Run `flutter test test/core` → fails (missing symbols).**
- [ ] **Step 4: Implement tokens.dart** with every light/dark value from `src/app/globals.css` `@theme` and `:root[data-theme="dark"]` blocks (see spec §4), `app_theme.dart` (ColorScheme from tokens, scaffoldBackground = canvasSoft, TextTheme with BricolageGrotesque, InputDecorationTheme with 12px radius and lime focus ring, DialogTheme 24px, BottomSheet 24px top radius, splashFactory NoSplash, pageTransitionsTheme using our transitions), `category_config.dart` (icons: Food→utensils, Outing→briefcase, Clothes→shirt, Travel→plane, Vacation→treePalm, Medical→heartPulse, Entertainment→popcorn, Bills→receiptText, SMM→route, Others/Other→banknoteArrowUp), motion files, format/dates utils, prefs/token store, toast (top-right stack, 24px radius canvas card with icon colour by type, X dismiss, 3.5s progress bar, slide/fade in-out).
- [ ] **Step 5: Run `flutter test test/core` → passes; `flutter analyze` clean.**
- [ ] **Step 6: Commit** `feat(android): core foundation (theme, motion, utils, storage, toast)`.

### Task 2: Data layer — models, API client, repositories, providers, offline queue

**Files:**

- Create: `android/lib/core/network/api_client.dart`
- Create: `android/lib/data/models/{transaction,recurring_transaction,debt_lent_entry,budget_goal,net_worth,user_profile,event,participant,pending_transaction}.dart`
- Create: `android/lib/data/repositories/{auth_repo,transactions_repo,recurring_repo,debt_lent_repo,budget_goals_repo,networth_repo,ai_repo,events_repo,user_repo}.dart`
- Create: `android/lib/data/providers.dart`
- Create: `android/lib/data/offline_sync.dart`
- Test: `android/test/data/models_test.dart`, `android/test/data/offline_queue_test.dart`, `android/test/data/transactions_repo_test.dart` (Dio mocked via `mocktail` + `DioAdapter`-less approach: inject `Dio` with `HttpClientAdapter` stub)

**Interfaces (Produces):**

```dart
class ApiException implements Exception { final String message; final int? statusCode; }
class ApiClient { ApiClient({required TokenStore tokenStore, required void Function() onUnauthorized, Dio? dio}); Future<Map<String,dynamic>> getJson(path,{query}); Future<dynamic> get(path); Future<dynamic> post(path,{body}); Future<dynamic> patch(path,{body}); Future<dynamic> delete(path,{body}); }
class Transaction { final String id,title,category,comment,paymentMode; final double amount; final TxType type; final DateTime date; factory fromJson; toJson; copyWith; bool get isExpense; }
enum TxType { income, expense }
class TransactionForm { title, amount(String), category, type, date(YYYY-MM-DD), comment, paymentMode; toJson }
class RecurringTransaction {id,title,amount,category,type,paymentMode,frequency('daily'|'weekly'|'monthly'),nextDate,isActive}
class DebtLentEntry {id,type('debt'|'lent'),person,amount,paidAmount,reason?,dateAdded,dueDate?,status('pending'|'cleared')}
class BudgetGoal {id,category,limitAmount,month,year}
class NetWorthSnapshot {date,balance,estimated}  class NetWorthData {bankBalance, history}
class UserProfile {id,name,email}
class PendingTransaction {id, form, queuedAt}
// repos
AuthRepo.login(email,pw)->String token; signup(name,email,pw); logout()
TransactionsRepo.list(); getById(id); create(TransactionForm); update(id, Map patch); delete(id); deleteAll(); import(List<Map>);
RecurringRepo.list(); create(map); patch({id,isActive?,nextDate?}); delete(id)
DebtLentRepo.list(); create(map); delete(id); clear(id); pay(id, amount)
BudgetGoalsRepo.list(month,year); upsert(category,limit,month,year); delete(category,month,year)
NetWorthRepo.get(); update(newBalance); snapshot() -> {filled}
AiRepo.advice(Map payload)->String; networthAdvice(bankBalance, monthlyData)->({advice,healthScore,healthReason})
EventsRepo.create(map)->id; list(); addParticipant(name,eventId)
UserRepo.profile(); updatePassword(email,old,new)
// providers
final prefsProvider = Provider<Prefs>((_) => throw UnimplementedError()); // overridden in main
final tokenStoreProvider = Provider<TokenStore>
final apiClientProvider = Provider<ApiClient>
final authProvider = NotifierProvider<AuthNotifier, AuthState>   // AuthState{String? token; bool get isLoggedIn}; login(); signup(); logout(); setToken()
final themeModeProvider = NotifierProvider<ThemeModeNotifier, ThemeMode>  // toggle(), set(mode); persisted key 'budgetory-theme'
final privacyModeProvider = NotifierProvider<PrivacyNotifier, bool>      // default true; key 'privacyMode'
final isOnlineProvider = StreamProvider<bool>
final offlineQueueProvider = NotifierProvider<OfflineQueueNotifier, List<PendingTransaction>> // enqueue(form), dequeue(id), clear(); key 'pendingTransactions'
final transactionsProvider = AsyncNotifierProvider<TransactionsNotifier, List<Transaction>> // refresh(); Future<void> add(TransactionForm) (offline→queue, online→create + balance adjust); update(id, patch)->Transaction; delete(id); deleteAll(); importAll(list)
final profileProvider = FutureProvider<UserProfile>
final <name>RepoProvider for every repo
final offlineSyncProvider = Provider<OfflineSync> // start() listens to isOnline and flushes queue; toasts via callback
```

- [ ] **Step 1: Write model tests** (amount as `"120.5"` string and as number both parse; missing paymentMode → "UPI"; `toJson` round trip; `PendingTransaction` JSON round trip).
- [ ] **Step 2: Run → fail. Step 3: Implement models + ApiClient (Dio, 30 s timeouts, bearer interceptor, 401 → onUnauthorized + throw ApiException('Unauthorized',401), error body `error`/`message` extraction).**
- [ ] **Step 4: Write offline queue test** (enqueue adds id + queuedAt, dequeue removes, persisted through Prefs fake) and repo test (list decodes `{transactions:[...]}`; create posts JSON with amount string). Implement repos, providers, OfflineSync (`flushQueue()` stops on first failure, returns synced count).
- [ ] **Step 5: `flutter test test/data` passes; analyze clean. Commit `feat(android): data layer, repositories, providers, offline queue`.**

### Task 3: Shared widgets, app shell, router skeleton, bootstrap

**Files:**

- Create: `android/lib/shared/widgets/{app_scaffold,app_header,page_title_row,menu_drawer,bottom_nav,floating_add_button,app_footer,money_backdrop,app_card,app_button,icon_circle_button,segmented_toggle,inset_field,amount_field,app_date_picker,month_picker,category_picker,category_chip,payment_mode_chip,badge,stat_tile,confirm_dialog,app_bottom_sheet,skeletons,count_up,gauges,empty_state,theme_toggle}.dart`
- Create: `android/lib/shared/widgets/widgets.dart` (barrel export)
- Create: `android/lib/router/app_router.dart` (all routes registered; feature screens referenced by fixed class names; until features exist, placeholder screens live in `lib/router/placeholders.dart` and are replaced in Task 16)
- Create: `android/lib/app.dart`, modify `android/lib/main.dart`
- Test: `android/test/shared/press_scale_test.dart`, `android/test/app_smoke_test.dart`

**Interfaces (Produces):** exactly the widget API in spec §7. Route → screen class contract that feature tasks must export:

| Path                                   | Screen class (file)                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/`                                    | `LandingScreen` (features/landing/landing_screen.dart)                                                       |
| `/features`                            | `FeaturesScreen` (features/landing/features_screen.dart)                                                     |
| `/daily-tracker`                       | `DailyTrackerScreen` (features/landing/daily_tracker_screen.dart)                                            |
| `/event-budget`                        | `EventBudgetScreen` (features/landing/event_budget_screen.dart)                                              |
| `/event-dashboard`                     | `EventDashboardScreen` (features/landing/event_dashboard_screen.dart)                                        |
| `/login`                               | `LoginScreen` (features/auth/login_screen.dart)                                                              |
| `/signup`                              | `SignupScreen` (features/auth/signup_screen.dart)                                                            |
| `/dashboard`                           | `DashboardScreen` (features/dashboard/dashboard_screen.dart)                                                 |
| `/transactions`                        | `TransactionsScreen` (features/transactions/transactions_screen.dart)                                        |
| `/transactions/:id`                    | `TransactionDetailScreen(id)` (features/transactions/transaction_detail_screen.dart)                         |
| `/expenses`                            | `FilteredTransactionsScreen(type: TxType.expense)` (features/transactions/filtered_transactions_screen.dart) |
| `/inflow`                              | `FilteredTransactionsScreen(type: TxType.income)`                                                            |
| `/advanced-search`                     | `AdvancedSearchScreen` (features/transactions/advanced_search_screen.dart)                                   |
| `/calendar`                            | `CalendarScreen` (features/calendar/calendar_screen.dart)                                                    |
| `/budget-goals`                        | `BudgetGoalsScreen` (features/budget_goals/budget_goals_screen.dart)                                         |
| `/recurring`                           | `RecurringScreen` (features/recurring/recurring_screen.dart)                                                 |
| `/debt-lent`                           | `DebtLentScreen` (features/debt_lent/debt_lent_screen.dart)                                                  |
| `/net-worth`                           | `NetWorthScreen` (features/net_worth/net_worth_screen.dart)                                                  |
| `/charts`, `/advanced-charts`→redirect | `ChartsScreen` (features/charts/charts_screen.dart)                                                          |
| `/stats`                               | `StatsScreen` (features/charts/stats_screen.dart)                                                            |
| `/split`                               | `SplitScreen` (features/split/split_screen.dart)                                                             |
| `/split/summary/:encoded`              | `SplitSummaryScreen(encoded)` (features/split/split_summary_screen.dart)                                     |
| `/profile`                             | `ProfileScreen` (features/profile/profile_screen.dart)                                                       |

Also exported by Task 4 for reuse by others: `AddTransactionForm({VoidCallback? onAdded, bool inSheet})`, `showAddTransactionSheet(context, {onAdded})`, `showEditTransactionModal(context, Transaction) -> Future<Transaction?>`, `TransactionRow(tx, {onEdit, onDelete, dense})` in `features/transactions/widgets/`.

- [ ] **Step 1: PressScale widget test** (pump, `TestGesture.down` → transform scale < 1; up → returns to 1).
- [ ] **Step 2: Implement all widgets** per spec §7 (MenuDrawer sections/colours from `Menu.tsx`; BottomNav tabs `Home/Calendar/Txns/Charts/Profile` with animated pill; AppDatePicker popover with month grid, Today/Clear footer, min/max; CategoryPicker dropdown = 2-column popover; CountUp digit roller; gauges as CustomPainter reproducing `SpeedometerGauge`/`HealthGauge` SVG geometry).
- [ ] **Step 3: app.dart** — `MaterialApp.router` with `scrollBehavior: ElasticScrollBehavior()`, themes, `themeMode` from provider, `builder` wrapping `ToastHost` + `MoneyBackdrop` stack. `main.dart` — `WidgetsFlutterBinding`, `Prefs.init()`, `ProviderScope(overrides:[prefsProvider.overrideWithValue(prefs)])`, start `offlineSync`, `SystemChrome` edge-to-edge with transparent bars.
- [ ] **Step 4: app_router.dart** — GoRouter with `refreshListenable` from auth, redirect rules (spec §3.3), every route using `buildPageTransition`, bottom-nav routes using `fadeThrough`, `/advanced-charts` redirect, placeholders wired.
- [ ] **Step 5: Smoke test:** app boots to `/` with no token; `flutter test` green; `flutter build apk --debug` succeeds. Commit `feat(android): shared widgets, app shell, router`.

### Tasks 4–15: Feature modules (parallel; each agent owns one folder)

Every feature task follows the same steps: (1) read the listed web source files, (2) write unit tests for the pure math the screen depends on (into `test/features/<name>/`), (3) implement screens/widgets using only the foundation API above, (4) `flutter analyze lib/features/<name>` clean, `flutter test test/features/<name>` green, (5) report the exact exported class names. Each screen uses `AppScaffold` (header + `PageTitleRow` + body + footer + bottom nav) and reads transactions from `transactionsProvider`.

- [ ] **Task 4 — Transactions** (`lib/features/transactions/`): sources `src/components/AddTransactionForm.tsx`, `EditTransactionModal.tsx`, `src/app/transactions/page.tsx`, `transactions/[id]/page.tsx`, `FilteredTransactionsPage.tsx`, `advanced-search/page.tsx`, `FloatingTransactionButton.tsx`. Deliver: `AddTransactionForm`, `showAddTransactionSheet`, `showEditTransactionModal`, `TransactionRow`, `TransactionsScreen`, `TransactionDetailScreen`, `FilteredTransactionsScreen`, `AdvancedSearchScreen`, CSV export util (`buildCsv(List<Transaction>)` tested) + share via `share_plus`. Spec §6.4.
- [ ] **Task 5 — Dashboard** (`lib/features/dashboard/`): sources `dashboard/page.tsx`, `DashboardInsights.tsx`, `MonthEndReview.tsx`, `AIAdviceBanner.tsx`, `MonthlyReport.tsx`, `CountUp.tsx`. Deliver `DashboardScreen`, `SpendingPaceCard`, `DashboardInsights`, `MonthEndReview`, `AiAdviceBanner`, `MonthlyReportCard` with image export. Tests: `insights_math_test.dart` (health score, streak, digest best/worst, month-end stats, weekly/monthly payload builders). Uses Task 4's `AddTransactionForm`, `showEditTransactionModal`, `TransactionRow` (if Task 4 is not finished yet, import path is fixed: `package:budgetory/features/transactions/widgets/add_transaction_form.dart` etc.). Spec §6.3.
- [ ] **Task 6 — Calendar** (`lib/features/calendar/`): source `calendar/page.tsx`. Deliver `CalendarScreen`, `WeeklyRhythmCard` (sparkline CustomPainter). Tests: heat tier function, weekly rhythm aggregation. Spec §6.5.
- [ ] **Task 7 — Budget goals** (`lib/features/budget_goals/`): source `budget-goals/page.tsx`. Deliver `BudgetGoalsScreen`. Tests: progress colour/badge thresholds. Spec §6.6.
- [ ] **Task 8 — Recurring** (`lib/features/recurring/`): source `recurring/page.tsx`. Deliver `RecurringScreen`. Tests: `advanceNextDate`. Spec §6.7.
- [ ] **Task 9 — Debt & Lent** (`lib/features/debt_lent/`): source `debt-lent/page.tsx`. Deliver `DebtLentScreen`, `EntryCard`. Tests: totals, overdue, WhatsApp message builder. Spec §6.8.
- [ ] **Task 10 — Net worth** (`lib/features/net_worth/`): source `net-worth/page.tsx`. Deliver `NetWorthScreen` with fl_chart line/bar, zoom, table, fullscreen, AI advisor. Tests: `getMonthlyData`, `getAvgMonthlyDelta`, milestones, range filtering, projection points. Spec §6.9.
- [ ] **Task 11 — Charts + Stats** (`lib/features/charts/`): sources `charts/page.tsx`, `Charts.tsx`, `utils/chartOptions.ts`, `stats/page.tsx`. Deliver `ChartsScreen`, `StatsScreen`, `SpendingHeatmap`, `ChartCard`, `ChartTabs`, one widget per chart. Tests: aggregation helpers (daily/monthly/category/cumulative/savings rate/day-of-week/week-of-month/rolling-30/avg size, stats page math). Spec §6.10.
- [ ] **Task 12 — Split** (`lib/features/split/`): sources `split/page.tsx`, `split/summary/[encoded]/page.tsx`, `GetStarted.tsx`. Deliver `SplitScreen`, `SplitSummaryScreen`. Tests: encode/decode round trip, share rounding. Spec §6.11.
- [ ] **Task 13 — Profile** (`lib/features/profile/`): source `profile/page.tsx`. Deliver `ProfileScreen` (export/import/delete-all/change password). Tests: `getInitials`, `formatCurrency` (k/L), import validation filter. Spec §6.12.
- [ ] **Task 14 — Auth** (`lib/features/auth/`): sources `login/page.tsx`, `signup/page.tsx`. Deliver `LoginScreen`, `SignupScreen`. Widget test: login renders fields and submit. Spec §6.2.
- [ ] **Task 15 — Landing/marketing + event** (`lib/features/landing/`): sources `page.tsx`, `features/page.tsx`, `daily-tracker/page.tsx`, `event-budget/page.tsx`, `event-dashboard/page.tsx`, `CreateEvent.tsx`, `Footer.tsx`. Deliver the five screens. Spec §6.1.

### Task 16: Router integration, deep links, launcher icon, manifest permissions

**Files:** Modify `android/lib/router/app_router.dart` (replace placeholders with real screens), delete `placeholders.dart`; modify `android/android/app/src/main/AndroidManifest.xml` (INTERNET, READ_CONTACTS, intent filters for `https://mybudgetory.vercel.app/split/summary/*` and `budgetory://`, `queries` for `https`, `whatsapp`, `upi`), `android/android/app/build.gradle.kts` (minSdk 23), launcher icon from `assets/icon.png` via `flutter_launcher_icons` (dev dep) with adaptive background `#E8EBE6`, app label "Budgetory", splash background `#E8EBE6` (light) / `#0E0F0C` (dark) in `styles.xml`.

- [ ] Wire, run `flutter analyze` (whole project) and fix every error/warning that originates in `lib/`.
- [ ] Commit `feat(android): wire all features, deep links, launcher icon`.

### Task 17: Full verification

- [ ] `flutter test` (all) green.
- [ ] `flutter build apk --debug` and `flutter build apk --release` succeed; record APK paths and sizes.
- [ ] If an emulator can be created (`avdmanager create avd -n budgetory -k "system-images;android-34;google_apis;x86_64"`) and boots, run the app and screenshot landing, login, dashboard.
- [ ] Commit any fixes.

### Task 18: Docs

- [ ] `android/README.md`: how to run/build, API base override, feature parity table (web route → app screen), known Android-specific adaptations (contact picker permission; CSV/JSON export via share sheet).
- [ ] Update root `README.md` with an "Android app (Flutter)" section pointing at `android/`.
- [ ] Commit `docs: android app readme`.
