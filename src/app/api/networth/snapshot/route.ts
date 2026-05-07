import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import NetWorth from "@/models/NetWorth";
import { getUserId, unauthorized } from "@/lib/auth";

/** Returns the UTC timestamp for Monday 00:00 of the current week. */
function getMondayMidnightUTC(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysToMonday,
    0, 0, 0, 0,
  ));
  return monday;
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  try {
    await connectDB();

    const doc = await NetWorth.findOne({ userId });
    if (!doc) return NextResponse.json({ message: "No record found" });

    const monday = getMondayMidnightUTC();
    const mondayMs = monday.getTime();
    const currentBalance = doc.bankBalance;

    // Find if an entry for this Monday already exists
    const existingEntry = doc.history.find(
      (h: { date: Date; balance: number }) => new Date(h.date).getTime() === mondayMs
    );

    if (existingEntry) {
      // Update the existing Monday entry in-place
      await NetWorth.findOneAndUpdate(
        { userId, "history._id": existingEntry._id },
        { $set: { "history.$.balance": currentBalance } }
      );
    } else {
      // No entry for this Monday yet — insert one
      await NetWorth.findOneAndUpdate(
        { userId },
        { $push: { history: { date: monday, balance: currentBalance } } }
      );
    }

    return NextResponse.json({ date: monday, balance: currentBalance });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
