"use client";

import { Eye, EyeOff } from "lucide-react";
import { usePrivacyMode } from "@/hooks/usePrivacyMode";

/**
 * The "hide amounts" eye. Flips the global privacy mode, so every page and
 * every other eye on screen masks or reveals together.
 */
export default function PrivacyToggle({ className = "" }: { className?: string }) {
  const { hidden, toggle } = usePrivacyMode();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`p-1 rounded cursor-pointer text-gray-500 hover:text-gray-300 ${className}`}
      title={hidden ? "Show amounts" : "Hide amounts"}
      aria-label={hidden ? "Show amounts" : "Hide amounts"}
      aria-pressed={!hidden}
    >
      {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );
}
