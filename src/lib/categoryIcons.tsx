// lib/categoryIcons.tsx
"use client"
import {
  Utensils,
  ShoppingCart,
  HeartPulse,
  GraduationCap,
  Plane,
  Car,
  Wallet,
  Banknote,
  Shield,
  Bitcoin,
  Gift,
  Building2,
  BanknoteArrowUp,
} from "lucide-react";
import { JSX } from "react";

export const categoryIcons: Record<string, () => JSX.Element> = {
  Food: () => <Utensils className="w-6 h-6 text-warning-deep" />,
  Shopping: () => <ShoppingCart className="w-6 h-6 text-pink-400" />,
  Health: () => <HeartPulse className="w-6 h-6 text-red-500" />,
  Education: () => <GraduationCap className="w-6 h-6 text-blue-400" />,
  Travel: () => <Plane className="w-6 h-6 text-teal-400" />,
  Transport: () => <Car className="w-6 h-6 text-warning-deep" />,
  Bills: () => <Wallet className="w-6 h-6 text-gray-300" />,
  Salary: () => <Banknote className="w-6 h-6 text-green-400" />,
  Insurance: () => <Shield className="w-6 h-6 text-indigo-400" />,
  Investment: () => <Bitcoin className="w-6 h-6 text-warning-deep" />,
  Gift: () => <Gift className="w-6 h-6 text-violet-400" />,
  Rent: () => <Building2 className="w-6 h-6 text-ink-deep" />,
};

export const fallbackIcon = () => (
  <BanknoteArrowUp className="w-6 h-6 text-indigo-400" />
);
