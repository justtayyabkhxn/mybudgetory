// Static money/budget glyph backdrop.
//
// A single <pattern> tile of Lucide glyphs, painted once as a fixed layer
// behind every page: it does not scroll, does not take pointer events, and is
// drawn in `currentColor` so the wash follows the active theme through the
// --backdrop-ink token.
//
// 36 glyphs drawn from 36 types — spending, saving, earning, and the everyday
// categories a budget is actually made of. They sit small (roughly 20-30px)
// and dense rather than large and sparse, so the wash reads as texture rather
// than as decoration competing with the page.
//
// Placement is a jittered 6x6 grid on a 640px tile: enough variation in
// offset, scale and rotation that the repeat is not obvious at desktop widths,
// while the cell spacing guarantees neighbours never collide.
export default function MoneyBackdrop() {
  return (
    <div className="money-backdrop" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="budgetory-glyphs"
            width="640"
            height="640"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* arrow-down-left */}
              <g transform="translate(15 40) scale(0.9) rotate(3 12 12)">
                <path d="M17 7 7 17" /><path d="M17 17H7V7" />
              </g>
              {/* coffee */}
              <g transform="translate(147 17) scale(0.89) rotate(-4 12 12)">
                <path d="M10 2v2" /><path d="M14 2v2" /><path d="M6 2v2" /><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
              </g>
              {/* hand-coins */}
              <g transform="translate(241 12) scale(1.07) rotate(-12 12 12)">
                <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" /><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" /><path d="m2 16 6 6" /><circle cx="16" cy="9" r="2.9" /><circle cx="6" cy="5" r="3" />
              </g>
              {/* receipt */}
              <g transform="translate(360 9) scale(1.1) rotate(15 12 12)">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 17.5v-11" />
              </g>
              {/* ticket */}
              <g transform="translate(464 33) scale(1.16) rotate(13 12 12)">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
              </g>
              {/* graduation-cap */}
              <g transform="translate(573 35) scale(0.99) rotate(-1 12 12)">
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
              </g>
              {/* calculator */}
              <g transform="translate(17 127) scale(0.88) rotate(3 12 12)">
                <rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" />
              </g>
              {/* car */}
              <g transform="translate(145 143) scale(1.2) rotate(12 12 12)">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
              </g>
              {/* chart-pie */}
              <g transform="translate(236 150) scale(1.24) rotate(-9 12 12)">
                <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" /><path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              </g>
              {/* trending-down */}
              <g transform="translate(356 138) scale(0.92) rotate(5 12 12)">
                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />
              </g>
              {/* smartphone */}
              <g transform="translate(439 143) scale(1.02) rotate(-12 12 12)">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" />
              </g>
              {/* house */}
              <g transform="translate(571 148) scale(1.17) rotate(4 12 12)">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </g>
              {/* fuel */}
              <g transform="translate(27 240) scale(1.09) rotate(13 12 12)">
                <line x1="3" x2="15" y1="22" y2="22" /><line x1="4" x2="14" y1="9" y2="9" /><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" /><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
              </g>
              {/* chart-line */}
              <g transform="translate(116 223) scale(1.23) rotate(14 12 12)">
                <path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" />
              </g>
              {/* piggy-bank */}
              <g transform="translate(222 221) scale(1.14) rotate(3 12 12)">
                <path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z" /><path d="M16 10h.01" /><path d="M2 8v1a2 2 0 0 0 2 2h1" />
              </g>
              {/* shopping-cart */}
              <g transform="translate(360 246) scale(0.96) rotate(8 12 12)">
                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </g>
              {/* arrow-up-right */}
              <g transform="translate(452 219) scale(1.23) rotate(6 12 12)">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </g>
              {/* wallet */}
              <g transform="translate(546 257) scale(0.9) rotate(-13 12 12)">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </g>
              {/* gift */}
              <g transform="translate(19 342) scale(0.9) rotate(-1 12 12)">
                <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
              </g>
              {/* wallet-minimal */}
              <g transform="translate(137 349) scale(1.22) rotate(15 12 12)">
                <path d="M17 14h.01" /><path d="M7 7h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10" />
              </g>
              {/* percent */}
              <g transform="translate(223 334) scale(1.03) rotate(1 12 12)">
                <line x1="19" x2="5" y1="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
              </g>
              {/* chart-column */}
              <g transform="translate(332 351) scale(1.2) rotate(1 12 12)">
                <path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
              </g>
              {/* lock */}
              <g transform="translate(456 346) scale(1.12) rotate(8 12 12)">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </g>
              {/* circle-dollar-sign */}
              <g transform="translate(550 333) scale(0.88) rotate(-7 12 12)">
                <circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" />
              </g>
              {/* target */}
              <g transform="translate(20 444) scale(0.85) rotate(-5 12 12)">
                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
              </g>
              {/* banknote */}
              <g transform="translate(128 448) scale(0.85) rotate(10 12 12)">
                <rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" />
              </g>
              {/* clock */}
              <g transform="translate(252 453) scale(1.09) rotate(4 12 12)">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </g>
              {/* trending-up */}
              <g transform="translate(332 462) scale(1.23) rotate(-13 12 12)">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
              </g>
              {/* scale */}
              <g transform="translate(459 465) scale(1.01) rotate(9 12 12)">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
              </g>
              {/* calendar-days */}
              <g transform="translate(561 436) scale(1.04) rotate(9 12 12)">
                <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" />
              </g>
              {/* plane */}
              <g transform="translate(9 548) scale(0.88) rotate(-3 12 12)">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </g>
              {/* credit-card */}
              <g transform="translate(140 546) scale(0.89) rotate(-13 12 12)">
                <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
              </g>
              {/* coins */}
              <g transform="translate(224 536) scale(1.08) rotate(-10 12 12)">
                <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
              </g>
              {/* utensils */}
              <g transform="translate(347 575) scale(0.86) rotate(-3 12 12)">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </g>
              {/* landmark */}
              <g transform="translate(469 560) scale(0.91) rotate(0 12 12)">
                <line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" />
              </g>
              {/* shopping-bag */}
              <g transform="translate(558 574) scale(1.0) rotate(-9 12 12)">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
              </g>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#budgetory-glyphs)" />
      </svg>
    </div>
  );
}
