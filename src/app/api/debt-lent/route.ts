import jwt from 'jsonwebtoken';
import connectDB from '@/lib/dbConnect';
import DebtLent from '@/models/DebtLent';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Helper: extract userId from token
function getUserId(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const userId = getUserId(auth);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { person, amount, type, status, date, comment } = await req.json(); // ✅ include 'person'
  await connectDB();

  try {
    const entry = await DebtLent.create({
      userId,
      person, // ✅ required field
      amount: Number(amount),
      type,
      status,
      date: new Date(date),
      comment,
    });

    return new Response(JSON.stringify({ entry }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to add entry';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


// GET handler for /api/debt-lent
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const userId = getUserId(auth);
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await connectDB();
  const entries = await DebtLent.find({ userId }).sort({ date: -1 });
  return new Response(JSON.stringify(entries), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}


export async function DELETE(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const userId = getUserId(auth);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = await req.json();
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await connectDB();

  try {
    const deleted = await DebtLent.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Entry not found or unauthorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(deleted), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to delete entry';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
