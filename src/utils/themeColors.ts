/**
 * Live theme token lookup for canvas-painted surfaces.
 *
 * Chart.js draws to a canvas, so it cannot use CSS variables directly — the
 * value has to be resolved to a concrete colour at config-build time. These
 * helpers read the token off <html>, which the theme boot script and
 * useTheme() keep current, and fall back to the light value during SSR.
 *
 * Chart hosts re-render on theme change (see useTheme's `resolved`), which is
 * what re-runs the config builders with the new values.
 */

const FALLBACK: Record<string, string> = {
  "--color-ink": "#0e0f0c",
  "--color-body": "#454745",
  "--color-mute": "#868685",
  "--color-canvas": "#ffffff",
  "--color-canvas-soft": "#e8ebe6",
  "--color-hairline": "#dfe3dc",
  "--color-primary": "#9fe870",
  "--color-positive": "#2ead4b",
  "--color-negative": "#d03238",
  "--color-warning": "#ffd11a",
};

export function cssVar(name: string, fallback?: string): string {
  if (typeof document === "undefined") {
    return fallback ?? FALLBACK[name] ?? "#868685";
  }
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback || FALLBACK[name] || "#868685";
}

export function isDark(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset.theme === "dark"
  );
}

/** `rgb()`/hex colour with an alpha channel, for grid lines and area fills. */
export function alpha(color: string, a: number): string {
  const hex = color.trim();
  if (hex.startsWith("#")) {
    const full =
      hex.length === 4
        ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
        : hex;
    const r = parseInt(full.slice(1, 3), 16);
    const g = parseInt(full.slice(3, 5), 16);
    const b = parseInt(full.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  // already a functional colour — let the browser mix it
  return `color-mix(in srgb, ${hex} ${a * 100}%, transparent)`;
}

/** Neutral chrome shared by every chart: axes, grid, tooltip, legend. */
export function chartChrome() {
  return {
    tick: cssVar("--color-mute"),
    label: cssVar("--color-body"),
    grid: alpha(cssVar("--color-ink"), isDark() ? 0.14 : 0.08),
    gridStrong: alpha(cssVar("--color-ink"), isDark() ? 0.3 : 0.22),
    surface: cssVar("--color-canvas"),
    tooltipBg: isDark() ? cssVar("--color-canvas") : cssVar("--color-ink"),
    tooltipText: isDark() ? cssVar("--color-ink") : cssVar("--color-canvas"),
    tooltipBorder: cssVar("--color-hairline"),
  };
}
