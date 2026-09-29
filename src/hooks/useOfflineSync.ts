"use client";
import { useEffect, useRef, useCallback } from "react";
import { getQueue, dequeue } from "@/lib/offlineQueue";
import { toast } from "@/lib/toast";
import { submitTransaction } from "@/lib/submitTransaction";

export function useOfflineSync(onSynced?: () => void) {
  const syncingRef = useRef(false);

  const syncQueue = useCallback(async () => {
    if (syncingRef.current) return;
    const queue = getQueue();
    if (queue.length === 0) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    syncingRef.current = true;
    let synced = 0;

    for (const pending of queue) {
      try {
        await submitTransaction(pending.form, token);
        dequeue(pending.id);
        synced++;
      } catch {
        break; // stop on failure, retry next time
      }
    }

    syncingRef.current = false;

    if (synced > 0) {
      toast(
        `${synced} offline transaction${synced > 1 ? "s" : ""} synced!`,
        "success"
      );
      onSynced?.();
    }
  }, [onSynced]);

  useEffect(() => {
    // Attempt sync on mount in case we were offline last session
    if (navigator.onLine) syncQueue();

    const handleOnline = () => syncQueue();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncQueue]);

  return { syncQueue };
}
