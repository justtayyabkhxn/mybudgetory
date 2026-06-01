const QUEUE_KEY = "pendingTransactions";

export interface PendingTransaction {
  id: string;
  form: {
    title: string;
    amount: string;
    category: string;
    type: "income" | "expense";
    date: string;
    comment: string;
    paymentMode: "Cash" | "UPI";
  };
  queuedAt: string;
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("offlinequeue:change"));
  }
}

export function getQueue(): PendingTransaction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PendingTransaction[];
  } catch {
    return [];
  }
}

export function enqueue(form: PendingTransaction["form"]): PendingTransaction {
  const entry: PendingTransaction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    form,
    queuedAt: new Date().toISOString(),
  };
  const queue = getQueue();
  queue.push(entry);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  notify();
  return entry;
}

export function dequeue(id: string): void {
  const queue = getQueue().filter((t) => t.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  notify();
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
  notify();
}
