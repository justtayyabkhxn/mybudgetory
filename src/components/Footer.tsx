"use client";

import Link from "next/link";

// Wise `footer` — the dark band closing every page.
//
// It uses --color-ink-surface rather than --color-ink: this band is dark by
// design, so it must NOT invert with the theme the way a text token does. In
// dark mode it only lifts enough to separate from the page ground.
//
// A centred panel on desktop so it doesn't stretch across wide screens.
// No bottom-nav clearance here: every page with the mobile bottom nav already
// wraps the footer in pb-24/pb-28, so reserving it again doubled the gap.
const Footer = () => {
  return (
    <footer className="mt-10 rounded-3xl bg-ink-surface px-4 py-3 text-on-ink-surface md:mx-auto md:mt-16 md:max-w-4xl md:py-4">
      <div className="relative flex items-center justify-center">
        {/* The wordmark as a backdrop behind the credit. The lime full stop is
            its only full-strength mark. Decorative, so hidden from assistive tech. */}
        <p
          aria-hidden="true"
          className="pointer-events-none select-none text-center text-[clamp(2.5rem,11.5vw,6rem)] font-black leading-none tracking-tight text-on-ink-surface/[0.07]"
        >
          MyBudgetory<span className="text-primary">.</span>
        </p>

        <p className="absolute inset-x-0 text-center text-xs text-on-ink-surface/75 sm:text-sm">
          © {new Date().getFullYear()} · Crafted by{" "}
          <Link
            href="https://justtayyabkhan.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-active"
          >
            Tayyab Khan
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
