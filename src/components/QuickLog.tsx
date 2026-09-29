"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Loader2, WifiOff, Info, ArrowLeft, Banknote, CreditCard, Pencil, Check, ArrowUpCircle, ArrowDownCircle, Mic } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import CategorySelect from "@/components/CategorySelect";
import { toast } from "@/lib/toast";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { submitTransaction, TransactionInput } from "@/lib/submitTransaction";
import { submitDebtLent, DebtLentInput } from "@/lib/submitDebtLent";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/categoryConfig";

interface Props {
  onAdd?: () => void;
  /** "pill" sits inline on a page; "fab" stacks above the add-transaction FAB. */
  variant?: "pill" | "fab";
}

// One is picked each time the sheet opens, so people discover what it understands.
const PLACEHOLDERS = [
  "₹180 lunch at Subway and ₹40 chai",
  "Uber ₹240 yesterday, movie ₹450 same day",
  "Paid ₹1,200 electricity bill in cash",
  "Got ₹50k salary today",
  "Groceries ₹860 on 26 Sept and ₹120 auto",
  "₹999 Netflix, ₹1.5k new shoes",
  "Lent ₹500 to Rahul, return by 5 Oct",
  "Borrowed ₹2k from Amit and ₹180 lunch",
];

const TIPS: { label: string; example: string }[] = [
  { label: "Amount and what it was for", example: "₹150 burger" },
  { label: "Several at once — commas or “and”", example: "₹180 lunch and ₹40 chai" },
  { label: "When — today, yesterday or a date", example: "₹860 groceries on 26 Sept" },
  { label: "“same day” reuses the date before it", example: "Uber ₹240 yesterday, movie ₹450 same day" },
  { label: "Say “cash” for cash, otherwise it's UPI", example: "Paid ₹1,200 electricity bill in cash" },
  { label: "got / received / salary = income", example: "Got ₹50k salary today" },
  { label: "“at …” is saved as the note", example: "₹320 coffee at Starbucks" },
  { label: "Money you lent goes to Debt & Lent", example: "Lent ₹500 to Rahul for movie tickets" },
  { label: "…and so does money you borrowed", example: "Borrowed ₹2k from Amit, return by 5 Oct" },
];

function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDay(date: string, today: string): string {
  const d = new Date(`${date}T00:00:00`);
  const t = new Date(`${today}T00:00:00`);
  const diff = Math.round((t.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== t.getFullYear() && { year: "numeric" }),
  });
}

type TxnDraft = TransactionInput & { kind: "txn"; key: string };
type DebtDraft = DebtLentInput & { kind: "debt"; key: string };
type Draft = TxnDraft | DebtDraft;

/** "transactions", "entries" or "items", depending on what's in the batch. */
function batchNoun(drafts: Draft[]): string {
  const n = drafts.length;
  const kinds = new Set(drafts.map((d) => d.kind));
  if (kinds.size > 1) return n === 1 ? "item" : "items";
  if (kinds.has("debt")) return n === 1 ? "entry" : "entries";
  return n === 1 ? "transaction" : "transactions";
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const fieldClass =
  "w-full bg-canvas rounded-lg px-2.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200";

function Segmented<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: ReactNode; title?: string; active: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex bg-canvas rounded-lg p-0.5 shrink-0">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-label={o.title}
          aria-pressed={value === o.value}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-bold transition-colors duration-200 cursor-pointer ${
            value === o.value ? o.active : "text-gray-500 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Inline editor for one previewed transaction. */
function DraftEditor({ draft, onSave, onCancel }: {
  draft: TxnDraft;
  onSave: (d: TxnDraft) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState(draft);
  const [error, setError] = useState("");
  const set = <K extends keyof TxnDraft>(k: K, v: TxnDraft[K]) => { setD((p) => ({ ...p, [k]: v })); setError(""); };

  const save = () => {
    const amount = parseFloat(d.amount);
    if (!d.title.trim()) return setError("Add a title");
    if (isNaN(amount) || amount <= 0) return setError("Enter an amount greater than 0");
    if (amount > 10_000_000) return setError("Amount cannot exceed ₹1 crore");
    onSave({ ...d, title: d.title.trim(), amount: String(amount), comment: d.comment.trim() });
  };

  return (
    <div
      className="space-y-2.5"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") { e.preventDefault(); save(); }
      }}
    >
      {/* Row 1 — what, how much, how paid */}
      <div className="flex items-center gap-2">
        <input
          aria-label="Title"
          value={d.title}
          onChange={(e) => set("title", e.target.value)}
          maxLength={80}
          autoFocus
          className={`${fieldClass} flex-1 min-w-0 font-bold`}
        />
        <div className="relative w-24 shrink-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
          <input
            aria-label="Amount"
            inputMode="decimal"
            value={d.amount}
            onChange={(e) => set("amount", e.target.value.replace(/[^\d.]/g, ""))}
            className={`${fieldClass} pl-6 font-bold tabular-nums`}
          />
        </div>
        <Segmented
          value={d.paymentMode}
          onChange={(v) => set("paymentMode", v)}
          options={[
            { value: "UPI", label: "UPI", active: "bg-primary text-on-primary" },
            { value: "Cash", label: "Cash", active: "bg-primary text-on-primary" },
          ]}
        />
      </div>

      {/* Row 2 — type, when, category */}
      <div className="flex items-center gap-2">
        <Segmented
          value={d.type}
          onChange={(v) => set("type", v)}
          options={[
            {
              value: "expense",
              title: "Expense",
              label: <><ArrowUpCircle size={13} /><span className="hidden sm:inline">Expense</span></>,
              active: "bg-red-500/20 text-red-400",
            },
            {
              value: "income",
              title: "Income",
              label: <><ArrowDownCircle size={13} /><span className="hidden sm:inline">Income</span></>,
              active: "bg-green-500/20 text-green-400",
            },
          ]}
        />
        <div className="flex-1 min-w-0">
          <DatePicker
            value={d.date}
            onChange={(v) => v && set("date", v)}
            max={localToday()}
            className="w-full bg-canvas rounded-lg px-2.5 py-2 text-ink text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
          />
        </div>
        <div className="flex-1 min-w-0">
          <CategorySelect
            value={d.category}
            onChange={(category) => set("category", category)}
            className="px-2.5 py-2 rounded-lg text-xs"
            iconSize={14}
          />
        </div>
      </div>

      {/* Row 3 — note and actions */}
      <div className="flex items-center gap-2">
        <input
          aria-label="Note"
          placeholder="Note (optional)"
          value={d.comment}
          onChange={(e) => set("comment", e.target.value)}
          maxLength={200}
          className={`${fieldClass} flex-1 min-w-0 text-xs placeholder:text-gray-500`}
        />
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 px-2.5 py-2 rounded-lg text-xs font-bold text-gray-500 hover:text-ink transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-on-primary hover:bg-primary-active transition-colors cursor-pointer"
        >
          <Check size={13} strokeWidth={3} /> Save
        </button>
      </div>

      {error && <p role="alert" className="text-xs font-semibold text-negative">{error}</p>}
    </div>
  );
}

/** Inline editor for one previewed lent/borrowed entry. */
function DebtEditor({ draft, onSave, onCancel }: {
  draft: DebtDraft;
  onSave: (d: DebtDraft) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState(draft);
  const [error, setError] = useState("");
  const set = <K extends keyof DebtDraft>(k: K, v: DebtDraft[K]) => { setD((p) => ({ ...p, [k]: v })); setError(""); };

  const save = () => {
    const amount = parseFloat(d.amount);
    if (!d.person.trim()) return setError("Add who it's with");
    if (isNaN(amount) || amount <= 0) return setError("Enter an amount greater than 0");
    if (amount > 10_000_000) return setError("Amount cannot exceed ₹1 crore");
    if (d.dueDate && d.date && d.dueDate < d.date) return setError("Due date can't be before the loan");
    onSave({ ...d, person: d.person.trim(), amount: String(amount), reason: d.reason.trim() });
  };

  const dateClass =
    "w-full bg-canvas rounded-lg px-2.5 py-2 text-ink text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200";

  return (
    <div
      className="space-y-2.5"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") { e.preventDefault(); save(); }
      }}
    >
      {/* Row 1 — who, how much, which way */}
      <div className="flex items-center gap-2">
        <input
          aria-label="Person"
          placeholder="Who?"
          value={d.person}
          onChange={(e) => set("person", e.target.value)}
          maxLength={60}
          autoFocus
          className={`${fieldClass} flex-1 min-w-0 font-bold placeholder:text-gray-500`}
        />
        <div className="relative w-24 shrink-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">₹</span>
          <input
            aria-label="Amount"
            inputMode="decimal"
            value={d.amount}
            onChange={(e) => set("amount", e.target.value.replace(/[^\d.]/g, ""))}
            className={`${fieldClass} pl-6 font-bold tabular-nums`}
          />
        </div>
        <Segmented
          value={d.type}
          onChange={(v) => set("type", v)}
          options={[
            { value: "lent", label: "Lent", active: "bg-emerald-500/20 text-emerald-400" },
            { value: "debt", label: "Borrowed", active: "bg-red-500/20 text-red-400" },
          ]}
        />
      </div>

      {/* Row 2 — when, and when it's due back */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          {/* Both dates are optional, as on the Debt & Lent page; an empty date saves as today. */}
          <DatePicker
            value={d.date}
            onChange={(v) => set("date", v)}
            max={localToday()}
            clearable
            placeholder="Date"
            className={dateClass}
          />
        </div>
        <div className="flex-1 min-w-0">
          <DatePicker
            value={d.dueDate}
            onChange={(v) => set("dueDate", v)}
            min={d.date || undefined}
            clearable
            placeholder="Due date"
            className={dateClass}
          />
        </div>
      </div>

      {/* Row 3 — reason and actions */}
      <div className="flex items-center gap-2">
        <input
          aria-label="Reason"
          placeholder="Reason (optional)"
          value={d.reason}
          onChange={(e) => set("reason", e.target.value)}
          maxLength={200}
          className={`${fieldClass} flex-1 min-w-0 text-xs placeholder:text-gray-500`}
        />
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 px-2.5 py-2 rounded-lg text-xs font-bold text-gray-500 hover:text-ink transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-on-primary hover:bg-primary-active transition-colors cursor-pointer"
        >
          <Check size={13} strokeWidth={3} /> Save
        </button>
      </div>

      {error && <p role="alert" className="text-xs font-semibold text-negative">{error}</p>}
    </div>
  );
}

export default function QuickLog({ onAdd, variant = "pill" }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [showHelp, setShowHelp] = useState(false);
  // Non-null means we're on the preview step.
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  // Phrases the parser understood but can't log (e.g. repayments).
  const [skipped, setSkipped] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = parsing || saving;

  // Voice input appends to whatever was typed before the mic was tapped.
  const voiceBaseRef = useRef("");
  const speech = useSpeechToText((heard) => {
    const base = voiceBaseRef.current;
    setText(`${base}${base && heard ? " " : ""}${heard}`.slice(0, 1000));
  });
  const { listening, stop: stopListening } = speech;

  const toggleVoice = () => {
    if (listening) return stopListening();
    voiceBaseRef.current = text.trim();
    setError("");
    speech.start();
  };

  // Stop listening once the sheet closes or we move on to the preview.
  useEffect(() => {
    if (!open || drafts || parsing) stopListening();
  }, [open, drafts, parsing, stopListening]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || busy) return;
      // First Escape leaves the row editor; the next one closes the sheet.
      if (editingKey) return setEditingKey(null);
      setOpen(false);
      setDrafts(null);
      setSkipped([]);
      setShowHelp(false);
      setError("");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, editingKey]);

  // Focus the box whenever the input step is showing.
  useEffect(() => {
    if (!open || drafts) return;
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [open, drafts]);

  const openSheet = () => {
    setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
    setOpen(true);
  };

  const close = () => {
    if (busy) return;
    setOpen(false);
    setDrafts(null);
    setSkipped([]);
    setEditingKey(null);
    setShowHelp(false);
    setError("");
  };

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) setError("You must be logged in");
    return token;
  };

  const handleParse = async () => {
    if (busy) return;
    const note = text.trim();
    if (!note) {
      setError("Type what you spent first");
      return;
    }
    const token = getToken();
    if (!token) return;

    setError("");
    setParsing(true);
    try {
      const res = await fetch("/api/ai/quick-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: note, today: localToday() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't read that");

      const txns: TransactionInput[] = data.transactions ?? [];
      const debts: DebtLentInput[] = data.debts ?? [];
      const notLogged: string[] = data.skipped ?? [];
      if (txns.length + debts.length === 0) {
        setError(
          notLogged.length
            ? `Can't log “${notLogged[0]}” yet — record repayments on the Debt & Lent page`
            : "Couldn't find an amount in that — try “₹150 on lunch”"
        );
        return;
      }
      const stamp = Date.now();
      setShowHelp(false);
      setSkipped(notLogged);
      setDrafts([
        ...txns.map((t, i): Draft => ({ ...t, kind: "txn", key: `${stamp}-t${i}` })),
        ...debts.map((d, i): Draft => ({ ...d, kind: "debt", key: `${stamp}-d${i}` })),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (busy || !drafts?.length) return;
    const token = getToken();
    if (!token) return;

    setError("");
    setSaving(true);
    // Sequential on purpose: each transaction save adjusts the bank balance.
    let logged = 0;
    try {
      for (const draft of drafts) {
        if (draft.kind === "txn") {
          const { key: _key, kind: _kind, ...t } = draft;
          await submitTransaction(t, token);
        } else {
          const { key: _key, kind: _kind, ...d } = draft;
          await submitDebtLent(d, token);
        }
        logged++;
      }
      const only = drafts[0];
      toast(
        drafts.length > 1
          ? `Logged ${drafts.length} ${batchNoun(drafts)}`
          : only.kind === "txn"
          ? `Logged ${only.title} — ${inr(Number(only.amount))}`
          : `${only.type === "lent" ? "Lent to" : "Borrowed from"} ${only.person} — ${inr(Number(only.amount))}`,
        "success"
      );
      setText("");
      setDrafts(null);
      setSkipped([]);
      setOpen(false);
      onAdd?.();
    } catch (err) {
      // Keep only what didn't save, so retrying can't duplicate anything.
      setDrafts(drafts.slice(logged));
      if (logged > 0) onAdd?.();
      const reason = err instanceof Error ? err.message : "Failed to add transaction";
      setError(logged > 0 ? `Saved ${logged}, the rest failed: ${reason}` : reason);
    } finally {
      setSaving(false);
    }
  };

  const removeDraft = (i: number) => {
    const next = drafts!.filter((_, j) => j !== i);
    if (drafts![i].key === editingKey) setEditingKey(null);
    setDrafts(next.length ? next : null);
    if (!next.length) setSkipped([]);
  };

  const updateDraft = (d: Draft) => {
    setDrafts((prev) => prev && prev.map((t) => (t.key === d.key ? d : t)));
    setEditingKey(null);
  };

  const backToText = () => {
    setDrafts(null);
    setSkipped([]);
    setEditingKey(null);
    setError("");
  };

  const trigger =
    variant === "fab" ? (
      <motion.button
        onClick={openSheet}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        aria-label="Quick Log"
        title="Quick Log"
        className="fixed bottom-[9.5rem] right-4 sm:bottom-24 sm:right-6 z-[60]
                   w-14 h-14 rounded-full flex items-center justify-center
                   bg-primary text-on-primary hover:bg-primary-active
                   transition-colors duration-200 cursor-pointer"
      >
        <Zap size={24} strokeWidth={2.5} />
      </motion.button>
    ) : (
      <button
        onClick={openSheet}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-canvas/80
                   text-left text-sm text-gray-500 hover:text-ink
                   ring-1 ring-transparent hover:ring-primary/40 transition-all duration-200 cursor-pointer"
      >
        <span className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-primary text-on-primary">
          <Zap size={16} strokeWidth={2.5} />
        </span>
        <span className="min-w-0">
          <span className="block font-bold text-ink">Quick Log</span>
          <span className="block truncate text-xs">Type or say it — we&apos;ll log it</span>
        </span>
      </button>
    );

  const today = localToday();
  const sum = (pred: (d: Draft) => boolean) =>
    drafts?.filter(pred).reduce((s, d) => s + Number(d.amount), 0) ?? 0;
  const totals = [
    { label: "Total out", amount: sum((d) => d.kind === "txn" && d.type === "expense") },
    { label: "Total in", amount: sum((d) => d.kind === "txn" && d.type === "income") },
    { label: "Lent", amount: sum((d) => d.kind === "debt" && d.type === "lent") },
    { label: "Borrowed", amount: sum((d) => d.kind === "debt" && d.type === "debt") },
  ].filter((t) => t.amount > 0);

  const iconButton =
    "shrink-0 p-1 rounded-full text-gray-400 hover:text-ink hover:bg-canvas/80 transition-colors cursor-pointer disabled:opacity-40";

  // Matches the entry cards on the Debt & Lent page: initial avatar, green for lent, red for owed.
  const renderDebtRow = (t: DebtDraft, i: number) => {
    const lent = t.type === "lent";
    const details = [
      lent ? "Lent" : "Borrowed",
      t.date && formatDay(t.date, today),
      t.dueDate && `due ${formatDay(t.dueDate, today)}`,
      t.reason,
    ].filter(Boolean);
    return (
      <motion.li
        key={t.key}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginTop: 0 }}
        transition={{ duration: 0.18, delay: i * 0.04 }}
        className={`rounded-xl bg-canvas-soft/80 px-3 py-2.5 ${editingKey === t.key ? "ring-2 ring-primary/50" : ""}`}
      >
        {editingKey === t.key ? (
          <DebtEditor draft={t} onSave={updateDraft} onCancel={() => setEditingKey(null)} />
        ) : (
          <div className="flex items-center gap-3">
            <span
              className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${
                lent ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
              }`}
            >
              {t.person.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">
                {lent ? "You lent " : "You owe "}
                <span className={lent ? "text-emerald-400" : "text-red-400"}>{t.person}</span>
              </p>
              <p className="truncate text-[11px] text-gray-500">{details.join(" · ")}</p>
            </div>
            <span className={`shrink-0 text-sm font-bold tabular-nums ${lent ? "text-emerald-400" : "text-red-400"}`}>
              {inr(Number(t.amount))}
            </span>
            <button
              type="button"
              onClick={() => setEditingKey(t.key)}
              disabled={saving}
              aria-label={`Edit entry for ${t.person}`}
              className={`${iconButton} -mr-1.5`}
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => removeDraft(i)}
              disabled={saving}
              aria-label={`Remove entry for ${t.person}`}
              className={iconButton}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </motion.li>
    );
  };

  const inputStep = (
    <motion.div key="input" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
      <AnimatePresence initial={false}>
        {showHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mb-4 rounded-xl bg-canvas-soft/80 p-3">
              <p className="text-xs font-bold text-ink mb-2">How to write it</p>
              <ul className="space-y-2">
                {TIPS.map((tip) => (
                  <li key={tip.label} className="text-xs">
                    <span className="text-gray-500">{tip.label}</span>
                    <button
                      type="button"
                      onClick={() => { setText(tip.example); setError(""); inputRef.current?.focus(); }}
                      className="block mt-0.5 font-semibold text-ink hover:text-primary transition-colors cursor-pointer text-left"
                    >
                      &ldquo;{tip.example}&rdquo;
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-gray-500">Tap an example to try it. You&apos;ll see everything before it&apos;s added.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => { setText(e.target.value); if (error) setError(""); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleParse();
          }
        }}
        placeholder={`e.g. ${placeholder}`}
        rows={3}
        maxLength={1000}
        disabled={parsing}
        readOnly={listening}
        className="w-full resize-none bg-canvas-soft/80 rounded-xl px-3.5 py-3 text-sm text-ink placeholder:text-gray-500
                   focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 disabled:opacity-60"
      />
      </div>

      {listening && (
        <p className="mt-2 text-xs font-semibold text-negative" aria-live="polite">
          Listening… tap the mic when you&apos;re done
        </p>
      )}
      {speech.error && !listening && (
        <p role="alert" className="mt-2 text-xs font-semibold text-negative">{speech.error}</p>
      )}

      {error && <p role="alert" className="mt-2 text-xs font-semibold text-negative">{error}</p>}
      {isOffline && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-warning-deep">
          <WifiOff size={12} /> Quick Log needs a connection — use the + form offline
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleParse}
          disabled={parsing || listening || isOffline || !text.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold
                     bg-primary text-on-primary hover:bg-primary-active transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {parsing ? <><Loader2 size={16} className="animate-spin" /> Reading…</> : "Log"}
        </button>
        {speech.supported && (
          <button
            type="button"
            onClick={toggleVoice}
            disabled={parsing || isOffline}
            aria-label={listening ? "Stop voice input" : "Speak instead of typing"}
            aria-pressed={listening}
            className="relative shrink-0 w-12 flex items-center justify-center rounded-xl font-bold
                       bg-primary text-on-primary hover:bg-primary-active transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {listening && <span className="absolute inset-1 rounded-lg bg-on-primary/25 animate-ping" aria-hidden />}
            <Mic size={18} strokeWidth={2.5} className="relative" />
          </button>
        )}
      </div>
    </motion.div>
  );

  const previewStep = drafts && (
    <motion.div key="preview" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }}>
      <p className="text-xs text-gray-500 mb-3">
        {drafts.length === 1 ? "This will be added:" : `These ${drafts.length} will be added:`}
      </p>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {drafts.map((t, i) => {
            if (t.kind === "debt") return renderDebtRow(t, i);
            const Icon = (CATEGORIES.find((c) => c.name === t.category) ?? CATEGORIES[CATEGORIES.length - 1]).icon;
            const color = CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.Others;
            const income = t.type === "income";
            return (
              <motion.li
                key={t.key}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.18, delay: i * 0.04 }}
                className={`rounded-xl bg-canvas-soft/80 px-3 py-2.5 ${editingKey === t.key ? "ring-2 ring-primary/50" : ""}`}
              >
                {editingKey === t.key ? (
                  <DraftEditor draft={t} onSave={updateDraft} onCancel={() => setEditingKey(null)} />
                ) : (
                <div className="flex items-center gap-3">
                <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${color.bg} ${color.text}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{t.title}</p>
                  <p className="flex items-center gap-1 truncate text-[11px] text-gray-500">
                    <span>{t.category}</span>
                    <span aria-hidden>·</span>
                    <span>{formatDay(t.date, today)}</span>
                    <span aria-hidden>·</span>
                    {t.paymentMode === "Cash" ? <Banknote size={11} /> : <CreditCard size={11} />}
                    <span>{t.paymentMode}</span>
                    {t.comment && (<><span aria-hidden>·</span><span className="truncate">{t.comment}</span></>)}
                  </p>
                </div>
                <span className={`shrink-0 text-sm font-bold tabular-nums ${income ? "text-positive" : "text-negative"}`}>
                  {income ? "+" : "−"}{inr(Number(t.amount))}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingKey(t.key)}
                  disabled={saving}
                  aria-label={`Edit ${t.title}`}
                  className="shrink-0 -mr-1.5 p-1 rounded-full text-gray-400 hover:text-ink hover:bg-canvas/80 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => removeDraft(i)}
                  disabled={saving}
                  aria-label={`Remove ${t.title}`}
                  className="shrink-0 p-1 rounded-full text-gray-400 hover:text-ink hover:bg-canvas/80 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <X size={14} />
                </button>
                </div>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {totals.length > 0 && (
        <p className="mt-3 text-xs text-gray-500 text-right">
          {totals.map((t, i) => (
            <span key={t.label}>
              {i > 0 && " · "}
              {t.label} <span className="font-bold text-ink">{inr(t.amount)}</span>
            </span>
          ))}
        </p>
      )}

      {skipped.length > 0 && (
        <p className="mt-3 rounded-lg bg-canvas-soft/80 px-3 py-2 text-[11px] text-gray-500">
          Not logged: {skipped.map((s) => `“${s}”`).join(", ")}. Record repayments on the Debt &amp; Lent page.
        </p>
      )}

      {error && <p role="alert" className="mt-2 text-xs font-semibold text-negative">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          onClick={backToText}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm
                     bg-canvas-soft/80 text-ink hover:bg-canvas-soft transition-colors duration-200
                     disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={saving || isOffline || editingKey !== null}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold
                     bg-primary text-on-primary hover:bg-primary-active transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving
            ? <><Loader2 size={16} className="animate-spin" /> Adding…</>
            : `Add ${drafts.length === 1 ? "" : `${drafts.length} `}${batchNoun(drafts)}`}
        </button>
      </div>
    </motion.div>
  );

  const sheet = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-scrim/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[80] px-0 sm:px-4 pointer-events-none"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-log-title"
              className="pointer-events-auto relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto
                         bg-canvas rounded-t-3xl sm:rounded-2xl shadow-lg p-5 pb-8 sm:pb-5"
            >
              <div className="flex items-center gap-1 mb-1 pr-8">
                <h2 id="quick-log-title" className="flex items-center gap-2 text-lg font-bold text-ink">
                  <Zap size={18} className="text-primary" strokeWidth={2.5} />
                  Quick Log
                </h2>
                {!drafts && (
                  <button
                    type="button"
                    onClick={() => setShowHelp((v) => !v)}
                    aria-expanded={showHelp}
                    aria-label="How to use Quick Log"
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      showHelp ? "text-primary bg-canvas-soft/80" : "text-gray-400 hover:text-ink"
                    }`}
                  >
                    <Info size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={close}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-canvas-soft/80 text-gray-400 hover:text-ink transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {!drafts && (
                <p className="text-xs text-gray-500 mb-4">
                  Separate items with commas or &ldquo;and&rdquo; to log several at once.
                </p>
              )}

              <AnimatePresence mode="wait" initial={false}>
                {drafts ? previewStep : inputStep}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {trigger}
      {mounted && createPortal(sheet, document.body)}
    </>
  );
}
