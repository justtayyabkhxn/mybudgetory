"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Gem,
  Plus,
  X,
  RefreshCw,
  Pencil,
  Trash2,
  LineChart,
  Coins,
  Bitcoin,
  Landmark,
  Clock,
  ChevronRight,
  PiggyBank,
  Loader2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import DatePicker from "@/components/DatePicker";
import ConfirmDialog from "@/components/ConfirmDialog";
import PrivacyToggle from "@/components/PrivacyToggle";
import { usePrivacyMode, MASKED } from "@/hooks/usePrivacyMode";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";

/* ── types ────────────────────────────────────────────────── */

type Market = "indian_stock" | "crypto" | "precious_metal";

interface Valuation {
  _id: string;
  at: string;
  value: number;
}

interface Asset {
  _id: string;
  market: Market;
  name: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  valuations: Valuation[];
  cost: number;
  currentValue: number;
  gain: number;
  gainPct: number;
  lastValuedAt: string | null;
}

interface Totals {
  cost: number;
  value: number;
  gain: number;
}

const MARKETS: { key: Market; label: string; icon: React.ReactNode; tint: string }[] = [
  { key: "indian_stock", label: "Indian Stocks", icon: <Landmark size={14} />, tint: "text-blue-400 bg-blue-500/15" },
  { key: "crypto", label: "Crypto", icon: <Bitcoin size={14} />, tint: "text-violet-400 bg-violet-500/15" },
  { key: "precious_metal", label: "Precious Metals", icon: <Coins size={14} />, tint: "text-warning-deep bg-amber-500/15" },
];

/* ── helpers ──────────────────────────────────────────────── */

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function signedInr(n: number) {
  return `${n >= 0 ? "+" : "-"}${inr(Math.abs(n))}`;
}

function qty(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 8 });
}

function gainClass(n: number) {
  return n > 0 ? "text-emerald-400" : n < 0 ? "text-red-400" : "text-gray-400";
}

function fmtDate(iso: string) {
  // Buy dates are calendar days stored as UTC midnight
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Local "YYYY-MM-DDTHH:mm" for a datetime-local input. */
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function todayISO() {
  return toLocalInput(new Date()).slice(0, 10);
}

function computeTotals(list: Asset[]): Totals {
  const cost = list.reduce((s, a) => s + a.cost, 0);
  const value = list.reduce((s, a) => s + a.currentValue, 0);
  return { cost, value, gain: value - cost };
}

async function readError(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  return (data as { error?: string }).error || fallback;
}

const inputClass =
  "w-full bg-canvas-soft/80 text-ink rounded-xl px-3.5 py-2.5 text-sm placeholder-mute focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block";

const cardMotion = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/* ── add / edit form ──────────────────────────────────────── */

type FormValues = { market: Market; name: string; quantity: string; buyPrice: string; buyDate: string };

function AssetForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: FormValues;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (v: FormValues) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormValues>(initial);
  const q = parseFloat(form.quantity);
  const p = parseFloat(form.buyPrice);
  const invested = Number.isFinite(q) && Number.isFinite(p) ? q * p : 0;

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      {/* 1. Market */}
      <div>
        <label className={labelClass}>Market</label>
        <div className="grid grid-cols-3 gap-1 bg-canvas-soft/80 rounded-xl p-1">
          {MARKETS.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => setForm(f => ({ ...f, market: m.key }))}
              aria-pressed={form.market === m.key}
              className={`px-2 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                form.market === m.key ? "bg-primary text-on-primary shadow-sm" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Name */}
      <div>
        <label className={labelClass}>Name</label>
        <input
          required
          maxLength={60}
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder={form.market === "crypto" ? "e.g. BTC" : form.market === "precious_metal" ? "e.g. Gold 24K" : "e.g. TCS"}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 3. Quantity */}
        <div>
          <label className={labelClass}>Quantity</label>
          <input
            required
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
            placeholder="0"
            className={inputClass}
          />
        </div>
        {/* 4. Buy price */}
        <div>
          <label className={labelClass}>Buy price (per unit)</label>
          <input
            required
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={form.buyPrice}
            onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))}
            placeholder="₹0"
            className={inputClass}
          />
        </div>
      </div>

      {/* 5. Buy date */}
      <div>
        <label className={labelClass}>Buy date</label>
        <DatePicker
          required
          value={form.buyDate}
          max={todayISO()}
          onChange={v => setForm(f => ({ ...f, buyDate: v }))}
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl bg-canvas-soft/60 px-3.5 py-2.5">
        <span className="text-xs font-semibold text-gray-500">Invested</span>
        <span className="text-sm font-black text-ink tabular-nums">{inr(invested)}</span>
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-canvas-soft/80 text-gray-400 hover:text-ink text-sm font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-primary hover:bg-primary-active text-on-primary py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function formBody(v: FormValues) {
  return JSON.stringify({
    market: v.market,
    name: v.name.trim(),
    quantity: parseFloat(v.quantity),
    buyPrice: parseFloat(v.buyPrice),
    buyDate: v.buyDate,
  });
}

function validate(v: FormValues): string | null {
  if (!v.name.trim()) return "Enter a name";
  const q = parseFloat(v.quantity);
  if (!Number.isFinite(q) || q <= 0) return "Quantity must be more than 0";
  const p = parseFloat(v.buyPrice);
  if (!Number.isFinite(p) || p < 0) return "Buy price must be 0 or more";
  if (!v.buyDate) return "Pick a buy date";
  return null;
}

/* ── holding detail ───────────────────────────────────────── */

function AssetDetail({
  asset,
  onClose,
  onChanged,
  onDeleted,
}: {
  asset: Asset;
  onClose: () => void;
  onChanged: (a: Asset) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState("");
  const [at, setAt] = useState(() => toLocalInput(new Date()));
  const [valuing, setValuing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removingValuation, setRemovingValuation] = useState<string | null>(null);
  const { hidden } = usePrivacyMode();
  const money = (s: string) => (hidden ? MASKED : s);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !confirmDelete) onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, confirmDelete]);

  const market = MARKETS.find(m => m.key === asset.market)!;
  const history = [...asset.valuations].sort((a, b) => +new Date(b.at) - +new Date(a.at));

  const saveEdit = async (v: FormValues) => {
    const err = validate(v);
    if (err) { toast(err, "error"); return; }
    setSaving(true);
    try {
      const res = await apiFetch(`/api/assets/${asset._id}`, { method: "PATCH", body: formBody(v) });
      if (!res.ok) throw new Error(await readError(res, "Could not save"));
      onChanged(await res.json());
      setEditing(false);
      toast("Holding updated", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  const addValuation = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(value);
    if (!Number.isFinite(v) || v < 0) { toast("Enter a valid value", "error"); return; }
    const when = new Date(at);
    if (isNaN(when.getTime())) { toast("Pick a date and time", "error"); return; }
    setValuing(true);
    try {
      const res = await apiFetch(`/api/assets/${asset._id}/valuations`, {
        method: "POST",
        body: JSON.stringify({ value: v, at: when.toISOString() }),
      });
      if (!res.ok) throw new Error(await readError(res, "Could not update value"));
      onChanged(await res.json());
      setValue("");
      setAt(toLocalInput(new Date()));
      toast("Value updated", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update value", "error");
    } finally {
      setValuing(false);
    }
  };

  const removeValuation = async (id: string) => {
    setRemovingValuation(id);
    try {
      const res = await apiFetch(`/api/assets/${asset._id}/valuations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Could not delete"));
      onChanged(await res.json());
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete", "error");
    } finally {
      setRemovingValuation(null);
    }
  };

  const deleteAsset = async () => {
    setConfirmDelete(false);
    try {
      const res = await apiFetch(`/api/assets/${asset._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await readError(res, "Could not delete"));
      onDeleted(asset._id);
      toast("Holding deleted", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete", "error");
    }
  };

  const stats = [
    { label: "Quantity", value: qty(asset.quantity) },
    { label: "Buy price", value: money(inr(asset.buyPrice)) },
    { label: "Invested", value: money(inr(asset.cost)) },
    { label: "Current value", value: money(inr(asset.currentValue)) },
    { label: "Bought", value: fmtDate(asset.buyDate) },
    {
      label: "Gain",
      value: `${money(signedInr(asset.gain))} (${asset.gainPct >= 0 ? "+" : ""}${asset.gainPct.toFixed(1)}%)`,
      className: gainClass(asset.gain),
    },
  ];

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-scrim/70 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center sm:p-4 pointer-events-none"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={asset.name}
          className="pointer-events-auto w-full sm:max-w-lg max-h-[88vh] overflow-y-auto bg-canvas rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-lg"
        >
          {/* Title */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${market.tint}`}>
                {market.icon}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black text-ink truncate">{asset.name}</p>
                <p className="text-[11px] text-gray-500">{market.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 rounded-xl bg-gray-800/60 text-gray-500 hover:text-ink transition-all cursor-pointer"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-gray-800/60 text-gray-500 hover:text-ink transition-all cursor-pointer"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {editing ? (
            <AssetForm
              initial={{
                market: asset.market,
                name: asset.name,
                quantity: String(asset.quantity),
                buyPrice: String(asset.buyPrice),
                buyDate: asset.buyDate.slice(0, 10),
              }}
              submitLabel="Save changes"
              submitting={saving}
              onSubmit={saveEdit}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-gray-800 rounded-2xl overflow-hidden">
                {stats.map(s => (
                  <div key={s.label} className="bg-gray-900/95 px-3.5 py-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.label}</p>
                    <p className={`text-sm font-black mt-0.5 tabular-nums ${s.className ?? "text-ink"}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 flex items-center gap-1.5 -mt-2">
                <Clock size={11} />
                {asset.lastValuedAt ? `Valued ${fmtDateTime(asset.lastValuedAt)}` : "Not valued yet — shown at cost"}
              </p>

              {/* Update value */}
              <form onSubmit={addValuation} className="rounded-2xl bg-canvas-soft/60 p-4 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-ink-deep flex items-center gap-1.5">
                  <LineChart size={13} /> Update value
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Total current value</label>
                    <input
                      required
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      placeholder={hidden ? MASKED : String(Math.round(asset.currentValue))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>As of</label>
                    <input
                      required
                      type="datetime-local"
                      value={at}
                      max={toLocalInput(new Date())}
                      onChange={e => setAt(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-500">
                  The whole holding&apos;s worth ({qty(asset.quantity)} units), not the per-unit price.
                </p>
                <button
                  type="submit"
                  disabled={valuing}
                  className="w-full bg-primary hover:bg-primary-active text-on-primary py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {valuing ? "Saving…" : "Save value"}
                </button>
              </form>

              {/* Valuation history */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valuation history</p>
                {history.length === 0 ? (
                  <p className="text-xs text-gray-600">No valuations yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-800/60">
                    {history.map((v, i) => {
                      const older = history[i + 1];
                      const delta = older ? v.value - older.value : null;
                      return (
                        <li key={v._id} className="flex items-center gap-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-ink tabular-nums">{money(inr(v.value))}</p>
                            <p className="text-[11px] text-gray-500">{fmtDateTime(v.at)}</p>
                          </div>
                          {delta !== null && (
                            <span className={`text-[11px] font-bold tabular-nums ${gainClass(delta)}`}>
                              {money(signedInr(delta))}
                            </span>
                          )}
                          <button
                            onClick={() => removeValuation(v._id)}
                            disabled={removingValuation === v._id}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-40"
                            title="Delete valuation"
                          >
                            {removingValuation === v._id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete holding"
        message={`${asset.name} and its valuation history will be permanently removed.`}
        confirmLabel="Delete"
        danger
        onConfirm={deleteAsset}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

/* ── page ─────────────────────────────────────────────────── */

export default function AssetsPage() {
  useAuthGuard();
  const { hidden } = usePrivacyMode();
  const money = (s: string) => (hidden ? MASKED : s);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/assets");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAssets(data.assets || []);
    } catch {
      toast("Failed to load assets", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const replaceAsset = (a: Asset) => {
    setAssets(prev => prev.map(x => (x._id === a._id ? a : x)));
  };

  const removeAsset = (id: string) => {
    setSelectedId(null);
    setAssets(prev => prev.filter(x => x._id !== id));
  };

  const handleAdd = async (v: FormValues) => {
    const err = validate(v);
    if (err) { toast(err, "error"); return; }
    setAdding(true);
    try {
      const res = await apiFetch("/api/assets", { method: "POST", body: formBody(v) });
      if (!res.ok) throw new Error(await readError(res, "Could not add holding"));
      const created: Asset = await res.json();
      setAssets(prev => [...prev, created]);
      setFormKey(k => k + 1);
      setShowAdd(false);
      toast("Holding added", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not add holding", "error");
    } finally {
      setAdding(false);
    }
  };

  const grouped = useMemo(
    () =>
      MARKETS.map(m => {
        const items = assets.filter(a => a.market === m.key);
        return { ...m, items, value: items.reduce((s, a) => s + a.currentValue, 0) };
      }).filter(g => g.items.length > 0),
    [assets],
  );

  // Same sums the server returns in `totals`, kept live across local edits
  const totals = useMemo(() => computeTotals(assets), [assets]);
  const selected = assets.find(a => a._id === selectedId) ?? null;
  const gainPct = totals.cost > 0 ? (totals.gain / totals.cost) * 100 : 0;

  return (
    <div className="min-h-screen md:pt-20 text-ink p-4 sm:p-8 pb-28">
      <div className="max-w-4xl mx-auto">
        <div className="md:hidden">
          <Header />
        </div>

        {/* Page header */}
        <div className="flex items-center justify-between mt-4 mb-8">
          <div className="flex items-center gap-2">
            <Gem className="text-blue-400" size={26} />
            <h1 className="text-3xl font-extrabold tracking-tight">Assets</h1>
            <button
              onClick={load}
              className="ml-1 p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-green-400 ${loading ? "animate-spin" : ""}`} />
            </button>
            <PrivacyToggle />
          </div>
          <MenuButton />
        </div>

        <div className="space-y-4">
          {/* Summary */}
          {loading ? (
            <div className="animate-pulse bg-gray-800/60 rounded-2xl h-32" />
          ) : (
            <motion.div {...cardMotion(0)} className="bg-canvas/80 rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total value</p>
              <p className="text-3xl font-black text-blue-300 mt-1 tabular-nums">{money(inr(totals.value))}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Invested</p>
                  <p className="text-base font-black text-ink tabular-nums">{money(inr(totals.cost))}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total gain</p>
                  <p className={`text-base font-black tabular-nums ${gainClass(totals.gain)}`}>
                    {money(signedInr(totals.gain))}
                    <span className="text-xs font-bold ml-1.5">
                      ({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%)
                    </span>
                  </p>
                </div>
              </div>
              <Link
                href="/net-worth"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-ink transition-colors"
              >
                <PiggyBank size={12} /> Counted in your net worth <ChevronRight size={12} />
              </Link>
            </motion.div>
          )}

          {/* Add holding */}
          {!loading && (
            <motion.div {...cardMotion(0.06)} className="bg-canvas/80 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowAdd(v => !v)}
                className="w-full flex items-center gap-2 px-6 py-4 text-sm font-bold text-ink hover:bg-canvas-soft/60 transition-colors cursor-pointer"
                aria-expanded={showAdd}
              >
                <span className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                  {showAdd ? <X size={14} /> : <Plus size={14} />}
                </span>
                {showAdd ? "Cancel" : "Add holding"}
              </button>
              <AnimatePresence initial={false}>
                {showAdd && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-1">
                      <AssetForm
                        key={formKey}
                        initial={{ market: "indian_stock", name: "", quantity: "", buyPrice: "", buyDate: todayISO() }}
                        submitLabel="Add holding"
                        submitting={adding}
                        onSubmit={handleAdd}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Holdings, grouped by market */}
          {!loading && assets.length === 0 && (
            <motion.div
              {...cardMotion(0.12)}
              className="bg-gray-900/60 rounded-2xl p-10 text-center"
            >
              <Gem size={28} className="text-ink mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No holdings yet</p>
              <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                Add your stocks, crypto or gold. Update their value whenever you check — your
                net worth chart picks it up.
              </p>
            </motion.div>
          )}

          {!loading &&
            grouped.map((g, gi) => (
              <motion.div
                key={g.key}
                {...cardMotion(0.12 + gi * 0.05)}
                className="bg-gray-900/60 rounded-2xl overflow-hidden"
              >
                <div className="px-6 pt-5 pb-3 flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${g.tint}`}>{g.icon}</div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{g.label}</p>
                  <p className="ml-auto text-sm font-black text-ink tabular-nums">{money(inr(g.value))}</p>
                </div>
                <ul className="px-3 pb-3">
                  {g.items.map(a => (
                    <li key={a._id}>
                      <button
                        onClick={() => setSelectedId(a._id)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-canvas-soft/60 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-ink truncate">{a.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {qty(a.quantity)} units ·{" "}
                            {a.lastValuedAt ? `valued ${fmtDateTime(a.lastValuedAt)}` : "not valued yet"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-ink tabular-nums">{money(inr(a.currentValue))}</p>
                          <p className={`text-[11px] font-bold tabular-nums ${gainClass(a.gain)}`}>
                            {money(signedInr(a.gain))} ({a.gainPct >= 0 ? "+" : ""}{a.gainPct.toFixed(1)}%)
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-gray-600 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <AssetDetail
            key={selected._id}
            asset={selected}
            onClose={() => setSelectedId(null)}
            onChanged={replaceAsset}
            onDeleted={removeAsset}
          />
        )}
      </AnimatePresence>

      <Footer />
      <FloatingTransactionButton />
      <BottomNav />
    </div>
  );
}
