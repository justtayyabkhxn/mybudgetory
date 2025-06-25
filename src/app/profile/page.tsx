"use client";
import MenuButton from "@/components/Menu";
import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import axios, { AxiosError } from "axios";
import { Upload } from "lucide-react";
import { jwtDecode } from "jwt-decode";

type User = {
  name: string;
  email: string;
  phone: string;
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

type DecodedToken = {
  email: string;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [importMessageType, setImportMessageType] = useState<
    "success" | "error" | ""
  >("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleDeleteAllTransactions = async () => {
    if (deleteInput !== "delete") {
      setDeleteMessage("You must type 'delete' to confirm.");
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to delete transactions.");
        return;
      }

      const res = await axios.delete("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setDeleteMessage("✅ All transactions have been deleted.");
        setDeleteInput("");
        setShowDeleteConfirm(false);
        fetchTransactions();
      } else {
        setDeleteMessage("❌ Failed to delete transactions.");
      }
    } catch (err) {
      console.error(err);
      setDeleteMessage("❌ Error deleting transactions.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportMessage("Please select a JSON file to import.");
      setImportMessageType("error");
      return;
    }

    setIsImporting(true);
    try {
      const text = await importFile.text();
      const importedTxs: Omit<Transaction, "_id">[] = JSON.parse(text);

      const validTxs = importedTxs.filter(
        (tx) =>
          tx.title &&
          typeof tx.amount === "number" &&
          tx.category &&
          tx.type &&
          tx.date
      );

      if (validTxs.length === 0) {
        setImportMessage("No valid transactions found in the file.");
        setImportMessageType("error");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to import transactions.");
        return;
      }

      const response = await axios.post("/api/transactions/import", validTxs, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setImportMessage(
          `Successfully imported ${validTxs.length} transactions.`
        );
        setImportMessageType("success");
        setImportFile(null);
        fetchTransactions();
      } else {
        setImportMessage("Failed to import transactions.");
        setImportMessageType("error");
      }
    } catch (error) {
      console.error(error);
      setImportMessage(
        "Failed to import transactions. Please check the file format."
      );
      setImportMessageType("error");
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found. Please login.");
          return;
        }

        const decoded: DecodedToken = jwtDecode(token);

        const { data } = await axios.get("/api/user/profile", {
          params: { email: decoded.email },
        });

        setUser(data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch profile" + err);
      }
    };

    fetchTransactions();
    fetchProfile();
  }, []);

  const fetchTransactions = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions) setTxs(data.transactions);
      })
      .catch(console.error);
  };

  const handleDownloadData = () => {
    const data = txs;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match!");
      setMessageType("error");
      return;
    }

    try {
      const { data } = await axios.post("/api/user/update-password", {
        email: user?.email,
        oldPassword,
        newPassword,
      });

      setMessage(data.message || "Password changed successfully!");
      setMessageType("success");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setMessage(error.response?.data?.message || "Failed to change password.");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c2c] to-[#0d0f1f] py-5 px-4">
      <div className="max-w-2xl mx-auto bg-[#14162b] shadow-xl rounded-3xl p-4 md:p-10 mt-12 transform transition-all duration-300 hover:scale-[1.005]">
        <div className="flex justify-end mb-4">
          <MenuButton />
        </div>
        <div className="flex items-center justify-center mb-4">
          {/* Enhanced icon with a subtle shadow */}
          <FaUserCircle className="text-indigo-400 text-7xl drop-shadow-lg" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-10 pb-2 border-b-2 border-indigo-800">
          Your Profile
        </h1>

        {/* User Info */}
        <div className="space-y-6 mb-10">
          <div>
            <label
              htmlFor="name-input"
              className="block text-gray-300 text-sm font-semibold mb-1"
            >
              Name
            </label>
            <input
              id="name-input"
              value={user?.name || "User"}
              disabled
              className="w-full px-4 py-3 mt-1 rounded-xl bg-gray-800 text-white border border-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label
              htmlFor="email-input"
              className="block text-gray-300 text-sm font-semibold mb-1"
            >
              Email
            </label>
            <input
              id="email-input"
              value={user?.email || "user@gmail.com"}
              disabled
              className="w-full px-4 py-3 mt-1 rounded-xl bg-gray-800 text-white border border-gray-700 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Download Button with Custom Tooltip */}
        <div className="relative group mb-6">
          <button
            onClick={handleDownloadData}
            className="w-full mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer font-bold text-lg transform hover:-translate-y-0.5"
            aria-describedby="download-tooltip"
          >
            Download Your Data (JSON)
          </button>
          <div
            id="download-tooltip"
            role="tooltip"
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap
            before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-t-gray-800 before:border-x-transparent before:border-b-transparent"
          >
            Download all your transaction data as a JSON file.
          </div>
        </div>

        {/* Import Section */}
        <div className="mb-8 p-6 bg-[#1f233a] rounded-2xl shadow-inner border border-blue-900">
          <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6" /> Import Transactions
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Upload a JSON file containing your transaction data. Ensure the
            format matches the downloaded data.
          </p>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-800 file:text-blue-200
                     hover:file:bg-blue-700
                     cursor-pointer
                     mb-4"
          />
          <button
            onClick={handleImport}
            disabled={isImporting}
            className={`w-full py-3 px-4 rounded-xl shadow-md text-white transition-all duration-300 font-semibold cursor-pointer text-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5 ${
              isImporting
                ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            }`}
          >
            {isImporting ? (
              "Importing..."
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import Transactions
              </>
            )}{" "}
          </button>

          {importMessage && (
            <p
              className={`mt-4 text-center text-sm font-medium animate-fade-in ${
                importMessageType === "success"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {importMessage}
            </p>
          )}
        </div>

        {/* Delete All Transactions Section */}
        <div className="mb-10">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full mt-4 bg-gradient-to-r from-red-500 to-pink-500 cursor-pointer text-white py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition font-bold text-lg transform hover:-translate-y-0.5"
            >
              Delete All Transactions
            </button>
          ) : (
            <div className="bg-red-950 p-6 mt-4 rounded-2xl shadow-inner border border-red-800 animate-fade-in">
              <p className="text-base font-semibold text-red-300 mb-3 leading-relaxed">
                <span className="font-extrabold text-lg mr-1">⚠️</span>This
                action is irreversible. All your transaction data will be
                permanently deleted. To confirm, type{" "}
                <strong className="text-red-200">delete</strong> below:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder='Type "delete" to confirm'
                className="w-full px-4 py-2.5 rounded-lg border border-red-300 bg-gray-800 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200 ease-in-out"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAllTransactions}
                  disabled={isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput("");
                    setDeleteMessage("");
                  }}
                  className="flex-1 bg-gray-700 text-white py-2.5 rounded-lg font-semibold shadow hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Cancel
                </button>
              </div>

              {deleteMessage && (
                <p
                  className={`text-sm mt-4 text-center font-medium animate-fade-in ${
                    deleteMessage.includes("✅")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {deleteMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Password Change Form */}
        <form
          onSubmit={handlePasswordChange}
          className="space-y-6 p-6 bg-[#1f233a] rounded-2xl shadow-inner border border-gray-900"
        >
          <h2 className="text-2xl font-bold text-gray-200 border-b-2 border-indigo-800 pb-3 mb-4">
            Change Password
          </h2>

          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {message && (
            <p
              className={`text-sm font-medium mt-3 text-center animate-fade-in ${
                messageType === "success"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer font-bold text-lg transform hover:-translate-y-0.5"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}