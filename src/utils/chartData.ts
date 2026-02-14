// types/transaction.ts
interface Transaction {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string; // ISO string from backend
  comment?: string;
  paymentMode: string; // <- keep string, since API can return anything
  createdAt: string;
  updatedAt: string;
}



export const getDailyTimeline = (transactions: Transaction[]) => {
  const daily: Record<string, number> = {};

  transactions.forEach(tx => {
    const date = new Date(tx.date).toLocaleDateString("en-GB"); // dd/mm/yyyy
    daily[date] = (daily[date] || 0) + tx.amount * (tx.type === "expense" ? -1 : 1);
  });

  return Object.entries(daily).map(([date, amount]) => ({
    name: date,
    y: amount,
  }));
};

export const getCategoryBreakdown = (transactions: Transaction[]) => {
  const categories: Record<string, number> = {};

  transactions.forEach(tx => {
    categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
  });

  return Object.entries(categories).map(([name, amount]) => ({
    name,
    y: amount,
  }));
};

export const getInflowOutflow = (transactions: Transaction[]) => {
  let income = 0, expense = 0;

  transactions.forEach(tx => {
    if (tx.type === "income") income += tx.amount;
    else expense += tx.amount;
  });

  return [
    { name: "Income", y: income },
    { name: "Expense", y: expense },
  ];
};
