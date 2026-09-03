"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { ToastType } from "@/lib/toast";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

// Wise `ex-toast` — canvas surface, 24px radius, semantic colour carried by
// the icon and the progress bar rather than the whole panel.
const STYLES = {
  success: "bg-canvas/95 backdrop-blur-xl  text-ink",
  error: "bg-canvas/95 backdrop-blur-xl  text-ink",
  info: "bg-canvas/95 backdrop-blur-xl  text-ink",
};

const ICON_STYLES = {
  success: "text-positive-deep",
  error: "text-negative",
  info: "text-ink-deep",
};

const BAR_STYLES = {
  success: "bg-positive",
  error: "bg-negative",
  info: "bg-primary",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { id, message, type } = (e as CustomEvent).detail as ToastItem;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };
    window.addEventListener("__app_toast__", handler);
    return () => window.removeEventListener("__app_toast__", handler);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`relative overflow-hidden flex items-start gap-3 px-4 py-3 rounded-3xl pointer-events-auto ${STYLES[t.type]}`}
            >
              <Icon size={17} className={`flex-shrink-0 mt-0.5 ${ICON_STYLES[t.type]}`} />
              <p className="flex-1 text-sm font-semibold leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer mt-0.5"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
              <span
                className={`toast-progress absolute bottom-0 left-0 h-0.5 rounded-full ${BAR_STYLES[t.type]}`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
