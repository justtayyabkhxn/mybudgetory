import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/dbConnect";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Asset from "@/models/Asset";
import NetWorth from "@/models/NetWorth";
import BudgetGoal from "@/models/BudgetGoal";
import DebtLent from "@/models/DebtLent";
import RecurringTransaction from "@/models/RecurringTransaction";
import Expense from "@/models/Expense";
import Event from "@/models/Event";
import Participant from "@/models/Participant";
import { getUserId, unauthorized } from "@/lib/auth";

/**
 * DELETE /api/user — permanently deletes the signed-in account and every
 * record tied to it. The password is re-checked so a stolen or unlocked
 * session alone can't wipe an account.
 */
export async function DELETE(req: NextRequest) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return unauthorized();

  try {
    const { password } = await req.json().catch(() => ({}));
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const ok = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!ok) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    const uid = new mongoose.Types.ObjectId(userId);

    // Split events the user created, with their participants and entries.
    // Event entries share the "transactions" collection with personal
    // transactions (both models are named "Transaction"), so they are removed
    // through the raw collection by eventId.
    const eventIds = (await Event.find({ createdBy: uid }).select("_id").lean())
      .map((e: { _id: unknown }) => e._id);
    if (eventIds.length > 0) {
      await Transaction.collection.deleteMany({ eventId: { $in: eventIds } });
      await Participant.deleteMany({ eventId: { $in: eventIds } });
      await Event.deleteMany({ _id: { $in: eventIds } });
    }

    await Promise.all([
      Transaction.deleteMany({ userId: uid }),
      Asset.deleteMany({ userId: uid }),
      NetWorth.deleteMany({ userId }),
      BudgetGoal.deleteMany({ userId: uid }),
      DebtLent.deleteMany({ userId: uid }),
      RecurringTransaction.deleteMany({ userId: uid }),
      Expense.deleteMany({ userId: uid }),
    ]);
    await User.deleteOne({ _id: uid });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
