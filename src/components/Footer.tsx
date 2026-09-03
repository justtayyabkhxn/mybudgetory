"use client";

import Link from "next/link";

// Wise `footer` — the dark band closing every page.
//
// It uses --color-ink-surface rather than --color-ink: this band is dark by
// design, so it must NOT invert with the theme the way a text token does. In
// dark mode it only lifts enough to separate from the page ground.
const Footer = () => {
  return (
    <footer className="mt-16 bg-ink-surface text-on-ink-surface rounded-t-3xl">
      <div className="max-w-4xl mx-auto px-6 py-12 pb-24 md:pb-12 flex flex-col items-center gap-3">
        {/* Brand */}
        <span className="text-xl font-extrabold tracking-tight text-on-ink-surface">
          MyBudgetory<span className="text-primary">.</span>
        </span>

        {/* Tagline */}
        <p className="text-sm text-on-ink-surface/70">Your budget. Your story.</p>

        {/* Credit */}
        <p className="text-sm text-on-ink-surface/70 mt-2">
          Crafted by{" "}
          <Link
            href="https://justtayyabkhan.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:text-primary-active transition-colors duration-200"
          >
            Tayyab Khan
          </Link>{" "}
          · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
