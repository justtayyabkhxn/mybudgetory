"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "privacyMode";

/** Global, persisted "hide amounts" toggle. Masked (******) by default. */
export function usePrivacyMode() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    setHidden(stored === null ? true : stored === "true");

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setHidden(e.newValue === "true");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(() => {
    setHidden((prev) => {
      const next = !prev;
      localStorage.setItem(KEY, String(next));
      return next;
    });
  }, []);

  return { hidden, toggle };
}
