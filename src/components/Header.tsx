"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, ScrollText } from "lucide-react";

export default function Header() {
  return (
    <motion.div
      className="flex flex-col items-center text-center space-y-2"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <Link href="/">
        <motion.span
          whileHover={{ scale: 1.05, rotate: 0.5 }}
          whileTap={{ scale: 0.95 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent transition-all duration-300"
        >
          MyBudgetory
        </motion.span>
      </Link>

      <motion.p
        className="text-sm text-gray-500 font-semibold tracking-tight mt-1 mb-3 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <CreditCard size={14} className="text-violet-500" />
        Your Budget.
        <ScrollText size={14} className="text-indigo-500" />
        Your Story.
      </motion.p>
    </motion.div>
  );
}
