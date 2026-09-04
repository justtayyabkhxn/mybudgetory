"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * App-wide date picker that reuses the look of the Calendar page's month grid.
 * Value in/out is an ISO date string (YYYY-MM-DD), same as <input type="date">,
 * so it drops in wherever a native date input used to be.
 */

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseISO(v: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
  if (!m) return null;
  return { y: +m[1], m: +m[2] - 1, d: +m[3] };
}
function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
export function formatDisplayDate(v: string) {
  const p = parseISO(v);
  if (!p) return "";
  const dt = new Date(p.y, p.m, p.d);
  return dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
  /** Show a clear (×) button when a value is set. Good for optional dates. */
  clearable?: boolean;
  /** Classes for the trigger. Defaults match the app's rounded input look. */
  className?: string;
  /** Hide the leading calendar icon (when the caller already renders one). */
  hideIcon?: boolean;
  min?: string;
  max?: string;
};

const PANEL_W = 288;
const PANEL_H = 340;

export default function DatePicker({
  value,
  onChange,
  name,
  required,
  placeholder = "Pick a date",
  clearable,
  className,
  hideIcon,
  min,
  max,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, above: false });

  const today = new Date();
  const selected = parseISO(value);
  const [viewY, setViewY] = useState(selected?.y ?? today.getFullYear());
  const [viewM, setViewM] = useState(selected?.m ?? today.getMonth());

  // When opening, jump to the month of the current value (or today).
  useEffect(() => {
    if (!open) return;
    const p = parseISO(value);
    setViewY(p?.y ?? today.getFullYear());
    setViewM(p?.m ?? today.getMonth());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function place() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const above = r.bottom + PANEL_H + 8 > window.innerHeight && r.top > PANEL_H + 8;
      const left = Math.min(Math.max(8, r.left), window.innerWidth - PANEL_W - 8);
      setPos({ top: above ? r.top - 8 : r.bottom + 8, left, above });
    }
    place();
    function onDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const firstDow = new Date(viewY, viewM, 1).getDay();
  const cells = useMemo(
    () => [...Array.from({ length: firstDow }, () => 0), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)],
    [firstDow, daysInMonth]
  );

  const prevMonth = () => {
    if (viewM === 0) { setViewM(11); setViewY((y) => y - 1); } else setViewM((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewM === 11) { setViewM(0); setViewY((y) => y + 1); } else setViewM((m) => m + 1);
  };
  const isDisabled = (iso: string) => (!!min && iso < min) || (!!max && iso > max);

  const pick = (d: number) => {
    const iso = toISO(viewY, viewM, d);
    if (isDisabled(iso)) return;
    onChange(iso);
    setOpen(false);
  };

  const display = formatDisplayDate(value);
  const triggerClass =
    className ??
    "w-full bg-canvas-soft/80 text-ink rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200";

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${triggerClass} flex items-center gap-2 text-left cursor-pointer`}
      >
        {!hideIcon && <CalendarDays size={15} className="shrink-0 text-gray-500" />}
        <span className={`flex-1 min-w-0 truncate ${display ? "" : "text-mute"}`}>
          {display || placeholder}
        </span>
        {clearable && value && (
          <span
            role="button"
            aria-label="Clear date"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="shrink-0 p-0.5 rounded-full text-gray-500 hover:text-ink hover:bg-canvas/80"
          >
            <X size={13} />
          </span>
        )}
      </button>

      {/* Keeps native form validation for `required` without a visible native input. */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          name={name}
          value={value}
          required
          onChange={() => {}}
          onFocus={() => setOpen(true)}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />
      )}
      {!required && name && <input type="hidden" name={name} value={value} />}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-label="Choose a date"
                initial={{ opacity: 0, y: pos.above ? 6 : -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: pos.above ? 6 : -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "fixed",
                  top: pos.above ? undefined : pos.top,
                  bottom: pos.above ? window.innerHeight - pos.top : undefined,
                  left: pos.left,
                  width: PANEL_W,
                  zIndex: 9999,
                }}
                className="bg-canvas rounded-2xl shadow-2xl border border-canvas-soft p-3"
              >
                {/* Month header */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="Previous month"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-ink hover:bg-canvas-soft cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="text-sm font-black text-ink">
                    {MONTHS[viewM]} <span className="text-gray-500 font-bold">{viewY}</span>
                  </div>
                  <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="Next month"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-ink hover:bg-canvas-soft cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS.map((d, i) => (
                    <div
                      key={d}
                      className={`text-center text-[10px] font-black uppercase tracking-widest py-1 ${
                        i === 0 || i === 6 ? "text-ink" : "text-gray-500"
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((d, i) => {
                    if (d === 0) return <div key={`e-${i}`} className="h-9" />;
                    const iso = toISO(viewY, viewM, d);
                    const isSel = value === iso;
                    const isToday =
                      d === today.getDate() && viewM === today.getMonth() && viewY === today.getFullYear();
                    const disabled = isDisabled(iso);
                    return (
                      <motion.button
                        key={iso}
                        type="button"
                        onClick={() => pick(d)}
                        disabled={disabled}
                        whileHover={disabled ? undefined : { scale: 1.06 }}
                        whileTap={disabled ? undefined : { scale: 0.94 }}
                        className={`h-9 rounded-xl text-xs font-black flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                          isSel
                            ? "ring-2 ring-primary bg-indigo-500/15 text-ink"
                            : isToday
                            ? "bg-primary text-on-primary"
                            : "text-gray-400 hover:bg-canvas-soft hover:text-ink"
                        } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
                      >
                        {d}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-canvas-soft">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(toISO(today.getFullYear(), today.getMonth(), today.getDate()));
                      setOpen(false);
                    }}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Today
                  </button>
                  {value && (
                    <button
                      type="button"
                      onClick={() => { onChange(""); setOpen(false); }}
                      className="text-xs font-bold text-gray-500 hover:text-ink cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
