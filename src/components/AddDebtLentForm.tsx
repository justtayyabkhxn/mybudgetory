"use client";
import { useState } from "react";
import {
  HandCoins,
  Banknote,
  UserRound,
  CalendarDays,
  MessageCircle,
} from "lucide-react";

export function AddDebtLentForm({ onAdd }: { onAdd: () => void }) {
  const [form, setForm] = useState({
    person: "",
    amount: "",
    type: "lent",
    date: "",
    comment: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) return setError("You must be logged in.");

    try {
      const res = await fetch("/api/debt-lent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Entry added!");
        setForm({
          person: "",
          amount: "",
          type: "lent",
          date: "",
          comment: "",
        });
        onAdd();
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Network error. Please try again."+err);
    }
  };

  return (
    <div className="mb-10 bg-canvas/80 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Add Debt / Lent Entry</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="flex items-center gap-2">
          <UserRound className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="person"
            placeholder="Person's Name"
            value={form.person}
            onChange={handleChange}
            required
            className="p-2 rounded bg-canvas-soft/80 text-ink flex-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <Banknote className="w-5 h-5 text-gray-400" />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
            min="1"
            className="p-2 rounded bg-canvas-soft/80 text-ink flex-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <HandCoins className="w-5 h-5 text-gray-400" />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="p-2 rounded bg-canvas-soft/80 text-ink flex-1"
          >
            <option value="lent">Lent</option>
            <option value="debt">Debt</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="p-2 rounded bg-canvas-soft/80 text-ink flex-1"
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="comment"
            placeholder="Comment (optional)"
            value={form.comment}
            onChange={handleChange}
            className="p-2 rounded bg-canvas-soft/80 text-ink flex-1"
          />
        </div>

        <button
          type="submit"
          className="sm:col-span-2 mt-2 bg-primary hover:bg-primary-active text-on-primary py-2.5 px-6 rounded-3xl font-semibold"
        >
          <span>

          Add Entry
          </span>
        </button>
      </form>

      {error && <p className="text-red-400 mt-2">{error}</p>}
      {success && <p className="text-green-400 mt-2">{success}</p>}

      
    </div>
  );
}
