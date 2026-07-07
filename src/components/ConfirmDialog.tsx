"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[180] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="fixed inset-0 z-[190] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
          >
            <div
              className="bg-[#0e0e1c]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                {danger && (
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white text-base">{title}</h3>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">{message}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-700 text-gray-300 text-sm font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  ref={confirmRef}
                  onClick={onConfirm}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    danger
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
