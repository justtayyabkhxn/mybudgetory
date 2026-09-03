"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "budgetory-theme";

/** What `data-theme` is currently set to on <html>. */
export function readResolvedTheme(): ResolvedTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function readPref(): ThemePref {
  if (typeof localStorage === "undefined") return "system";
  const v = localStorage.getItem(THEME_KEY);
  return v === "light" || v === "dark" ? v : "system";
}

function systemTheme(): ResolvedTheme {
  return typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Theme state for the whole app.
 *
 * The concrete theme always lives in `document.documentElement.dataset.theme`
 * — the boot script in layout.tsx writes it before first paint, and this hook
 * keeps it in sync afterwards. Components that need to re-render on a theme
 * change (canvas-painted charts, mostly) can key off `resolved`.
 */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  // Adopt whatever the boot script already decided.
  useEffect(() => {
    setPref(readPref());
    setResolved(readResolvedTheme());
  }, []);

  const apply = useCallback((next: ThemePref) => {
    const concrete = next === "system" ? systemTheme() : next;
    document.documentElement.dataset.theme = concrete;
    if (next === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, next);
    setPref(next);
    setResolved(concrete);
    window.dispatchEvent(new CustomEvent("themechange", { detail: concrete }));
  }, []);

  // Follow the OS while the preference is "system".
  useEffect(() => {
    if (pref !== "system" || typeof matchMedia === "undefined") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref, apply]);

  // Stay in step with a toggle rendered elsewhere in the tree.
  useEffect(() => {
    const onTheme = () => {
      setPref(readPref());
      setResolved(readResolvedTheme());
    };
    window.addEventListener("themechange", onTheme);
    return () => window.removeEventListener("themechange", onTheme);
  }, []);

  const cycle = useCallback(() => {
    apply(resolved === "dark" ? "light" : "dark");
  }, [apply, resolved]);

  return { pref, resolved, setTheme: apply, toggle: cycle };
}
