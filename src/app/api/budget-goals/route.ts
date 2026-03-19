import connectDB from "@/lib/dbConnect";
import BudgetGoal from "@/models/BudgetGoal";
import { getUserId, unauthorized, serverError } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || "");
  const year  = parseInt(searchParams.get("year")  || "");

  await connectDB();
  try {
    const query: Record<string, unknown> = { userId };
    if (!isNaN(month)) query.month = month;
    if (!isNaN(year))  query.year  = year;
    const goals = await BudgetGoal.find(query);
    return Response.json({ goals });
  } catch {
    return serverError("Failed to fetch budget goals");
  }
}

export async function POST(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  const { category, limitAmount, month, year } = await req.json();
  if (!category || limitAmount === undefined || month === undefined || year === undefined) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();
  try {
    const goal = await BudgetGoal.findOneAndUpdate(
      { userId, category, month, year },
      { userId, category, limitAmount, month, year },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return Response.json({ goal });
  } catch {
    return serverError("Failed to save budget goal");
  }
}

export async function DELETE(req: Request) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  const { category, month, year } = await req.json();
  if (!category || month === undefined || year === undefined) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();
  try {
    await BudgetGoal.findOneAndDelete({ userId, category, month, year });
    return Response.json({ success: true });
  } catch {
    return serverError("Failed to delete budget goal");
  }
}
