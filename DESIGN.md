# MyBudgetory — Design Language

The single source of truth for how MyBudgetory looks and feels. Read this before touching any UI.
Implementation lives in `src/app/globals.css` (tokens, primitives, motion) and `src/app/layout.tsx` (font, theme boot).
The brand reference this system is derived from is `wise/DESIGN.md`; this file describes what the app actually does today.

**Vibe in one line:** a calm, Wise-inspired fintech magazine. Lime CTA, forest-green ink, sage canvas, big rounded white cards, one heavy display face. Confident and quiet, never a neon dashboard.

---

## Hard rules

1. **Tokens only.** Every colour comes from a `--color-*` token in `@theme`. The legacy Tailwind ramps (`gray-*`, `indigo-*`, `emerald-*`, `red-*`, …) are aliased onto these tokens per theme in `globals.css`, so old markup still flips correctly, but new markup must use the semantic names. `white` and `black` are not aliased and are theme-blind. See *Known debt* for the traps.
2. **Two themes, one markup.** Light is the default; dark is `:root[data-theme="dark"]`. The boot script in `layout.tsx` writes `data-theme` before first paint, so never branch on theme in components. Pick a token that already carries the right meaning in both.
3. **Lime is for actions only.** `primary` (#9fe870) belongs to CTAs, active nav, focus rings and selection. It is never a data mark and never a category colour.
4. **Ink is the dark voice.** Dark surfaces (footer band, dark CTA card, scrims) use `ink-surface`, not black. Text uses `ink` / `body` / `mute`, never grey literals.
5. **One typeface.** Bricolage Grotesque for everything, loaded via `next/font` as `--font-bricolage`. No second face.
6. **24px is the card radius.** Cards, sheets, modals and primary buttons are `rounded-3xl` (24px). Inputs and small controls are `rounded-xl` (12px on the scale below). Nothing is square.
7. **Lucide icons only.** No emoji in UI chrome, no image icons for controls.
8. **Motion is feedback, not decoration.** Everything clickable reacts on hover and press. Respect `prefers-reduced-motion` (global override in `globals.css`; use `useReducedMotion()` for bespoke framer-motion work).
9. **Never clip floating UI.** Dropdowns, date pickers and menus render through a portal into `document.body` with fixed positioning, so `overflow-hidden` cards and scrolling modals cannot cut them off.

---

## Colour tokens

All tokens are defined in `@theme` in `globals.css`. Light values below; dark overrides listed where they differ.

### Brand

| Token | Light | Dark | Use |
|---|---|---|---|
| `primary` | #9fe870 | same | Primary CTA fill, active nav, focus ring, selection |
| `primary-active` | #cdffad | same | CTA hover |
| `primary-neutral` | #c5edab | same | Neutral active fill |
| `primary-pale` | #e2f6d5 | dark-tuned | Soft tints, positive badges, secondary button hover |
| `on-primary` | #163300 | same | Text on a lime fill |

### Ink and text

| Token | Light | Dark | Use |
|---|---|---|---|
| `ink` | #163300 | #f4f6f2 | Headings, primary text, strong borders |
| `ink-deep` | #163300 | #9fe870 | Emphasis text that should glow lime in dark |
| `body` | #454745 | #c3c9c0 | Secondary text, labels |
| `mute` | #868685 | #8d928a | Captions, placeholders, disabled |

### Surfaces

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | #ffffff | #161814 | Cards, inputs, popovers |
| `canvas-soft` | #e8ebe6 | #0e0f0c | Page ground (`html` background), inset fields, toggle tracks |
| `hairline` | #dfe3dc | #2a2d27 | Quiet dividers and borders |

Polarity-flipped surfaces that stay dark in both themes:

| Token | Value | Use |
|---|---|---|
| `ink-surface` | #163300 / #1d2b12 dark | Footer band, dark CTA card |
| `on-ink-surface` | #e8ebe6 | Text on `ink-surface` |
| `negative-on-ink` | #f0787d | Danger text on `ink-surface` |
| `scrim` | #0a1400 / #050a00 | Modal backdrops (use with opacity, e.g. `bg-scrim/70`) |
| `on-solid` | #ffffff | Text on solid semantic fills |

### Semantic

| Token | Light | Dark | Use |
|---|---|---|---|
| `positive` | #2ead4b | same | Income, success fills and icons |
| `positive-deep` | #054d28 | #7fd99a | Positive text on light ground |
| `warning` | #ffd11a | same | Caution fill |
| `warning-deep` | #b86700 | #ffc35c | Warning text, cash payment mode |
| `warning-content` | #4a3b1c | #ffe89a | Text on a warning fill |
| `negative` | #d03238 | same | Expense, danger fills and icons |
| `negative-deep` | #a72027 | #f0787d | Danger hover, danger text |
| `negative-darkest` | #a7000d | #ffa3a6 | Highest-emphasis danger text |
| `negative-bg` | #320707 | #3d0e0e | Destructive callout background |

### Tertiary accents

`accent-orange` #ffc091 and `accent-cyan` #38c8ff. Illustration and one-off highlights only. Never for status.

### Category scale

Ten spend categories, each with a `--color-cat-*` token and a matching Tailwind colour (`bg-cat-food/10`, `text-cat-food`). The lime brand accent is deliberately absent from this scale. Dark-theme values are lifted for legibility.

| Category | Token | Light | Icon |
|---|---|---|---|
| Food | `cat-food` | #b86700 | Utensils |
| Outing | `cat-outing` | #0b6f96 | Briefcase |
| Clothes | `cat-clothes` | #163300 | Shirt |
| Travel | `cat-travel` | #2ead4b | Plane |
| Vacation | `cat-vacation` | #0e8fbd | TreePalm |
| Medical | `cat-medical` | #d03238 | HeartPulse |
| Entertainment | `cat-entertainment` | #a72027 | Popcorn |
| Bills | `cat-bills` | #4a3b1c | ReceiptText |
| SMM | `cat-smm` | #054d28 | Route |
| Others | `cat-other` | #868685 | BanknoteArrowUp |

Colours, icons and the ordered list are all exported from `src/lib/categoryConfig.ts` (`CATEGORY_COLORS`, `CATEGORY_ICONS`, `CATEGORIES`). Chart colour mapping lives in `src/utils/chartOptions.ts`. Add a category in `categoryConfig.ts` and `globals.css` together; nowhere else.

Usage pattern for a category chip: `${colors.bg} ${colors.text}` from `CATEGORY_COLORS`, which resolves to a 10% tint background with the full-strength text colour.

---

## Typography

- **Face:** Bricolage Grotesque only. `--font-heading`, `--font-data` and `--font-body` all resolve to it, so the split is available if a second face is ever introduced.
- **Display:** `font-black` (900) with `tracking-tight`. Page titles are `text-3xl font-extrabold tracking-tight`; hero copy on the landing page goes up to `text-6xl`–`text-8xl`.
- **Section headings:** `text-lg font-black text-ink`.
- **Eyebrows and labels:** `text-[10px]`–`text-xs font-bold uppercase tracking-wider text-mute`. This is the one place wide tracking is allowed.
- **Body:** `text-sm` (14px) default in forms and lists, `text-base` in marketing copy. Weight 500–600 for emphasis, 700 for control labels.
- **Numbers:** always `tabular-nums`. Money is `font-black` and colour-coded: `positive`/emerald for income, `negative`/red for expense. Classes `.num .amount .balance .stat .data` switch to `--font-data`.
- Weight ladder: 900 for display, 800 for page titles, 700 for controls and chips, 600 for body emphasis, 400–500 for body.

---

## Radius, spacing, elevation

| Scale | Value | Use |
|---|---|---|
| `rounded-sm` | 8px | Tiny chips, keyboard-focus ring corners |
| `rounded-md` | 12px | Intended radius for inputs and dropdown items |
| `rounded-lg` | 16px | Small pills inside toggles, icon tiles |
| `rounded-xl` / `2xl` / `3xl` | 24px | Cards, sheets, modals, toggle tracks, buttons, inputs |
| `rounded-full` | pill | Badges, icon buttons, day markers |

The scale is currently degenerate: `--radius-xl`, `--radius-2xl` and `--radius-3xl` are all 24px, so most inputs and cards share one radius and a 32px icon tile on `rounded-lg` ends up less round than a 40px one on `rounded-xl`. Proposed fix (not yet applied): `xl` 20px, `2xl` 24px, `3xl` 32px, then cards on `rounded-2xl`, inputs on `rounded-xl`, chips on `rounded-lg`. Until then, prefer `rounded-3xl` for cards and `rounded-xl` for fields so the intent is readable.

Spacing rhythm: 4 / 8 / 12 / 16 / 24 / 32 / 48. Card padding is 24px on desktop (`p-6`) and 16px on mobile (`p-4`). Page gutters are `p-4 sm:p-8`. Bottom padding on pages is `pb-28` to clear the mobile bottom nav.

Elevation is mostly flat. Surface contrast (`canvas` card on `canvas-soft` ground) is the elevation. Shadows are soft and low-opacity (`--shadow-sm` to `--shadow-2xl`); in dark mode they get heavier because there is no luminance lift. Floating panels (dropdowns, date picker) use `shadow-2xl` plus a `hairline` border.

---

## Component primitives

Prefer these classes from `globals.css` in new markup. They already carry the right tokens for both themes. As of this writing nothing in `src/` uses them yet; buttons and inputs are hand-rolled inline, which is why their padding and radius drift. Adopting them is the cheapest consistency win available.

| Class | What it is |
|---|---|
| `.wise-card` | White 24px card, `p-6` |
| `.wise-card-sage` | Same on `canvas-soft` |
| `.wise-card-green` | Same on `primary-pale` |
| `.wise-card-dark` | `ink-surface` card with lime text |
| `.wise-card-outline` | White card with 1px ink border |
| `.wise-btn` + `-primary` / `-secondary` / `-tertiary` / `-danger` | 24px pill, 12/24 padding, 16/600 label, hover states built in |
| `.wise-icon-btn` | Round icon button, `canvas` with `canvas-soft` hover |
| `.wise-input` | 12px radius, 1px ink border, lime focus ring |
| `.wise-badge-positive` / `-negative` / `-warning` | Status pills |
| `.wise-hero-band` / `-dark`, `.wise-content-band` | Full-bleed sections |
| `.wise-table` | Data table chrome |

### Patterns used across the app

**Segmented toggle.** Track `flex bg-canvas-soft/80 rounded-3xl p-1`; each option `px-3 py-2 rounded-lg text-xs sm:text-sm font-bold`. Active option gets a 20% tint plus coloured text (expense red, income green, UPI indigo, cash warning). Icon only on mobile, icon plus label from `sm`.

**Inset field.** `bg-canvas-soft/80 rounded-xl px-3 py-3 text-ink placeholder-mute focus:ring-2 focus:ring-primary`. Amount fields put the currency symbol and input in one focus-within wrapper with `text-xl font-black`.

**Floating dropdown.** Trigger is a full-width inset field with a rotating `ChevronDown`. The panel is portaled to `document.body`, fixed-positioned under the trigger at trigger width, flips above near the viewport bottom, follows scroll and resize, and closes on outside click or Escape. Panel: `bg-canvas rounded-xl shadow-2xl border border-canvas-soft p-2`. Reference: the category picker in `AddTransactionForm.tsx`.

**Date picker.** `src/components/DatePicker.tsx` replaces every native `<input type="date">`. Same portal mechanics as the dropdown, 288px panel, month header with prev/next, weekday row (weekends in `ink`), day grid with today as a lime pill and the selection as a `ring-primary` cell, Today and Clear in the footer. Value is a `YYYY-MM-DD` string. Supports `required`, `min`, `max`, `clearable`, `hideIcon`, `placeholder`, `className`.

**Cards with an accent strip.** Forms and modals start with a 4px strip (`h-1 w-full`) coloured by polarity (`bg-negative` for expense, `bg-positive` for income).

**Modal and sheet.** Backdrop `bg-scrim/70 backdrop-blur-sm`. On mobile the sheet slides up and is `rounded-t-3xl` with a drag-handle hint; on desktop it centres at `max-w-md rounded-2xl`. Body scroll locks while open. Escape closes.

**Page header.** Mobile: `<Header />` then a row with a coloured Lucide icon, `text-3xl font-extrabold tracking-tight` title and `<MenuButton />` on the right. Desktop: `md:pt-20` to clear `DesktopNav`.

**Category chip.** Icon plus label, `rounded-lg text-xs font-bold`, coloured from `CATEGORY_COLORS`.

**Skeletons.** `animate-pulse` blocks in the shape of the final content, or `.skeleton-shimmer`. Every list and chart has one.

**Toasts.** `src/lib/toast` with `ToastContainer`. Success and error variants with a progress bar.

---

## Motion

- **Library:** framer-motion for layout and presence, CSS keyframes for ambient effects.
- **Entrance:** `initial={{ opacity: 0, y: 16 }}` to `animate={{ opacity: 1, y: 0 }}`, 0.3–0.4s. Lists stagger by index.
- **Expand and collapse:** `height: 0 → "auto"` with `AnimatePresence`, 0.2–0.25s, wrapper `overflow-hidden`.
- **Popovers:** `opacity 0 → 1`, `y ∓6`, `scale 0.98 → 1`, 0.15s. Direction follows the flip side.
- **Press:** `whileTap={{ scale: 0.96–0.98 }}`. Hover on grid cells `whileHover={{ scale: 1.04–1.06 }}`.
- **Springs** for anything that moves between positions (`type: "spring", stiffness 280–400, damping 22–28`).
- **Ambient keyframes** in `globals.css`: `blob`, `float`, `spin-slow`, `fade-up` (with `-d1`…`-d4` delays), `gradient-pan`, `shimmer`, `toast-progress`. Landing page only, never inside forms.
- **Reduced motion:** the global media query collapses all animation and transition durations to near zero.

---

## Accessibility

- Keyboard focus ring is global: `2px solid primary`, 2px offset, 8px radius, on `:focus-visible` only. Inputs inside a `focus-within` wrapper set `outline-none` and let the wrapper draw the ring.
- Selection colour is lime on ink.
- Touch targets are at least 40px tall (`py-2.5` on `text-sm` or larger).
- Floating panels carry `role="dialog"` or the correct listbox roles and close on Escape.
- Icon-only buttons need `aria-label`. Icon plus hidden label on mobile is done with `<span className="hidden sm:inline">`.
- Colour is never the only signal: income and expense also carry an arrow icon and a sign.

---

## Layout and navigation

- `html` paints `canvas-soft`; `body` is transparent so `MoneyBackdrop` (faint currency glyphs) can sit behind the page.
- Mobile: `Header` at the top, `BottomNav` fixed at the bottom with `pb-safe`, `FloatingTransactionButton` for quick add, hamburger `Menu` for secondary pages.
- Desktop (`md`+): `DesktopNav` fixed at the top, pages offset with `md:pt-20`.
- Content max-widths: `max-w-3xl` for single-column pages, `max-w-5xl` for search and data-heavy pages, dashboard uses a two-column `lg` grid.
- No decorative top hairline on pages. It was removed app-wide.

---

## Copy voice

Plain, friendly, second person. "You're offline — transaction saved locally." "What was this for?" Sentence case for UI text. Currency is always ₹ with `toLocaleString()` grouping.

---

## Known debt (as of 2026-09-04)

Most markup still uses the legacy Tailwind ramp names (roughly 430 `text-gray-*`, 140 `indigo-*`, 130 `emerald-*`, 140 `red-*`). Because `globals.css` aliases every ramp step onto a token per theme, this is not a theming bug by itself. The traps are the places where the aliasing cannot help:

| Trap | Why it breaks | Fix |
|---|---|---|
| `bg-white/80`, `bg-black` | Not aliased. White cards on the dark ground. | `bg-canvas/80`, `bg-ink-surface` |
| `bg-ink` as an input background | Ink is the text colour, so text disappears in both themes. | `bg-canvas-soft/80 text-ink` |
| Tinted washes like `bg-red-900/20`, `bg-emerald-950/40`, `bg-gray-900/60` | The alias is already a pale tint; at 20–60% alpha it vanishes in light mode. | Solid `bg-primary-pale`, `bg-canvas`, or a dedicated tint token |
| `hover:bg-indigo-500` on `bg-indigo-600` | Both steps alias to `primary`, so hover is a no-op. | `bg-primary hover:bg-primary-active` |
| `text-gray-600` for body copy | Aliases to `mute` at about 3:1 on white. | `text-body` for anything the user must read |
| `text-on-primary` / `text-on-solid` outside a solid fill | These do not invert, so one theme loses them. | `text-ink` / `text-mute` |
| `bg-primary` as a data mark (heatmaps) | Lime is reserved for actions. | Sequential `warning` to `negative` ramp |

Migration map when touching a file:

| Replace | With |
|---|---|
| `text-gray-300/400/500` | `text-body` |
| `text-gray-600` | `text-mute` (captions only) |
| `bg-gray-900/xx`, `bg-gray-800` | `bg-canvas`, `bg-canvas-soft` |
| `bg-gray-700` skeleton blocks | `bg-hairline` or `.skeleton-shimmer` |
| `text-emerald-*`, `text-green-*` | `text-positive` / `text-positive-deep` |
| `text-red-*`, `text-rose-*` | `text-negative` / `text-negative-deep` |
| `text-yellow-*`, `text-orange-*` | `text-warning-deep` |
| `indigo-*` / `violet-*` / `fuchsia-*` accents | `primary` if it is an action, otherwise a category token or `accent-cyan` |
| `border-gray-*` | `border-hairline` |

Other open items: native `<select>` elements in four forms clash with the custom controls; `rounded-2xl` and `rounded-3xl` are used interchangeably; page headers follow four different patterns; several pages omit `BottomNav` or `pb-28`; sub-11px uppercase micro-labels are common and read as dated.

---

## Checklist for any new UI

- [ ] Every colour is a token. No `gray-`, `indigo-`, `emerald-`, `red-` literals.
- [ ] Looks right in both themes without theme-specific branching.
- [ ] Lime appears only on actions, focus and selection.
- [ ] Cards and primary buttons are 24px radius; inputs and chips are 12px.
- [ ] Bricolage Grotesque only, numbers are `tabular-nums`.
- [ ] Hover, press and focus states exist and are visible.
- [ ] Empty, loading and error states are designed.
- [ ] Any floating panel is portaled and cannot be clipped.
- [ ] Dates use `DatePicker`, categories use `categoryConfig.ts`.
- [ ] Icon-only controls have `aria-label`; touch targets are 40px or more.
- [ ] Works under `prefers-reduced-motion`.
