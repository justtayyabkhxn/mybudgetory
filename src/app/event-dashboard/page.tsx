"use client";
import Link from "next/link";

export default function EventDashboard() {


  return (
    <div className="min-h-screen text-ink p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <section className="text-center max-w-2xl mx-auto space-y-6 mb-2">
          <h1 className="text-4xl md:text-5xl text-ink-deep font-extrabold">
            <Link href="/">📅 MyBudgetory</Link>
          </h1>
        </section>
        <section className="flex items-center justify-center mt-5 text-amber-600">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-center">
              &quot;Under Developement&quot;
            </h1>
          </div>
        </section>
          <h2 className="text-2xl font-extrabold tracking-tight mt-5 text-center text-ink-deep">
            <Link href="/" className="bg-canvas-soft/80 hover:bg-primary-pale p-1.5 rounded-lg">Go Home</Link>
          </h2>
      </div>
    </div>
  );
}
