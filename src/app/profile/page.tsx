"use client";

import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivacyMode } from "@/hooks/usePrivacyMode";
import { clearQueue } from "@/lib/offlineQueue";
import { toast } from "@/lib/toast";

type UserProfile = {
  name: string;
  email: string;
  phone?: string;
};

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  comment?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(n: number) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n}`;
}

// ─── Section card wrapper ──────────────────────────────────────────────────────
function Section({
  icon,
  title,
  accent,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="bg-canvas/80 rounded-2xl overflow-hidden"
    >
      <div className={`flex items-center gap-2.5 px-5 py-4 border-b border-hairline ${accent}`}>
        {icon}
        <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </motion.div>
  );
}

// ─── Password input with show/hide ────────────────────────────────────────────
function PasswordField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full bg-canvas-soft/80 rounded-xl px-4 py-3 pr-11 text-sm text-ink placeholder-mute focus:outline-none focus:ring-2 focus:ring-primary transition"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

// ─── Delete modal overlay ─────────────────────────────────────────────────────
function DeleteModal({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!open) setInput("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-scrim/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div
              className="w-full max-w-sm bg-canvas/80 rounded-2xl p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle size={18} />
                  <span className="text-sm font-black uppercase tracking-widest">
                    Danger Zone
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-300 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-1">
                This will permanently delete{" "}
                <span className="text-ink font-bold">all your transactions</span>.
                This action cannot be undone.
              </p>
              <p className="text-gray-500 text-xs mb-4">
                Type <span className="text-red-400 font-bold">delete</span> to confirm.
              </p>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Type "delete"'
                className="w-full bg-canvas-soft/80 rounded-xl px-4 py-2.5 text-sm text-ink placeholder-mute focus:outline-none focus:ring-2 focus:ring-red-500/50 transition mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-canvas-soft/80 hover:bg-primary-pale text-gray-300 text-sm font-semibold transition"
                >
                  <span>

                  Cancel
                  </span>
                </button>
                <button
                  onClick={onConfirm}
                  disabled={input !== "delete" || isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-on-solid text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  {isDeleting ? "Deleting…" : "Delete All"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Delete account modal ─────────────────────────────────────────────────────
const DELETED_ON_ACCOUNT_DELETE = [
  "Your profile (name, email, password)",
  "All transactions and expenses",
  "Bank balance and net-worth history",
  "Assets and their valuations",
  "Budget goals, debts and recurring payments",
  "Split-bill events you created",
];

function DeleteAccountModal({
  open,
  onClose,
  onConfirm,
  isDeleting,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  isDeleting: boolean;
  error: string | null;
}) {
  const [password, setPassword] = useState("");

  // Forget the typed password whenever the dialog is dismissed
  const close = () => {
    setPassword("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-scrim/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isDeleting ? undefined : close}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={isDeleting ? undefined : close}
          >
            <form
              className="w-full max-w-sm bg-canvas rounded-2xl p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                if (password && !isDeleting) onConfirm(password);
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle size={18} />
                  <span className="text-sm font-black uppercase tracking-widest">
                    Delete account
                  </span>
                </div>
                <button
                  type="button"
                  onClick={close}
                  disabled={isDeleting}
                  className="text-gray-600 hover:text-gray-300 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                This <span className="text-ink font-bold">permanently</span> deletes your account
                and everything in it. It cannot be undone.
              </p>
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                {DELETED_ON_ACCOUNT_DELETE.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Trash2 size={12} className="text-red-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                Confirm with your password
              </label>
              <PasswordField
                placeholder="Current password"
                value={password}
                onChange={setPassword}
              />
              {error && (
                <p className="text-xs text-red-400 font-semibold mt-2">✗ {error}</p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={close}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-canvas-soft/80 hover:bg-primary-pale text-gray-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!password || isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-on-solid text-sm font-bold transition flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  {isDeleting ? "Deleting…" : "Delete forever"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Drops everything this browser holds for the signed-in user — the same
 * session teardown as Sign Out (cookie + token), plus the offline queue and
 * the per-user caches, since the account they belonged to no longer exists.
 */
async function clearLocalSession() {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch {
    /* cookie clear is best-effort */
  }
  clearQueue();
  const userKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith("ai_") || k === "split-data")) userKeys.push(k);
  }
  userKeys.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("token");
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Profile() {
  const router = useRouter();
  const { hidden, toggle } = usePrivacyMode();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // import
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  // delete account
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  // export success flash
  const [exportDone, setExportDone] = useState(false);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.transactions) setTxs(data.transactions);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        await fetchTransactions();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(txs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mybudgetory-transactions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportStatus({ msg: "Please select a JSON file.", ok: false });
      return;
    }
    setIsImporting(true);
    try {
      const text = await importFile.text();
      const parsed: Omit<Transaction, "_id">[] = JSON.parse(text);
      const valid = parsed.filter(
        (t) => t.title && typeof t.amount === "number" && t.category && t.type && t.date
      );
      if (valid.length === 0) {
        setImportStatus({ msg: "No valid transactions found.", ok: false });
        return;
      }
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/transactions/import", valid, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 201) {
        setImportStatus({ msg: `Imported ${valid.length} transactions.`, ok: true });
        setImportFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        await fetchTransactions();
      } else {
        setImportStatus({ msg: "Import failed.", ok: false });
      }
    } catch {
      setImportStatus({ msg: "Invalid file format.", ok: false });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setShowDelete(false);
        setDeleteStatus({ msg: "All transactions deleted.", ok: true });
        await fetchTransactions();
      } else {
        setDeleteStatus({ msg: "Delete failed.", ok: false });
      }
    } catch {
      setDeleteStatus({ msg: "Error deleting transactions.", ok: false });
    } finally {
      setIsDeleting(false);
    }
  };

  // Plain fetch rather than apiFetch: a wrong password comes back as 401, which
  // apiFetch treats as an expired session and signs the user out.
  const handleDeleteAccount = async (password: string) => {
    setIsDeletingAccount(true);
    setDeleteAccountError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password }),
      });
      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        // A missing/expired session also 401s — only a password miss says so
        if (data.error === "Incorrect password") {
          setDeleteAccountError("Incorrect password");
        } else {
          await clearLocalSession();
          window.location.href = "/login";
        }
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteAccountError(data.error || "Could not delete account. Try again.");
        return;
      }
      await clearLocalSession();
      toast("Account deleted", "success");
      router.replace("/login");
    } catch {
      setDeleteAccountError("Could not delete account. Try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus({ msg: "New passwords do not match.", ok: false });
      return;
    }
    setPwLoading(true);
    try {
      const { data } = await axios.post("/api/user/update-password", {
        email: user?.email,
        oldPassword,
        newPassword,
      });
      setPwStatus({ msg: data.message || "Password updated!", ok: true });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setPwStatus({ msg: error.response?.data?.message || "Failed to update.", ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  // ── Avatar ──────────────────────────────────────────────────────────────────
  const initials = user ? getInitials(user.name) : "?";

  return (
    <main className="min-h-screen md:pt-20 text-ink pb-28">

      {/* Header */}
      <div className="md:hidden sticky top-0 z-40 bg-canvas-soft/80 backdrop-blur-xl border-b border-hairline">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">
            MyBudgetory
          </p>
          <h1 className="text-lg font-black text-ink">Profile</h1>
        </div>
      </div>

      {/* Menu button — fixed outside stacking context so backdrop/drawer render correctly */}
      <div className="fixed top-3 right-4 z-50">
        <MenuButton />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 relative">

        {/* ── Avatar + hero ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center pt-4 pb-6"
        >
          {/* Avatar ring */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-black text-on-primary shadow-lg">
              {loading ? (
                <Loader2 size={24} className="animate-spin opacity-60" />
              ) : (
                initials
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-2 border-canvas" />
          </div>

          {loading ? (
            <div className="space-y-2 w-40 text-center">
              <div className="h-5 bg-canvas/80 rounded-full animate-pulse mx-auto w-32" />
              <div className="h-3.5 bg-canvas/80 rounded-full animate-pulse mx-auto w-44" />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-ink">{user?.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
            </>
          )}
        </motion.div>

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="space-y-2"
        >
          <div className="flex justify-end">
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-300 transition cursor-pointer"
              title={hidden ? "Show amounts" : "Hide amounts"}
            >
              {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
              {hidden ? "Amounts hidden" : "Amounts visible"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Transactions", value: loading ? "—" : txs.length.toString(), color: "text-indigo-400", maskable: false },
              { label: "Total Income", value: loading ? "—" : formatCurrency(totalIncome), color: "text-emerald-400", maskable: true },
              { label: "Total Spent", value: loading ? "—" : formatCurrency(totalExpenses), color: "text-rose-400", maskable: true },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-canvas/80 rounded-2xl px-3 py-4 text-center"
              >
                <p className={`text-base font-black ${s.color}`}>
                  {s.maskable && hidden && !loading ? "******" : s.value}
                </p>
                <p className="text-[10px] text-gray-600 font-semibold mt-1 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Account Info ──────────────────────────────────────────────────── */}
        <Section
          icon={<User size={14} />}
          title="Account Info"
          accent="text-indigo-400"
          delay={0.12}
        >
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
              Full Name
            </label>
            <div className="w-full bg-canvas-soft/80 rounded-xl px-4 py-3 text-sm text-body font-semibold">
              {loading ? (
                <span className="block h-4 bg-canvas/80 rounded animate-pulse w-36" />
              ) : (
                user?.name || "—"
              )}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
              Email Address
            </label>
            <div className="w-full bg-canvas-soft/80 rounded-xl px-4 py-3 text-sm text-body font-semibold">
              {loading ? (
                <span className="block h-4 bg-canvas/80 rounded animate-pulse w-48" />
              ) : (
                user?.email || "—"
              )}
            </div>
          </div>
        </Section>

        {/* ── Data Management ───────────────────────────────────────────────── */}
        <Section
          icon={<Download size={14} />}
          title="Data Management"
          accent="text-ink-deep"
          delay={0.18}
        >
          {/* Export */}
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Download all your transaction data as a JSON file.
            </p>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 text-sm font-bold transition"
            >
              {exportDone ? (
                <>
                  <Check size={15} />
                  <span>

                  Downloaded!
                  </span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>

                  Export JSON ({txs.length} transactions)
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-hairline" />

          {/* Import */}
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Import transactions from a JSON file. Must match the export format.
            </p>

            {/* Drop zone / file picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed hover:border-primary/40 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition group mb-3"
            >
              <Upload
                size={20}
                className="text-gray-600 group-hover:text-ink-deep transition"
              />
              {importFile ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-deep font-semibold">
                    {importFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImportFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-gray-600 hover:text-red-400 transition"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-gray-600 group-hover:text-gray-400 transition">
                  Click to select a JSON file
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                if (e.target.files?.[0]) setImportFile(e.target.files[0]);
              }}
              className="hidden"
            />

            <button
              onClick={handleImport}
              disabled={isImporting || !importFile}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600/15 hover:bg-sky-600/25 text-ink-deep text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              <span>

              {isImporting ? "Importing…" : "Import Transactions"}
              </span>
            </button>

            <AnimatePresence>
              {importStatus && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs text-center mt-3 font-semibold ${importStatus.ok ? "text-emerald-400" : "text-red-400"}`}
                >
                  {importStatus.ok ? "✓ " : "✗ "}
                  {importStatus.msg}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="border-t border-hairline" />

          {/* Delete all */}
          <div>
            <p className="text-xs text-gray-500 mb-3">
              Permanently remove all your transaction records. This cannot be undone.
            </p>

            {deleteStatus && (
              <p
                className={`text-xs text-center mb-3 font-semibold ${deleteStatus.ok ? "text-emerald-400" : "text-red-400"}`}
              >
                {deleteStatus.ok ? "✓ " : "✗ "}
                {deleteStatus.msg}
              </p>
            )}

            <button
              onClick={() => setShowDelete(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-bold transition"
            >
              <Trash2 size={15} />
              <span>

              Delete All Transactions
              </span>
            </button>
          </div>
        </Section>

        {/* ── Security / Change Password ────────────────────────────────────── */}
        <Section
          icon={<Shield size={14} />}
          title="Security"
          accent="text-purple-400"
          delay={0.24}
        >
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                Current Password
              </label>
              <PasswordField
                placeholder="Enter current password"
                value={oldPassword}
                onChange={setOldPassword}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                New Password
              </label>
              <PasswordField
                placeholder="Enter new password"
                value={newPassword}
                onChange={setNewPassword}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                Confirm New Password
              </label>
              <PasswordField
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            </div>

            <AnimatePresence>
              {pwStatus && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs text-center font-semibold ${pwStatus.ok ? "text-emerald-400" : "text-red-400"}`}
                >
                  {pwStatus.ok ? "✓ " : "✗ "}
                  {pwStatus.msg}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-active text-on-primary text-sm font-black transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {pwLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <KeyRound size={15} />
              )}
              <span>

              {pwLoading ? "Updating…" : "Update Password"}
              </span>
            </button>
          </form>
        </Section>

        {/* ── Privacy ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.27 }}
        >
          <Link
            href="/privacy"
            className="flex items-center gap-3 bg-canvas/80 rounded-2xl px-5 py-4 text-sm font-semibold text-body hover:bg-canvas-soft/80 transition"
          >
            <ShieldCheck size={16} className="text-ink-deep" />
            Privacy policy
            <ChevronRight size={16} className="ml-auto text-gray-500" />
          </Link>
        </motion.div>

        {/* ── Danger zone ───────────────────────────────────────────────────── */}
        <Section
          icon={<AlertTriangle size={14} />}
          title="Danger zone"
          accent="text-red-400"
          delay={0.3}
        >
          <p className="text-xs text-gray-500">
            Permanently delete your account and all of its data — transactions, balances,
            assets, goals, debts, recurring payments and split events. This cannot be undone.
          </p>
          <button
            onClick={() => {
              setDeleteAccountError(null);
              setShowDeleteAccount(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-bold transition"
          >
            <Trash2 size={15} />
            <span>Delete account</span>
          </button>
        </Section>

      </div>

      <DeleteAccountModal
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeletingAccount}
        error={deleteAccountError}
      />

      {/* Delete modal */}
      <DeleteModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteAll}
        isDeleting={isDeleting}
      />

      <BottomNav />
    </main>
  );
}
