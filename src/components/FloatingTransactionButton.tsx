"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { AddTransactionForm } from "@/components/AddTransactionForm";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingTransactionButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
                   bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-500
                   shadow-[0_4px_24px_rgba(139,92,246,0.55)]
                   hover:shadow-[0_4px_32px_rgba(139,92,246,0.75)]
                    border-white/20 text-white transition-shadow duration-200"
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
              className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
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
                className="relative w-full sm:max-w-md bg-[#0e0e1c] border border-white/10
                           rounded-t-3xl sm:rounded-2xl shadow-2xl
                           max-h-[92dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle (mobile hint) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Close button */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-full
                             bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white
                             transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>

                {/* Form */}
                <div className="px-2 pb-6 pt-2 sm:px-0 sm:pt-0 sm:pb-0">
                  <AddTransactionForm onAdd={() => setOpen(false)} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
