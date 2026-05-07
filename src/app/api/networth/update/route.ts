import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import NetWorth from "@/models/NetWorth";
import { getUserId, unauthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  try {
    await connectDB();
    const { newBalance, paymentMode } = await req.json();
    const newAmount = parseFloat(newBalance);
    if (isNaN(newAmount)) {
      return NextResponse.json({ error: "Invalid balance amount" }, { status: 400 });
    }

    const existing = await NetWorth.findOne({ userId });
    const oldBalance = existing?.bankBalance ?? 0;
    const adjustment = newAmount - oldBalance;

    const updated = await NetWorth.findOneAndUpdate(
      { userId },
      { $set: { bankBalance: newAmount, lastUpdated: new Date() } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ bankBalance: updated.bankBalance, message: "Balance updated" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
