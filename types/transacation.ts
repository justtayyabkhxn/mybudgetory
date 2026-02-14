// types/transaction.ts
export interface Transaction {
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
