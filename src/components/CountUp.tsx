"use client";

import { motion } from "framer-motion";

const CELL_H = 1.15; // em — height of each digit row

function DigitRoller({ digit, delay = 0 }: { digit: string; delay?: number }) {
  const d = parseInt(digit);

  return (
    <span
      className="inline-block overflow-hidden"
      style={{ height: `${CELL_H}em`, lineHeight: `${CELL_H}em`, verticalAlign: "bottom" }}
    >
      <motion.span
        initial={{ y: 0 }}
        animate={{ y: `${-d * CELL_H}em` }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "flex", flexDirection: "column", willChange: "transform" }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            style={{
              height: `${CELL_H}em`,
              lineHeight: `${CELL_H}em`,
              display: "block",
              textAlign: "center",
            }}
          >
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number; // unused — kept for API compatibility
}

export default function CountUp({
  end,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const formatted = end.toLocaleString();

  return (
    <span className={`inline-flex items-end ${className}`} style={{ gap: 0 }}>
      {prefix && (
        <span style={{ lineHeight: `${CELL_H}em`, verticalAlign: "bottom" }}>
          {prefix}
        </span>
      )}

      {formatted.split("").map((char, i) => {
        if (!/\d/.test(char)) {
          // Comma / separator — static, vertically centred
          return (
            <span
              key={`sep-${i}`}
              style={{ lineHeight: `${CELL_H}em`, verticalAlign: "bottom", padding: 0, margin: 0 }}
            >
              {char}
            </span>
          );
        }

        // Key by position-from-right so only changed digits re-roll
        const posFromRight = formatted.length - 1 - i;

        return (
          <DigitRoller
            key={`pos-${posFromRight}`}
            digit={char}
            delay={i * 0.03}
          />
        );
      })}

      {suffix && (
        <span style={{ lineHeight: `${CELL_H}em`, verticalAlign: "bottom" }}>
          {suffix}
        </span>
      )}
    </span>
  );
}
