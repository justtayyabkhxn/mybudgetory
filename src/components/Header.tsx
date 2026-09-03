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
        {/* Wordmark — ink display weight with the single brand accent as the
            full stop. The lime green never carries the whole word. */}
        <motion.span
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block text-4xl md:text-5xl font-extrabold tracking-tight text-ink transition-all duration-300"
        >
          MyBudgetory<span className="text-primary">.</span>
        </motion.span>
      </Link>

      <motion.p
        className="text-sm text-body font-medium mt-1 mb-3 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <CreditCard size={14} className="text-ink-deep" />
        Your Budget.
        <ScrollText size={14} className="text-ink-deep" />
        Your Story.
      </motion.p>
    </motion.div>
  );
}
