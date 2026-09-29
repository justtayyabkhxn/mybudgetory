export interface TransactionInput {
  title: string;
  amount: string;
  category: string;
  type: "income" | "expense";
  date: string; // YYYY-MM-DD
  comment: string;
  paymentMode: "Cash" | "UPI";
}

/**
 * Creates a transaction and applies it to the bank balance. Shared by the
 * add form, Quick Log and the offline sync. Callers adding several
 * transactions must await each one: the balance update is read-modify-write,
 * so running them in parallel loses adjustments.
 */
export async function submitTransaction(form: TransactionInput, token: string): Promise<void> {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(form),
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
  const amount = parseFloat(form.amount);
  const adjustment = form.type === "income" ? amount : -amount;
  const newBalance = currentBalance + adjustment;

  await fetch("/api/networth/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newBalance, paymentMode: form.paymentMode }),
  });
}
