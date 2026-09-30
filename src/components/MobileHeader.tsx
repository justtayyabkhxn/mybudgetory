"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import MenuButton from "@/components/Menu";
import PrivacyToggle from "@/components/PrivacyToggle";

interface Props {
  icon: LucideIcon;
  title: string;
  /**
   * Show the title beside the icon (as the page's h1). Only for pages without
   * their own title in the body — long titles don't fit beside the centred
   * wordmark on phones, so other pages show the icon alone.
   */
  showTitle?: boolean;
}

/**
 * App-page header. On mobile: a sticky bar with the page icon on the left, the
 * MyBudgetory wordmark (→ dashboard) centred, and the menu button on the right.
 * On desktop the bar is hidden and MenuButton renders the top nav instead.
 *
 * Render it outside the page's padded container so the bar spans the full width.
 */
export default function MobileHeader({ icon: Icon, title, showTitle = false }: Props) {
  return (
    <>
      {/* The visible title was dropped to save space; keep it for screen readers. */}
      {!showTitle && <h1 className="sr-only">{title}</h1>}
      <div className="md:hidden sticky top-0 z-40 bg-canvas-soft/80 backdrop-blur-xl border-b border-hairline">
        {/* h-10 row lines up with the fixed 40px menu button on the right */}
        <div className="relative max-w-2xl mx-auto px-4 py-3">
          <div className="flex h-10 items-center">
            {showTitle ? (
              <h1 className="flex items-center gap-2 text-lg font-black text-ink">
                <Icon size={18} className="shrink-0 text-primary" />
                {title}
              </h1>
            ) : (
              <Icon size={20} className="text-primary" aria-label={title} role="img" />
            )}
          </div>
          <Link
            href="/dashboard"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-2 py-1
                       text-lg font-black text-ink hover:text-primary transition-colors"
          >
            MyBudgetory
          </Link>
        </div>
        {/* Sits just left of the fixed menu button (right-4 + 40px + 8px gap);
            anchored to the full-width bar so it tracks the viewport like the menu. */}
        <PrivacyToggle
          unstyled
          className="absolute right-16 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-500 hover:text-ink transition-colors"
        />
      </div>

      {/* Kept outside the md:hidden bar: on desktop this is what renders the nav. */}
      <div className="fixed top-3 right-4 z-50">
        <MenuButton />
      </div>
    </>
  );
}
