"use client";

import { Eye, EyeOff } from "lucide-react";
import { usePrivacyMode } from "@/hooks/usePrivacyMode";

/**
 * The "hide amounts" eye. Flips the global privacy mode, so every page and
 * every other eye on screen masks or reveals together.
 *
 * `unstyled` drops the default inline look so a host (the desktop nav, the
 * mobile header) can supply its own shape and colours through `className`.
 */
export default function PrivacyToggle({
  className = "",
  unstyled = false,
  size = 20,
}: {
  className?: string;
  unstyled?: boolean;
  size?: number;
}) {
  const { hidden, toggle } = usePrivacyMode();
  const base = unstyled ? "cursor-pointer" : "p-1 rounded cursor-pointer text-gray-500 hover:text-gray-300";
  return (
    <button
      type="button"
      onClick={toggle}
      className={`${base} ${className}`}
      title={hidden ? "Show amounts" : "Hide amounts"}
      aria-label={hidden ? "Show amounts" : "Hide amounts"}
      aria-pressed={!hidden}
    >
      {/* Open eye in the brand green so "amounts showing" reads at a glance. */}
      {hidden ? <EyeOff size={size} /> : <Eye size={size} className="text-primary" />}
    </button>
  );
}
