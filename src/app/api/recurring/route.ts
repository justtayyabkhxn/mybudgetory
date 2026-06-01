import connectDB from "@/lib/dbConnect";
import RecurringTransaction from "@/models/RecurringTransaction";
import { encrypt, decrypt } from "@/utils/crypto";
import { getUserId, unauthorized, serverError } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  await connectDB();
  try {
    const records = await RecurringTransaction.find({ userId }).sort({ createdAt: -1 });
    const decrypted = records.map((r) => ({
      ...r.toObject(),
      title: decrypt(r.title),
      amount: parseFloat(decrypt(r.amount)),
    }));
    return Response.json({ recurring: decrypted });
  } catch {
    return serverError("Failed to fetch recurring transactions");
  }
}

export async function POST(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  const { title, amount, category, type, paymentMode, frequency, nextDate } = await req.json();
  if (!title || !amount || !category || !type || !paymentMode || !frequency || !nextDate) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();
  try {
    const record = await RecurringTransaction.create({
      userId,
      title: encrypt(title),
      amount: encrypt(amount.toString()),
      category, type, paymentMode, frequency,
      nextDate: new Date(nextDate),
    });
    return Response.json({ recurring: record }, { status: 201 });
  } catch {
    return serverError("Failed to create recurring transaction");
  }
}

export async function DELETE(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  await connectDB();
  try {
    await RecurringTransaction.findOneAndDelete({ _id: id, userId });
    return Response.json({ success: true });
  } catch {
    return serverError("Failed to delete recurring transaction");
  }
}

export async function PATCH(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  const { id, isActive, nextDate } = await req.json();
  if (!id || (isActive === undefined && !nextDate)) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (isActive !== undefined) update.isActive = isActive;
  if (nextDate) update.nextDate = new Date(nextDate);

  await connectDB();
  try {
    const updated = await RecurringTransaction.findOneAndUpdate(
      { _id: id, userId },
      update,
      { new: true }
    );
    if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ recurring: updated });
  } catch {
    return serverError("Failed to update recurring transaction");
  }
}
