"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users2, Trash2, Contact, Plus, CheckCircle2, Circle,
  IndianRupee, MessageCircle, UserMinus, ChevronRight,
} from "lucide-react";
import MenuButton from "@/components/Menu";
import Header from "@/components/Header";

type Person = {
  name: string;
  phone: string;
  paid: boolean;
  link?: string;
};

declare global {
  interface Navigator {
    contacts?: {
      select: (
        properties: ("name" | "tel")[],
        options?: { multiple: boolean }
      ) => Promise<{ name?: string[]; tel?: string[] }[]>;
    };
  }
}

const STORAGE_KEY = "split-data";

export default function SplitPage() {
  const [totalAmount, setTotalAmount]   = useState<number | "">("");
  const [people, setPeople]             = useState<Person[]>([]);
  const [name, setName]                 = useState("");
  const [phone, setPhone]               = useState("");
  const [description, setDescription]  = useState("");
  const [focused, setFocused]           = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setTotalAmount(parsed.totalAmount || "");
      setPeople(parsed.people || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalAmount, people }));
  }, [totalAmount, people]);

  useEffect(() => {
    if (totalAmount !== "" && people.length > 0) {
      const newTotal = Number(totalAmount);
      const share    = Math.round(newTotal / people.length);
      const updatedPeople = people.map((person) => {
        const payload = { total: newTotal, name: person.name, phone: person.phone, share, description };
        const safeBtoa = (str: string) => btoa(unescape(encodeURIComponent(str)));
        const encoded  = encodeURIComponent(safeBtoa(JSON.stringify(payload)));
        const link     = `${window.location.origin}/split/summary/${encoded}`;
        return { ...person, link };
      });
      setPeople(updatedPeople);
    }
  }, [people.length, totalAmount, description]);

  const handleAddPerson = () => {
    if (!name.trim() || !phone.trim() || totalAmount === "" || isNaN(Number(totalAmount))) {
      alert("Please fill all fields correctly.");
      return;
    }
    setPeople((prev) => [...prev, { name, phone, paid: false }]);
    setName("");
    setPhone("");
  };

  const handleImportContact = async () => {
    if (!navigator.contacts || !navigator.contacts.select) {
      alert("Contact Picker API only works in supported browsers like Chrome Mobile.");
      return;
    }
    try {
      const contacts = await navigator.contacts.select(["name", "tel"], { multiple: false });
      if (contacts.length > 0) {
        const c = contacts[0];
        setName(c.name?.[0] || "");
        setPhone(c.tel?.[0]?.replace(/\D/g, "") || "");
      }
    } catch (err) {
      console.error("Contact import failed:", err);
    }
  };

  const equalShare = totalAmount !== "" && people.length > 0 ? Number(totalAmount) / people.length : 0;

  const handleTogglePaid   = (index: number) =>
    setPeople((prev) => prev.map((p, i) => (i === index ? { ...p, paid: !p.paid } : p)));

  const handleDeletePerson = (index: number) =>
    setPeople((prev) => prev.filter((_, i) => i !== index));

  const handleClearAll = () => {
    if (window.confirm("Delete total amount and all people?")) {
      setTotalAmount("");
      setPeople([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const inputCls = (name: string) =>
    `w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
      focused === name
        ? "border-indigo-500/50 bg-indigo-500/[0.08] shadow-[0_0_0_3px_rgba(159,232,112,0.12)]"
        : "bg-canvas-soft/80 hover:bg-primary-pale"
    }`;

  const paidCount    = people.filter((p) => p.paid).length;
  const pendingCount = people.length - paidCount;

  return (
    <div className="min-h-screen md:pt-20 text-ink">

      {/* ── Background glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[160px]" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-6">
        <div className="md:hidden">
          <Header />
        </div>

        {/* ── Page header ── */}
        <div className="flex justify-between items-start mb-8 mt-2">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Users2 size={16} className="text-indigo-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Split Expenses</h1>
            </div>
            <p className="text-sm text-gray-500 ml-10">Divide bills equally among friends</p>
          </div>
          <MenuButton />
        </div>

        {/* ── Step 1: Total Amount ── */}
        <StepCard step={1} title="Set the Total Amount">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Total bill amount</span>
              {(totalAmount !== "" || people.length > 0) && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Amount input */}
            <div className={inputCls("amount")}>
              <IndianRupee size={15} className={focused === "amount" ? "text-indigo-400 shrink-0" : "text-gray-600 shrink-0"} />
              <input
                type="number"
                placeholder="0.00"
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-gray-600 outline-none"
                value={totalAmount}
                onFocus={() => setFocused("amount")}
                onBlur={() => setFocused(null)}
                onChange={(e) => setTotalAmount(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>

            {/* Description input */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Description <span className="text-ink">(optional)</span>
              </label>
              <textarea
                placeholder="e.g. Dinner at XYZ restaurant"
                className="w-full rounded-xl bg-canvas-soft/80 px-4 py-3 text-sm text-ink placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-primary focus:bg-indigo-500/[0.08] transition-all duration-200 resize-none"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </StepCard>

        {/* ── Step 2: Add People ── */}
        <StepCard step={2} title="Add People">
          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Name</label>
              <div className={inputCls("name")}>
                <Users2 size={15} className={focused === "name" ? "text-indigo-400 shrink-0" : "text-gray-600 shrink-0"} />
                <input
                  type="text"
                  placeholder="Person's name"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-gray-600 outline-none"
                  value={name}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Phone <span className="text-ink">(for WhatsApp)</span>
              </label>
              <div className={inputCls("phone")}>
                <MessageCircle size={15} className={focused === "phone" ? "text-indigo-400 shrink-0" : "text-gray-600 shrink-0"} />
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-gray-600 outline-none"
                  value={phone}
                  onFocus={() => setFocused("phone")}
                  onBlur={() => setFocused(null)}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleImportContact}
                className="flex-1 flex items-center justify-center gap-2 rounded-3xl bg-canvas-soft/80 hover:bg-primary-pale py-2.5 text-sm font-semibold text-ink transition-all duration-200 active:scale-[0.98]"
              >
                <Contact size={15} /> Import Contact
              </button>
              <button
                onClick={handleAddPerson}
                className="flex-1 flex items-center justify-center gap-2 rounded-3xl py-2.5 text-sm font-semibold transition-colors duration-150 active:scale-[0.98]
                  bg-primary text-on-primary hover:bg-primary-active"
              >
                <Plus size={15} /> Add Person
              </button>
            </div>
          </div>
        </StepCard>

        {/* ── Step 3: Split Summary ── */}
        {people.length > 0 && totalAmount !== "" && (
          <StepCard step={3} title="Split Summary">
            {/* Summary bar */}
            <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-canvas/80">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Each person owes</p>
                <p className="text-2xl font-extrabold text-indigo-300">₹ {equalShare.toFixed(2)}</p>
              </div>
              <div className="flex gap-3 text-right">
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-base font-bold text-rose-400">{pendingCount}</p>
                </div>
                <div className="w-px bg-canvas/80" />
                <div>
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="text-base font-bold text-emerald-400">{paidCount}</p>
                </div>
              </div>
            </div>

            {/* People list */}
            <ul className="space-y-3">
              {people.map((p, i) => (
                <li
                  key={i}
                  className={`relative rounded-xl p-4 transition-all duration-200 ${
                    p.paid
                      ? " bg-emerald-500/[0.04]"
                      : " bg-canvas/80"
                  }`}
                >
                  <div className="absolute top-0 left-6 right-6 h-px bg-hairline" />

                  <div className="flex items-start justify-between gap-3">
                    {/* Left: avatar + info */}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        p.paid ? "bg-emerald-500/20 text-emerald-300" : "bg-indigo-500/20 text-indigo-300"
                      }`}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${p.paid ? "text-gray-400 line-through" : "text-ink"}`}>
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Owes ₹ {equalShare.toFixed(2)}
                        </p>
                        {/* Paid toggle */}
                        <button
                          onClick={() => handleTogglePaid(i)}
                          className={`flex items-center gap-1.5 mt-2 text-xs font-medium transition-colors duration-150 ${
                            p.paid ? "text-emerald-400" : "text-gray-500 hover:text-emerald-400"
                          }`}
                        >
                          {p.paid
                            ? <CheckCircle2 size={13} className="text-emerald-400" />
                            : <Circle size={13} />
                          }
                          {p.paid ? "Paid" : "Mark as paid"}
                        </button>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      {!p.paid && p.phone && p.link && (
                        <Link
                          href={`https://wa.me/${p.phone}?text=${encodeURIComponent(
                            `Hi ${p.name}, you owe ₹${equalShare.toFixed(2)} for the shared expense.${
                              description ? `\n${description}` : ""
                            }\nPay here: ${p.link}`
                          )}`}
                          target="_blank"
                          className="flex items-center gap-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 px-3 py-1.5 text-xs font-semibold text-green-400 transition-all duration-150"
                        >
                          <MessageCircle size={12} /> WhatsApp
                          <ChevronRight size={10} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeletePerson(i)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-400 transition-all duration-150"
                      >
                        <UserMinus size={13} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </StepCard>
        )}

        <div className="h-12" />
      </div>
    </div>
  );
}

/* ── StepCard ── */
function StepCard({
  step, title, children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl bg-canvas/80 p-6 mb-4">
      <div className="absolute top-0 left-8 right-8 h-px bg-hairline" />
      <div className="flex items-center gap-3 mb-5">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400 shrink-0">
          {step}
        </span>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
}
