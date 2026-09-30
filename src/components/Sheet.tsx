"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  /** Backdrop tap and the ✕ button. */
  onClose: () => void;
  /** Escape key; defaults to onClose. Lets a sheet cancel an inner state first. */
  onEscape?: () => void;
  title: ReactNode;
  titleId: string;
  /** Rendered beside the title, e.g. a help button. */
  headerExtra?: ReactNode;
  children: ReactNode;
}

/**
 * Bottom sheet on mobile, centred dialog from `sm` up. Portalled to <body> so
 * it isn't trapped by transformed ancestors (fixed positioning breaks inside them).
 */
export default function Sheet({ open, onClose, onEscape, title, titleId, headerExtra, children }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const escapeRef = useRef(onEscape ?? onClose);
  escapeRef.current = onEscape ?? onClose;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") escapeRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-scrim/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[80] px-0 sm:px-4 pointer-events-none"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="pointer-events-auto relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto
                         bg-canvas rounded-t-3xl sm:rounded-2xl shadow-lg p-5 pb-8 sm:pb-5"
            >
              <div className="flex items-center gap-1 mb-1 pr-8">
                <h2 id={titleId} className="flex items-center gap-2 text-lg font-bold text-ink">
                  {title}
                </h2>
                {headerExtra}
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-canvas-soft/80 text-gray-400 hover:text-ink transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
