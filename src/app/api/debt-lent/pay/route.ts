import connectDB from "@/lib/dbConnect";
import DebtLent from "@/models/DebtLent";
import { getUserId, unauthorized, serverError } from "@/lib/auth";

export async function PATCH(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  const { id, amount } = await req.json();
  if (!id || !amount || Number(amount) <= 0) {
    return Response.json({ error: "Valid id and amount required" }, { status: 400 });
  }

  await connectDB();
  try {
    const entry = await DebtLent.findOne({ _id: id, userId });
    if (!entry) return Response.json({ error: "Entry not found" }, { status: 404 });

    const newPaid = Math.min(entry.paidAmount + Number(amount), entry.amount);
    const fullyPaid = newPaid >= entry.amount;

    const updated = await DebtLent.findOneAndUpdate(
      { _id: id, userId },
      { paidAmount: newPaid, ...(fullyPaid ? { status: "cleared" } : {}) },
      { new: true }
    );

    return Response.json(updated);
  } catch {
    return serverError("Failed to log payment");
  }
}
