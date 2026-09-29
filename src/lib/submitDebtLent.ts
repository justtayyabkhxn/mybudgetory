export interface DebtLentInput {
  type: "lent" | "debt"; // lent = they owe me, debt = I owe them
  person: string;
  amount: string;
  reason: string;
  date: string; // YYYY-MM-DD or "" (server uses now), sent as dateAdded
  dueDate: string; // YYYY-MM-DD or ""
}

/** Creates a Debt/Lent entry. Like the Debt & Lent page, this leaves the bank balance alone. */
export async function submitDebtLent(entry: DebtLentInput, token: string): Promise<void> {
  const res = await fetch("/api/debt-lent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: entry.type,
      person: entry.person,
      amount: entry.amount,
      reason: entry.reason,
      dateAdded: entry.date || undefined,
      dueDate: entry.dueDate || undefined,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to add entry");
  }
}
