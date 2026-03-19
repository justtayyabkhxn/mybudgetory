import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import NetWorth from "@/models/NetWorth";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  try {
    await connectDB();
    const doc = await NetWorth.findOne({ userId });
    return NextResponse.json({ bankBalance: doc?.bankBalance ?? 0 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
