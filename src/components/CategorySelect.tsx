"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/categoryConfig";

const MENU_MIN_W = 288;
const EDGE = 8; // keep the menu this far from the viewport edges

interface Props {
  value: string;
  onChange: (category: string) => void;
  /** Size/shape classes for the trigger; colours come from the category. */
  className?: string;
  iconSize?: number;
}

/**
 * Category picker: a trigger tinted with the active category, opening a
 * two-column menu. The menu is portalled so it escapes overflow clipping
 * inside sheets and cards.
 */
export default function CategorySelect({
  value,
  onChange,
  className = "px-3 py-3 rounded-xl text-xs sm:text-sm",
  iconSize = 16,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Viewport coordinates for the portal-rendered menu
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number; maxH: number; above: boolean }>({
    top: 0, left: 0, width: 0, maxH: 0, above: false,
  });

  useEffect(() => {
    if (!open) return;

    function place() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const menuH = 240; // approx height of the 2-column grid
      const above = r.bottom + menuH + 8 > window.innerHeight && r.top > menuH + 8;
      // Narrow triggers still get a menu wide enough for two columns of names,
      // right-aligned to the trigger when it would run off the screen.
      const width = Math.min(Math.max(r.width, MENU_MIN_W), window.innerWidth - 2 * EDGE);
      const left = r.left + width > window.innerWidth - EDGE ? r.right - width : r.left;
      setMenuPos({
        top: above ? r.top - 8 : r.bottom + 8,
        left: Math.max(EDGE, Math.min(left, window.innerWidth - width - EDGE)),
        width,
        maxH: (above ? r.top : window.innerHeight - r.bottom) - 8 - EDGE,
        above,
      });
    }
    place();

    function onClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // Keep the Escape from also closing a surrounding sheet.
      e.stopPropagation();
      setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const active = CATEGORIES.find((c) => c.name === value) || CATEGORIES[0];
  const activeColors = CATEGORY_COLORS[active.name] || CATEGORY_COLORS["Others"];
  const ActiveIcon = active.icon;

  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-1.5 font-bold transition-all duration-200 cursor-pointer ${activeColors.bg} ${activeColors.text} ${className}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <ActiveIcon size={iconSize} className="shrink-0" />
          <span className="truncate">{active.name}</span>
        </span>
        <ChevronDown
          size={iconSize}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              role="listbox"
              initial={{ opacity: 0, y: menuPos.above ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: menuPos.above ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "fixed",
                // Anchor to the trigger's bottom edge normally; flip above it near the viewport bottom.
                top: menuPos.above ? undefined : menuPos.top,
                bottom: menuPos.above ? window.innerHeight - menuPos.top : undefined,
                left: menuPos.left,
                width: menuPos.width,
                maxHeight: menuPos.maxH,
                overflowY: "auto",
                zIndex: 9999,
              }}
              className="bg-canvas rounded-xl shadow-2xl border border-canvas-soft p-2 grid grid-cols-2 gap-1.5"
            >
              {CATEGORIES.map(({ name, icon: Icon }) => {
                const colors = CATEGORY_COLORS[name] || CATEGORY_COLORS["Others"];
                const isActive = value === name;
                return (
                  <button
                    key={name}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer ${
                      isActive
                        ? `${colors.bg} ${colors.text}`
                        : "text-ink/60 hover:bg-canvas-soft hover:text-ink"
                    }`}
                  >
                    <Icon size={14} />
                    {name}
                    {isActive && <Check size={12} className="ml-auto" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
