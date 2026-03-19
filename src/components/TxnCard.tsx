"use client";

import { motion } from "framer-motion";
import React from "react";

interface TxnCardProps {
  title: string;
  amount: string;
  color: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export function TxnCard({ title, amount, color, icon, subtitle }: TxnCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group"
    >
      {/* Gradient border glow wrapper */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />

      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-800 border border-gray-700/60 group-hover:border-indigo-500/40 rounded-xl p-4 shadow-lg group-hover:shadow-indigo-500/10 group-hover:shadow-xl transition-all duration-300">
        {/* Icon top-left */}
        <div className="flex items-start justify-between mb-3">
          {icon && (
            <div className="bg-white/5 border border-white/10 p-2 rounded-lg">
              {icon}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-400 tracking-tight mb-0.5">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-gray-500 mb-1">{subtitle}</p>
        )}

        {/* Amount - big and bold */}
        <p className={`text-3xl font-black tracking-tight ${color}`}>
          {amount}
        </p>
      </div>
    </motion.div>
  );
}
