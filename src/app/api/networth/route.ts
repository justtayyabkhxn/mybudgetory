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
    const history = (doc?.history ?? [])
      .slice()
      .sort((a: { date: Date }, b: { date: Date }) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    return NextResponse.json({
      bankBalance: doc?.bankBalance ?? 0,
      history,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
