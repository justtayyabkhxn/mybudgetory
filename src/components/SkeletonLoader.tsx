"use client";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`skeleton-shimmer bg-canvas/80 rounded-xl p-4 shadow-lg ${className}`}
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
      className={`skeleton-shimmer flex justify-between items-center p-4 bg-canvas/80 rounded-xl ${className}`}
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
