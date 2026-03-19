"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 pb-18 md:pb-10 border-t border-white/6">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-indigo-400" />
          <span className="text-sm font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            MyBudgetory
          </span>
        </div>

        {/* Tagline */}
        <p className="text-[11px] text-gray-600 font-medium tracking-widest uppercase">
          Your Budget. Your Story.
        </p>

        {/* Credit */}
        <p className="text-xs text-gray-600">
          Crafted by{" "}
          <Link
            href="https://justtayyabkhan.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-indigo-400 font-semibold transition-colors"
          >
            Tayyab Khan
          </Link>{" "}
          · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
