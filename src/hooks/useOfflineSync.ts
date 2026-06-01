"use client";
import { useEffect, useRef, useCallback } from "react";
import { getQueue, dequeue } from "@/lib/offlineQueue";
import { toast } from "@/lib/toast";

async function submitOne(
  txnForm: ReturnType<typeof getQueue>[number]["form"],
  token: string
): Promise<void> {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(txnForm),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to add transaction");
  }

  const balanceFetch = await fetch("/api/networth", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const balanceData = await balanceFetch.json();
  const currentBalance = balanceData.bankBalance || 0;
  const amount = parseFloat(txnForm.amount);
  const adjustment = txnForm.type === "income" ? amount : -amount;
  const newBalance = currentBalance + adjustment;

  await fetch("/api/networth/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newBalance, paymentMode: txnForm.paymentMode }),
  });
}

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
        await submitOne(pending.form, token);
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
