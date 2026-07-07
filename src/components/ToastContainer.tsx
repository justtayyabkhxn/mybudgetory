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

const STYLES = {
  success: "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-[0_8px_32px_rgba(16,185,129,0.15)]",
  error: "bg-red-950/90 border-red-500/40 text-red-200 shadow-[0_8px_32px_rgba(239,68,68,0.15)]",
  info: "bg-gray-900/90 border-gray-600/40 text-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
};

const ICON_STYLES = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-gray-400",
};

const BAR_STYLES = {
  success: "bg-emerald-400/70",
  error: "bg-red-400/70",
  info: "bg-gray-400/60",
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
              className={`relative overflow-hidden flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md pointer-events-auto ${STYLES[t.type]}`}
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
