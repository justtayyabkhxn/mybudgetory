"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    try { JSON.parse(atob(token.split(".")[1])); }
    catch { localStorage.removeItem("token"); router.push("/login"); }
  }, [router]);
}
