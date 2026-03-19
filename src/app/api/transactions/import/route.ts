import connectDB from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import { encrypt } from '@/utils/crypto';
import { getUserId, unauthorized } from '@/lib/auth';

export async function POST(req: Request) {
  const userId = getUserId(req.headers.get('authorization') || '');
  if (!userId) return unauthorized();

  let transactions;
  try {
    transactions = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!Array.isArray(transactions)) {
    return Response.json({ error: 'Expected an array of transactions' }, { status: 400 });
  }
  if (transactions.length > 1000) {
    return Response.json({ error: 'Import limited to 1000 transactions at a time' }, { status: 400 });
  }

  await connectDB();

  let importedCount = 0;

  try {
    for (const tx of transactions) {
      const { title, amount, category, type, date, comment, paymentMode } = tx;

      // Basic validation
      if (
        !title ||
        typeof amount !== 'number' ||
        !category ||
        !type ||
        !date
      ) {
        continue;
      }

      await Transaction.create({
        userId,
        title: encrypt(title),
        amount: encrypt(amount.toString()),
        category,
        type,
        date: new Date(date),
        comment: encrypt(comment || ''),
        paymentMode: paymentMode || 'Cash',
      });

      importedCount++;
    }

    return new Response(
      JSON.stringify({ message: `Imported ${importedCount} transactions.` }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Failed to import transactions' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
