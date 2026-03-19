// app/api/transactions/route.ts
import connectDB from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { encrypt, decrypt } from "@/utils/crypto";
import { getUserId, unauthorized, serverError } from "@/lib/auth";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const userId = getUserId(auth);
  if (!userId) return unauthorized();

  const { title, amount, category, type, date, comment, paymentMode } =
    await req.json();

  await connectDB();

  try {
    const tx = await Transaction.create({
      userId,
      title: encrypt(title),
      amount: encrypt(amount.toString()),
      category,
      type,
      date: new Date(date),
      comment: encrypt(comment || ""),
      paymentMode,
    });

    return new Response(JSON.stringify({ transaction: tx }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to add transaction";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const userId = getUserId(auth);
  if (!userId) return unauthorized();

  await connectDB();

  try {
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    const decryptedTxns = transactions.map(txn => ({
      ...txn.toObject(),
      title: decrypt(txn.title),
      amount: parseFloat(decrypt(txn.amount)),
      comment: decrypt(txn.comment),
    }));

    return new Response(JSON.stringify({ transactions: decryptedTxns }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return serverError("Failed to fetch transactions");
  }
}

export async function DELETE(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const userId = getUserId(auth);
  if (!userId) return unauthorized();

  await connectDB();

  try {
    await Transaction.deleteMany({ userId });
    return new Response(
      JSON.stringify({ message: "All transactions deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete transactions";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
