import connectDB from '@/lib/dbConnect';
import DebtLent from '@/models/DebtLent';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID is required in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();

    const updated = await DebtLent.findByIdAndUpdate(
      id,
      { status: 'cleared' },
      { new: true }
    );

    if (!updated) {
      return new Response(
        JSON.stringify({ error: 'Entry not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Server error'+err }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}