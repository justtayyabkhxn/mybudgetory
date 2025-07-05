"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { WalletMinimal } from 'lucide-react';
import Link from 'next/link';
import GetStartedButton from '@/components/GetStarted';
import Header from '@/components/Header';

interface Payload {
  total: number;
  name: string;
  phone: string;
  share: number;
  description:string
}

export default function SummaryPage() {
  const { encoded } = useParams();
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!encoded || typeof encoded !== 'string') {
      setError(true);
      return;
    }

    try {
      const decoded = atob(decodeURIComponent(encoded));
      const parsed = JSON.parse(decoded);

      if (
        typeof parsed.total === 'number' &&
        typeof parsed.name === 'string' &&
        typeof parsed.phone === 'string' &&
        typeof parsed.share === 'number'
      ) {
        setData(parsed);
      } else {
        throw new Error('Invalid data format');
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const { total, name, share,description } = data;
  const members=total/share;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6 sm:p-10">
      <Header />
      <div className="max-w-xl mx-auto bg-[#111]/80 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <WalletMinimal />
          <h1 className="text-3xl font-bold text-green-300">Shared Expense</h1>
        </div>
        <h1 className="text-gray-300 mb-4 text-4xl font-extrabold tracking-tighter">
          Hi <span className="font-extrabold text-amber-300">{name || 'there'}</span> 👋
        </h1>
        <p className="text-gray-300 mb-2">
          Description: <span className="font-semibold">{description}</span>
        </p>
        <p className="text-gray-300 mb-2">
          Total Members: <span className="font-semibold">{members}</span>
        </p>
        <p className="text-gray-300 mb-2">
          Total Amount: <span className="font-semibold">₹{total}</span>
        </p>
        <p className="text-gray-300 mb-6">
          Your Share: <span className="font-semibold">₹{share.toFixed(2)}</span>
        </p>

        <Link
          href={`upi://pay?pa=tayyabk2002-1@oksbi&pn=Tayyab%20Khan&am=${share.toFixed(
            2
          )}&cu=INR`}
          target="_blank"
          className="block w-full bg-green-300 text-black hover:bg-green-700 text-center px-4 py-3 rounded text-lg font-semibold"
        >
          Pay Now
        </Link>
      </div>
      <GetStartedButton />
    </div>
  );
}
