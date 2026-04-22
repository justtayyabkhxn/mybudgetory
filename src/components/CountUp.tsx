"use client";

import { motion } from "framer-motion";

const CELL_H = 1.2; // em — height of each digit row
const CYCLES = 3;   // full cycles before landing

// Build a column of digits that spins through CYCLES full rotations
const COLUMN = Array.from({ length: CYCLES }, () =>
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
).flat();

function DigitRoller({
  digit,
  delay = 0,
  duration = 1.0,
}: {
  digit: string;
  delay?: number;
  duration?: number;
}) {
  const d = parseInt(digit);
  // Land on digit d in the last cycle
  const targetIndex = (CYCLES - 1) * 10 + d;

  return (
    <span
      className="inline-block overflow-hidden relative"
      style={{
        height: `${CELL_H}em`,
        lineHeight: `${CELL_H}em`,
        verticalAlign: "bottom",
      }}
    >
      {/* top fade */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{
          height: "40%",
          // background: "linear-gradient(to bottom, currentColor 0%, transparent 100%)",
          opacity: 0.15,
        }}
      />
      {/* bottom fade */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: "40%",
          // background: "linear-gradient(to top, currentColor 0%, transparent 100%)",
          opacity: 0.15,
        }}
      />

      <motion.span
        initial={{ y: 0 }}
        animate={{ y: `${-targetIndex * CELL_H}em` }}
        transition={{
          duration,
          delay,
          ease: [0.12, 1, 0.28, 1], // expo out — fast spin, smooth land
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          willChange: "transform",
        }}
      >
        {COLUMN.map((n, i) => (
          <span
            key={i}
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
  duration?: number;
}

export default function CountUp({
  end,
  prefix = "",
  suffix = "",
  className = "",
  duration = 1.1,
}: CountUpProps) {
  const formatted = end.toLocaleString();
  const chars = formatted.split("");

  // Count only numeric chars to compute per-digit stagger
  const numericTotal = chars.filter((c) => /\d/.test(c)).length;
  let numericIndex = 0;

  return (
    <span
      className={`inline-flex items-end tabular-nums ${className}`}
      style={{ gap: 0 }}
    >
      {prefix && (
        <span style={{ lineHeight: `${CELL_H}em`, verticalAlign: "bottom" }}>
          {prefix}
        </span>
      )}

      {chars.map((char, i) => {
        if (!/\d/.test(char)) {
          return (
            <span
              key={`sep-${i}`}
              style={{ lineHeight: `${CELL_H}em`, verticalAlign: "bottom" }}
            >
              {char}
            </span>
          );
        }

        const idx = numericIndex++;
        // Left-to-right stagger: leftmost digit settles first (slot-machine feel)
        // units digit gets the longest spin
        const digitDelay = idx * (0.06 / Math.max(numericTotal - 1, 1)) * (numericTotal - 1);
        const digitDuration = duration + idx * 0.04;

        return (
          <DigitRoller
            key={`pos-${numericTotal - 1 - idx}`}
            digit={char}
            delay={digitDelay}
            duration={digitDuration}
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
