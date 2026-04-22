import React from "react";
import {
  Utensils,
  Briefcase,
  Shirt,
  HeartPulse,
  ReceiptText,
  Clapperboard,
  Plane,
  Route,
  BanknoteArrowUp,
  Umbrella,
} from "lucide-react";

export const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string; hex: string }
> = {
  Food: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    hex: "#f97316",
  },
  Outing: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    hex: "#3b82f6",
  },
  Clothes: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    hex: "#a855f7",
  },
  Medical: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    hex: "#ef4444",
  },
  Bills: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    hex: "#eab308",
  },
  Entertainment: {
    bg: "bg-pink-500/20",
    text: "text-pink-400",
    border: "border-pink-500/30",
    hex: "#ec4899",
  },
  Travel: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    hex: "#06b6d4",
  },
  SMM: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    hex: "#10b981",
  },
  Vacation: {
    bg: "bg-lime-500/20",
    text: "text-lime-400",
    border: "border-lime-500/30",
    hex: "#84cc16",
  },
  Others: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
    hex: "#6b7280",
  },
  Other: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
    hex: "#6b7280",
  },
};

export const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; size?: number; color?: string }>
> = {
  Food: Utensils,
  Outing: Briefcase,
  Clothes: Shirt,
  Medical: HeartPulse,
  Bills: ReceiptText,
  Entertainment: Clapperboard,
  Travel: Plane,
  Vacation: Umbrella,
  SMM: Route,
  Others: BanknoteArrowUp,
  Other: BanknoteArrowUp,
};

export const CATEGORIES: { name: string; icon: React.ComponentType<{ className?: string; size?: number }> }[] = [
  { name: "Food",          icon: Utensils },
  { name: "Outing",        icon: Briefcase },
  { name: "Clothes",       icon: Shirt },
  { name: "Travel",        icon: Plane },
  { name: "Vacation",      icon: Umbrella },
  { name: "Medical",       icon: HeartPulse },
  { name: "Entertainment", icon: Clapperboard },
  { name: "Bills",         icon: ReceiptText },
  { name: "SMM",           icon: Route },
  { name: "Others",        icon: BanknoteArrowUp },
];
