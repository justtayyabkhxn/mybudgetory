import connectDB from "@/lib/dbConnect";
import DebtLent from "@/models/DebtLent";
import { getUserId, unauthorized, serverError } from "@/lib/auth";

export async function POST(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  const { person, amount, type, status, date, comment } = await req.json();
  await connectDB();
  try {
    const entry = await DebtLent.create({
      userId, person, amount: Number(amount), type, status,
      date: new Date(date), comment,
    });
    return Response.json({ entry }, { status: 201 });
  } catch {
    return serverError("Failed to add entry");
  }
}

export async function GET(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  await connectDB();
  try {
    const entries = await DebtLent.find({ userId }).sort({ date: -1 });
    return Response.json(entries);
  } catch {
    return serverError("Failed to fetch entries");
  }
}

export async function DELETE(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  const { id } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  await connectDB();
  try {
    const deleted = await DebtLent.findOneAndDelete({ _id: id, userId });
    if (!deleted) return Response.json({ error: "Entry not found" }, { status: 404 });
    return Response.json(deleted);
  } catch {
    return serverError("Failed to delete entry");
  }
}
