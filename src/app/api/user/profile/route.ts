import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/models/User";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(request: Request) {
  // Auth required — user can only fetch their own profile
  const userId = getUserId(request.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  try {
    await connectDB();
    const user = await User.findById(userId).select("-password");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
