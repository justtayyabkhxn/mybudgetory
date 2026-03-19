"use client";

import { TxnCard } from "@/components/TxnCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Coins,
  Landmark,
  PiggyBank,
  Check,
  Pencil,
  X,
  RefreshCw,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import MenuButton from "@/components/Menu";

export default function NetWorthPage() {
  const router = useRouter();
  const [netWorth, setNetWorth] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [bankBalance, setBankBalance] = useState<number>(0);
  const [newBalance, setNewBalance] = useState<string>("");

  const handleCancelEdit = () => {
    setEditMode(false);
    setNewBalance(""); // Reset the input field
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    try { JSON.parse(atob(token.split(".")[1])); } catch { localStorage.removeItem("token"); router.push("/login"); return; }

    let isMounted = true;
    fetchNetWorth(isMounted);

    return () => {
      isMounted = false;
    };
  }, []);

  async function fetchNetWorth(isMounted = true) {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const res = await fetch("/api/networth", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (isMounted) {
        setBankBalance(data.bankBalance || 0);
        setNetWorth(data.bankBalance || 0);
      }
    } catch (error) {
      console.error("Failed to fetch net worth:", error);
      if (isMounted) {
        setBankBalance(0);
        setNetWorth(0);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }

  async function handleUpdateBalance() {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const res = await fetch("/api/networth/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newBalance: parseFloat(newBalance) }),
      });

      const data = await res.json();
      if (res.ok) {
        setBankBalance(data.bankBalance);
        setEditMode(false);
      } else {
        console.error("Update failed:", data.error);
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  }
  return (
    <div className="min-h-screen p-6 sm:p-10 max-w-4xl mx-auto text-white">
      <Header />

      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <PiggyBank className="text-yellow-400 w-7 h-7" />
          <h1 className="text-4xl font-extrabold tracking-tight mb-0 text-white">
            Net Worth
          </h1>
          <button
            onClick={() => fetchNetWorth()}
            className="ml-2 mt-1 p-1 rounded hover:bg-gray-700"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-5 h-5 text-green-400 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <MenuButton />
      </div>

      {/* Bank Balance Card with Editable Input */}
      <div className="relative mb-6">
        <TxnCard
          title="Bank Balance"
          amount={
            loading
              ? "Loading..."
              : editMode
              ? `₹ ${newBalance || bankBalance}`
              : `₹ ${bankBalance.toLocaleString()}`
          }
          color="text-orange-400"
          icon={<PiggyBank className="text-yellow-400 w-6 h-6" />}
        />

        {/* Edit / Save Icon */}
        {/* Edit / Save/Cancel Buttons */}
        <div className="absolute top-4 right-4">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              title="Edit"
              className=" p-1 rounded cursor-pointer"
            >
              <Pencil className="w-5 h-5 mt-10 text-orange-600 hover:text-yellow-400" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={handleUpdateBalance}
                title="Save"
                className=" p-1 rounded cursor-pointer"
              >
                <Check className="w-5 h-5 mt-10 text-green-400 hover:text-green-500" />
              </button>
              <button
                onClick={handleCancelEdit}
                title="Cancel"
                className="mt-10 p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5 text-red-400 hover:text-red-500" />
              </button>
            </div>
          )}
        </div>

        {/* Input Field */}
        {editMode && (
          <div className="mt-4">
            <label className="block mb-1 text-sm text-gray-300">
              Enter new bank balance
            </label>
            <input
              type="number"
              placeholder="New Balance"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}
      </div>

      {/* Other Cards */}
      <div className="space-y-6">
        <TxnCard
          title="Assets"
          amount={loading ? "Loading..." : `₹ ${0}`}
          color="text-blue-400"
          icon={<Coins className="text-yellow-400 w-6 h-6" />}
        />

        <TxnCard
          title="Total Net Worth"
          amount={loading ? "Loading..." : `₹ ${netWorth.toLocaleString()}`}
          color="text-emerald-400"
          icon={<Landmark className="text-yellow-400 w-6 h-6" />}
        />
      </div>

      <Footer />
      <FloatingTransactionButton />
    </div>
  );
}
