'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users2, Trash2, Contact } from 'lucide-react';
import MenuButton from '@/components/Menu';
import Header from '@/components/Header';

type Person = {
  name: string;
  phone: string;
  paid: boolean;
};

const STORAGE_KEY = 'split-data';

export default function SplitPage() {
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setTotalAmount(parsed.totalAmount || '');
      setPeople(parsed.people || []);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ totalAmount, people })
    );
  }, [totalAmount, people]);

  const handleAddPerson = () => {
    if (!name) return;
    setPeople([...people, { name, phone, paid: false }]);
    setName('');
    setPhone('');
  };

  const handleImportContact = async () => {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      alert('Contact Picker API only works in supported browsers like Chrome Mobile.');
      return;
    }

    try {
      const contacts = await (navigator as any).contacts.select(['name', 'tel'], {
        multiple: false,
      });

      if (contacts.length > 0) {
        const c = contacts[0];
        setName(c.name?.[0] || '');
        setPhone(c.tel?.[0]?.replace(/\D/g, '') || '');
      }
    } catch (err) {
      console.error('Contact import failed:', err);
    }
  };

  const equalShare =
    totalAmount !== '' && people.length > 0
      ? Number(totalAmount) / people.length
      : 0;

  const handleTogglePaid = (index: number) => {
    setPeople((prev) =>
      prev.map((p, i) => (i === index ? { ...p, paid: !p.paid } : p))
    );
  };

  const handleDeletePerson = (index: number) => {
    setPeople((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    const confirmDelete = window.confirm('Delete total and all people?');
    if (confirmDelete) {
      setTotalAmount('');
      setPeople([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <Header />

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Users2 className="text-white" />
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Split Expenses
            </h1>
          </div>
          <MenuButton />
        </div>

        {/* Amount Section */}
        <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Total Amount Spent</h2>
            <button
              onClick={handleClearAll}
              className="text-red-400 hover:text-red-600 flex items-center gap-1 text-sm"
            >
              <Trash2 size={16} /> Delete All
            </button>
          </div>
          <input
            type="number"
            placeholder="Enter total amount (₹)"
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={totalAmount}
            onChange={(e) =>
              setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))
            }
          />
        </div>

        {/* Add People Section */}
        <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Add People</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="flex justify-between gap-3">
              <button
                onClick={handleImportContact}
                className="flex-1 bg-blue-800 hover:bg-blue-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Contact size={18} /> Import Number
              </button>
              <button
                onClick={handleAddPerson}
                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold text-sm transition-all"
              >
                Add Person
              </button>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {people.length > 0 && totalAmount !== '' && (
          <div className="bg-[#111]/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Each person owes: ₹{equalShare.toFixed(2)}
            </h2>
            <ul className="space-y-3">
              {people.map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-4 bg-white/5 rounded-md"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-400 mb-1">
                      Owes ₹{equalShare.toFixed(2)}
                    </p>
                    <label className="text-sm flex items-center gap-2 text-green-400">
                      <input
                        type="checkbox"
                        checked={p.paid}
                        onChange={() => handleTogglePaid(i)}
                        className="accent-green-500"
                      />
                      Mark as Paid
                    </label>
                  </div>
                  <div className="text-right space-y-2">
                    {p.phone && !p.paid && (
                      <Link
                        href={`https://wa.me/${p.phone}?text=${encodeURIComponent(
                          `Hi ${p.name}, you owe ₹${equalShare.toFixed(
                            2
                          )} for the shared expense. Please settle when you can 😊.From MyBudegtory.`
                        )}`}
                        target="_blank"
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold"
                      >
                        Send Msg
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeletePerson(i)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
