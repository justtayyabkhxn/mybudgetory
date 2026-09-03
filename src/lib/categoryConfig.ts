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

// Categorical scale for spend categories, driven by the --color-cat-*
// tokens in globals.css so the palette flips with the theme. Every hue is
// drawn from the Wise palette; the lime brand accent is deliberately absent
// because it belongs to primary CTAs, never to data marks.
//
// `hex` is the light-theme value, used only as the fallback for canvas
// charts, which resolve the live token through catColor() at paint time.
export const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string; hex: string; token: string }
> = {
  Food: {
    bg: "bg-cat-food/10",
    text: "text-cat-food",
    border: "border-cat-food/25",
    hex: "#b86700",
    token: "--color-cat-food",
  },
  Outing: {
    bg: "bg-cat-outing/10",
    text: "text-cat-outing",
    border: "border-cat-outing/25",
    hex: "#0b6f96",
    token: "--color-cat-outing",
  },
  Clothes: {
    bg: "bg-cat-clothes/10",
    text: "text-cat-clothes",
    border: "border-cat-clothes/25",
    hex: "#163300",
    token: "--color-cat-clothes",
  },
  Medical: {
    bg: "bg-cat-medical/10",
    text: "text-cat-medical",
    border: "border-cat-medical/25",
    hex: "#d03238",
    token: "--color-cat-medical",
  },
  Bills: {
    bg: "bg-cat-bills/10",
    text: "text-cat-bills",
    border: "border-cat-bills/25",
    hex: "#4a3b1c",
    token: "--color-cat-bills",
  },
  Entertainment: {
    bg: "bg-cat-entertainment/10",
    text: "text-cat-entertainment",
    border: "border-cat-entertainment/25",
    hex: "#a72027",
    token: "--color-cat-entertainment",
  },
  Travel: {
    bg: "bg-cat-travel/10",
    text: "text-cat-travel",
    border: "border-cat-travel/25",
    hex: "#2ead4b",
    token: "--color-cat-travel",
  },
  SMM: {
    bg: "bg-cat-smm/10",
    text: "text-cat-smm",
    border: "border-cat-smm/25",
    hex: "#054d28",
    token: "--color-cat-smm",
  },
  Vacation: {
    bg: "bg-cat-vacation/10",
    text: "text-cat-vacation",
    border: "border-cat-vacation/25",
    hex: "#0e8fbd",
    token: "--color-cat-vacation",
  },
  Others: {
    bg: "bg-cat-other/10",
    text: "text-cat-other",
    border: "border-cat-other/25",
    hex: "#868685",
    token: "--color-cat-other",
  },
  Other: {
    bg: "bg-cat-other/10",
    text: "text-cat-other",
    border: "border-cat-other/25",
    hex: "#868685",
    token: "--color-cat-other",
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
