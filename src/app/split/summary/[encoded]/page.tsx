'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WalletMinimal } from 'lucide-react';
import Link from 'next/link';
import GetStartedButton from '@/components/GetStarted';
import Header from '@/components/Header';

type Person = {
  name: string;
  phone: string;
};

type GroupData = {
  total: number;
  people: Person[];
};

export default function SummaryPage() {
  const { encoded } = useParams();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!encoded || typeof encoded !== 'string') {
      setError(true);
      return;
    }

    try {
      const decoded = atob(decodeURIComponent(encoded));
      const json = JSON.parse(decoded);
      if (json.total && Array.isArray(json.people)) {
        setGroup(json);
      } else {
        throw new Error('Invalid format');
      }
    } catch (err) {
      console.error('Decoding error:', err);
      setError(true);
    }
  }, [encoded]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Invalid or Corrupt Link
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const { total, people } = group;
  const amount = total / people.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6 sm:p-10">
        <Header/>
      <div className="max-w-xl mx-auto bg-[#111]/80 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <WalletMinimal />
          <h1 className="text-3xl font-bold text-green-300">Shared Expense</h1>
        </div>

        <p className="text-gray-300 mb-2">
          Total Amount: <span className="font-semibold">₹{total}</span>
        </p>
        <p className="text-gray-300 mb-2">
          Total Members: <span className="font-semibold">{people.length}</span>
        </p>
        <p className="text-gray-300 mb-6">
          Your Share: <span className="font-semibold">₹{amount.toFixed(2)}</span>
        </p>

        <Link
          href={`upi://pay?pa=tayyabk2002-1@oksbi&pn=Tayyab%20Khan&am=${amount.toFixed(
            2
          )}&cu=INR`}
          target="_blank"
          className="block w-full bg-green-300 text-black hover:bg-green-700 text-center px-4 py-3 rounded text-lg font-semibold"
        >
          Pay Now
        </Link>
      </div>
      <GetStartedButton/>
    </div>
  );
}
