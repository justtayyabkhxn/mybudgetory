"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

/** Pinned to the top-left gutter — the fallback for pages with no nav. */
const FLOATING =
  "fixed top-3 left-3 z-[200] h-10 w-10 bg-canvas/80 text-ink hover:bg-canvas-soft/80";

type Props = {
  /**
   * "floating" is the standalone control rendered from the root layout. It
   * hides itself whenever a nav mounts an "inline" one (see the
   * `has-nav-theme-toggle` rule in globals.css), so the two never both show.
   */
  variant?: "floating" | "inline";
  className?: string;
  size?: number;
};

/** Light/dark switch. */
export default function ThemeToggle({
  variant = "floating",
  className = "",
  size = 17,
}: Props) {
  const { resolved, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server has no way to know the visitor's theme, so hold the icon back
  // until the client has read it — otherwise the first paint shows the wrong one.
  useEffect(() => setMounted(true), []);

  const isDark = resolved === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      data-theme-toggle={variant}
      aria-label={label}
      title={label}
      className={`flex cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ${
        variant === "floating" ? FLOATING : ""
      } ${className}`}
    >
      {mounted &&
        (isDark ? (
          <Sun size={size} strokeWidth={2.2} />
        ) : (
          <Moon size={size} strokeWidth={2.2} />
        ))}
    </button>
  );
}
