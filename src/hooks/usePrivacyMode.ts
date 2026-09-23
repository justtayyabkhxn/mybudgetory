"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "privacyMode";
/** Same-tab broadcast: `storage` events only fire in *other* tabs. */
const EVENT = "privacymodechange";

/** What a hidden amount renders as. */
export const MASKED = "₹ ******";

/** Global, persisted "hide amounts" toggle. Masked (******) by default. */
export function usePrivacyMode() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    setHidden(stored === null ? true : stored === "true");

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setHidden(e.newValue === "true");
    };
    const onLocal = (e: Event) => setHidden((e as CustomEvent<boolean>).detail);
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT, onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT, onLocal);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = localStorage.getItem(KEY) === "false";
    localStorage.setItem(KEY, String(next));
    window.dispatchEvent(new CustomEvent<boolean>(EVENT, { detail: next }));
  }, []);

  return { hidden, toggle };
}
