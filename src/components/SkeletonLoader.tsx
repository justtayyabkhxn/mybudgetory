"use client";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`bg-gradient-to-br from-gray-800/60 via-gray-900/60 to-gray-800/60 rounded-xl p-4 shadow-lg animate-pulse ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-32 bg-gray-700/60 rounded-md" />
        <div className="h-6 w-6 bg-gray-700/60 rounded-full" />
      </div>
      <div className="h-9 w-24 bg-gray-700/60 rounded-md mt-2" />
    </div>
  );
}

export function SkeletonTransactionRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex justify-between items-center p-4 bg-white/2 border border-gray-800 rounded-xl animate-pulse ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 bg-gray-700/60 rounded-full" />
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-700/60 rounded-md" />
          <div className="h-3 w-40 bg-gray-700/40 rounded-md" />
          <div className="h-3 w-24 bg-gray-700/40 rounded-md" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="h-4 w-16 bg-gray-700/60 rounded-md ml-auto" />
        <div className="h-3 w-10 bg-gray-700/40 rounded-md ml-auto" />
      </div>
    </div>
  );
}
