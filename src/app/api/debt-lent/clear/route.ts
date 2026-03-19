import connectDB from "@/lib/dbConnect";
import DebtLent from "@/models/DebtLent";
import { getUserId, unauthorized, serverError } from "@/lib/auth";

export async function PATCH(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  try {
    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await connectDB();

    // userId check in query prevents clearing another user's entry
    const updated = await DebtLent.findOneAndUpdate(
      { _id: id, userId },
      { status: "cleared" },
      { new: true }
    );

    if (!updated) {
      return Response.json({ error: "Entry not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch {
    return serverError("Server error");
  }
}
