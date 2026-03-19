"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MenuButton from "@/components/Menu";
import { WalletMinimal } from "lucide-react";
import { AddDebtLentForm } from "@/components/AddDebtLentForm";
import Header from "@/components/Header";

interface Entry {
  _id: string;
  person: string;
  amount: number;
  reason?: string;
  type: "debt" | "lent";
  dateAdded: string;
  dueDate?: string;
  status: "pending" | "cleared";
}

type User = {
  id: string;
  email: string;
};

export default function DebtLentPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, []);

  const fetchEntries = () => {
    const token = localStorage.getItem("token");
    fetch("/api/debt-lent", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          console.error("Invalid data format", data);
          setEntries([]); // Fallback to empty array
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setEntries([]); // Fallback on error
      });
  };

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const handleClear = async (id: string) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const confirmClear = window.confirm("Mark this entry as cleared?");
  if (!confirmClear) return;

  try {
    const res = await fetch(`/api/debt-lent/clear`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (data._id) {
      setEntries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: "cleared" } : e))
      );
    } else {
      alert("Failed to update status.");
    }
  } catch (error) {
    console.error("Update error:", error);
  }
};


  const handleDebtLentAdd = () => {
    // e.g., refresh the list or show a toast
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const confirmDelete = window.confirm("Delete this entry?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/debt-lent`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (data._id) {
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } else {
      alert("Failed to delete.");
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
     <Header/>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <WalletMinimal />
            <h1 className="text-4xl font-extrabold tracking-tight mb-0 text-white">
              Debt & Lent Tracker
            </h1>
          </div>
          <MenuButton />
        </div>

        <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Your Entries</h2>

          {entries.length === 0 ? (
            <p className="text-gray-400">No entries yet.</p>
          ) : (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry._id}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-md"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {entry.type === "debt" ? "You owe" : "You lent"}{" "}
                      {entry.person}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(entry.dateAdded).toLocaleDateString("en-GB")}
                      {entry.dueDate &&
                        ` • Due: ${new Date(entry.dueDate).toLocaleDateString(
                          "en-GB"
                        )}`}
                    </p>

                    <p className="text-sm text-gray-400">{entry.reason}</p>
                    <p className="text-sm text-yellow-300">
                      Status: {entry.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        entry.type === "debt"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      ₹ {entry.amount}
                    </p>
                    {entry.status === "pending" && (
                      <button
                        onClick={() => handleClear(entry._id)}
                        className="text-sm text-yellow-400 hover:text-yellow-600 mt-1 block"
                      >
                        <span>

                        Mark as Cleared
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-sm text-red-500 hover:text-red-700 mt-1 block"
                    >
                      <span>

                      Delete
                      </span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-5">
          <AddDebtLentForm onAdd={handleDebtLentAdd} />
        </div>
      </div>
    </div>
  );
}
