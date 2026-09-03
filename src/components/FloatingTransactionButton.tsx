"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onAdd?: () => void;
}

export default function FloatingTransactionButton({ onAdd }: Props = {}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* ── FAB ───────────────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        aria-label="Add Transaction"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[60]
                   w-14 h-14 rounded-full flex items-center justify-center
                   bg-primary text-on-primary hover:bg-primary-active
                   transition-colors duration-200"
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <Plus size={24} strokeWidth={2.5} />
        </motion.span>
      </motion.button>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[70] bg-scrim/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[80] px-0 sm:px-4"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <div
                role="dialog"
                aria-modal="true"
                className="relative w-full sm:max-w-md bg-canvas/80 
                           rounded-t-3xl sm:rounded-2xl shadow-lg
                           max-h-[92dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle (mobile hint) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 rounded-full bg-canvas/80" />
                </div>

                {/* Close button */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full
                             bg-canvas/80 hover:bg-canvas-soft/80 text-gray-400 hover:text-ink
                             transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>

                {/* Form */}
                <div className="px-2 pb-6 pt-2 sm:px-0 sm:pt-0 sm:pb-0">
                  <AddTransactionForm onAdd={() => { setOpen(false); onAdd?.(); }} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
