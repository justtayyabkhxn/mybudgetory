import { useState, useEffect } from "react";
import {
  Utensils,
  Shirt,
  Briefcase,
  HeartPulse,
  ReceiptText,
  Clapperboard,
  Plane,
  BanknoteArrowUp,
  Plus,
  Calendar,
} from "lucide-react";

const categoryIcons = {
  Food: Utensils,
  Outing: Briefcase,
  Clothes: Shirt,
  Medical: HeartPulse,
  Bills: ReceiptText,
  Entertainment: Clapperboard,
  Travel: Plane,
  Others: BanknoteArrowUp,
};

export function AddTransactionForm({ onAdd }: { onAdd: () => void }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "income",
    date: new Date().toISOString().split("T")[0],
    comment: "",
    paymentMode: "Cash", // 👈 new field
  });

  interface Transaction {
    _id: string;
    title: string;
    amount: number;
    category: string;
    type: "income" | "expense";
    date: string;
    comment: string;
    paymentMode: string; // 👈 added
  }

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [txs, setTxs] = useState<Transaction[]>([]);

  const categories = [
    "Food",
    "Outing",
    "Clothes",
    "Travel",
    "Medical",
    "Entertainment",
    "Bills",
    "Other",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Prevent category change if type is income
    if (form.type === "income" && name === "category") return;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Auto-set category to "Other" when type is income
  useEffect(() => {
    if (form.type === "income") {
      setForm((prev) => ({ ...prev, category: "Other" }));
    }
  }, [form.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }
    try {
      // Step 1: Add the transaction
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
      // Step 2: Fetch current balance
      const balanceFetch = await fetch("/api/networth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balanceData = await balanceFetch.json();
      if (!balanceFetch.ok) {
        throw new Error(balanceData.error || "Failed to fetch current balance");
      }

      const currentBalance = balanceData.bankBalance || 0;
      const amount = parseFloat(form.amount);
      const adjustment = form.type === "income" ? amount : -amount;
      const newBalance = currentBalance + adjustment;

      // Step 3: Update net worth using newBalance
      
      const balanceRes = await fetch("/api/networth/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newBalance,
          paymentMode: form.paymentMode,
        }),
      });

      if (!balanceRes.ok) {
        const data = await balanceRes.json();
        throw new Error(data.error || "Failed to update bank balance");
      }

      // Step 4: Reset form and update UI
      
      setSuccess("Transaction added and balance updated!");
      setLoading(false);
      setForm({
        title: "",
        amount: "",
        category: "Food",
        type: "expense",
        date: new Date().toISOString().split("T")[0], // 👈 today's date in DD-MM-YYYY
        comment: "",
        paymentMode: "Cash",
      });

      onAdd();

      // Step 5: Refresh transactions list
      const updated = await fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());

      if (updated.transactions) setTxs(updated.transactions);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };
  return (
    <div className="mb-4 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl p-6 ">
      <div className="flex items-center gap-2 mb-4">
        <Plus color="#00d138" />
        <h2 className="text-xl font-bold ">Add New Transaction</h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="p-2 rounded bg-black border border-gray-900 text-white"
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
          className="p-2 rounded bg-black border border-gray-900 text-white"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="p-2 rounded bg-black border border-gray-900 text-white"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          name="paymentMode"
          value={form.paymentMode}
          onChange={handleChange}
          required
          className="p-2 rounded bg-black border border-gray-900 text-white"
        >
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>

        <div className="flex items-center gap-1">
          {(() => {
            const Icon = categoryIcons[form.category] || BanknoteArrowUp;
            return <Icon className=" text-pink-600 " />;
          })()}

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            disabled={form.type === "income"} // Disable if income
            className={`p-2 rounded bg-black border border-gray-900 text-white flex-1 ${
              form.type === "income" ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80 lg:w-94 xl:w-120">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5 pointer-events-none" />
          <input
            type="date"
            name="date"
            placeholder="Date"
            value={form.date}
            onChange={handleChange}
            required
            className="p-2 pl-10 rounded bg-black border border-gray-900 text-white w-full"
          />
        </div>

        <input
          name="comment"
          placeholder="Comment (Optional)"
          value={form.comment}
          onChange={handleChange}
          className="p-2 rounded bg-black border border-gray-900 text-white resize-none"
        />

        <button
          type="submit"
          disabled={loading}
          className={`sm:col-span-2 mt-2 ${
            loading ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
          } text-white py-2 px-4 rounded cursor-pointer font-bold`}
        >
          <div className="flex items-center justify-center gap-2">
            <Plus size={18} />
            <span>{loading ? "Adding Transaction..." : "Add Transaction"}</span>
          </div>
        </button>
      </form>

      {error && <p className="text-red-400 mt-2">{error}</p>}
      {success && <p className="text-green-400 mt-2">{success}</p>}

      {txs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Most recent transaction
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {[...txs].slice(0, 1).map((tx, index) => {
              const Icon = categoryIcons[tx.category] || BanknoteArrowUp;
              return (
                <li
                  key={index}
                  className="border-b border-gray-600 pb-1 flex items-start gap-2"
                >
                  <Icon className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <strong>{tx.title}</strong> - ₹{tx.amount} ({tx.type},{" "}
                    {tx.paymentMode}) on{" "}
                    {new Date(tx.date).toLocaleDateString()}
                    {tx.comment && (
                      <p className="text-gray-400 italic mt-1">{tx.comment}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
