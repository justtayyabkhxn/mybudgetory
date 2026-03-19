import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Participant from "@/models/Participant";
import { getUserId, unauthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  await dbConnect();
  try {
    const { name, eventId, color } = await req.json();
    if (!name || !eventId) {
      return NextResponse.json({ error: "Name and eventId are required" }, { status: 400 });
    }
    const participant = new Participant({ name, eventId, color });
    await participant.save();
    return NextResponse.json({ participant }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
